/**
 * Lavern — interactive onboarding.
 *
 *   npm run setup
 *
 * Picks a provider (local Ollama / Anthropic / Mistral), validates the
 * choice, writes `.env`, and ensures the data directories exist.
 *
 * Kept dependency-light and self-contained: no imports from `src/` so
 * it runs cleanly on a fresh clone before `.env` exists.
 */

import { execSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { platform } from 'node:os';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(repoRoot, '.env');
const envExamplePath = resolve(repoRoot, '.env.example');

// ── Bootstrap ──────────────────────────────────────────────────────────────
// If someone ran `npm run setup` on a fresh clone without `./setup.sh`,
// `prompts` won't be in node_modules yet. Install deps before importing it.
if (!existsSync(resolve(repoRoot, 'node_modules', 'prompts'))) {
  console.log('→ Installing dependencies (first run, ~1–2 min)…\n');
  const r = spawnSync('npm', ['install', '--legacy-peer-deps'], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
  if (r.status !== 0) {
    console.error('\n✗ npm install failed. See errors above.');
    process.exit(1);
  }
  console.log('');
}

const { default: prompts } = await import('prompts');

const c = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m',
  cyan: '\x1b[36m', magenta: '\x1b[35m',
};
const log = {
  info: (m: string) => console.log(`${c.cyan}→${c.reset} ${m}`),
  ok: (m: string) => console.log(`${c.green}✓${c.reset} ${m}`),
  warn: (m: string) => console.log(`${c.yellow}!${c.reset} ${m}`),
  err: (m: string) => console.error(`${c.red}✗${c.reset} ${m}`),
  step: (m: string) => console.log(`\n${c.bold}${c.magenta}${m}${c.reset}`),
};

function banner() {
  console.log(`
${c.bold}${c.magenta}╭──────────────────────────────────────────╮
│           Lavern · Onboarding            │
│      An agentic law firm. Yours.         │
╰──────────────────────────────────────────╯${c.reset}
`);
}

function abortOnCancel(value: unknown) {
  if (value === undefined) {
    log.warn('Setup cancelled.');
    process.exit(1);
  }
}

// ── Prereq checks ──────────────────────────────────────────────────────────

function checkNode() {
  const major = parseInt(process.versions.node.split('.')[0]!, 10);
  if (major < 20) {
    log.err(`Node ${process.versions.node} detected. Lavern needs Node 20 or newer.`);
    log.info('Install from https://nodejs.org/ or via nvm: `nvm install 20`');
    process.exit(1);
  }
  log.ok(`Node ${process.versions.node}`);
}

function hasBin(name: string): boolean {
  try {
    const probe = platform() === 'win32' ? 'where' : 'which';
    execSync(`${probe} ${name}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// ── viz/ install ───────────────────────────────────────────────────────────

function installVizDeps() {
  const vizNodeModules = resolve(repoRoot, 'viz', 'node_modules');
  if (existsSync(vizNodeModules)) {
    log.ok('viz/ dependencies already installed');
    return;
  }
  log.info('Installing viz/ (dashboard) dependencies — this may take a minute…');
  const result = spawnSync('npm', ['install', '--legacy-peer-deps'], {
    cwd: resolve(repoRoot, 'viz'),
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    log.err('viz install failed. Re-run `cd viz && npm install` to debug.');
    process.exit(1);
  }
  log.ok('viz/ dependencies installed');
}

// ── Provider: Local (Ollama) ───────────────────────────────────────────────

async function pingOllama(url = 'http://localhost:11434'): Promise<boolean> {
  try {
    const r = await fetch(`${url}/api/tags`, { signal: AbortSignal.timeout(2000) });
    return r.ok;
  } catch {
    return false;
  }
}

async function ollamaHasModel(name: string, url = 'http://localhost:11434'): Promise<boolean> {
  try {
    const r = await fetch(`${url}/api/tags`, { signal: AbortSignal.timeout(2000) });
    if (!r.ok) return false;
    const data = (await r.json()) as { models?: { name: string }[] };
    return (data.models ?? []).some((m) => m.name === name || m.name.startsWith(`${name}:`));
  } catch {
    return false;
  }
}

async function setupLocal(): Promise<Record<string, string>> {
  log.step('Local provider (Ollama · on-device)');
  const model = 'gemma4:e4b';

  if (!hasBin('ollama')) {
    log.warn('Ollama not detected on this machine.');
    const os = platform();
    let installCmd: string | null = null;
    let installLabel = '';

    if (os === 'darwin' && hasBin('brew')) {
      installCmd = 'brew install ollama';
      installLabel = 'Install via Homebrew (`brew install ollama`)';
    } else if (os === 'linux') {
      installCmd = 'curl -fsSL https://ollama.com/install.sh | sh';
      installLabel = 'Install via official installer (curl | sh)';
    }

    if (installCmd) {
      const { go } = await prompts({
        type: 'confirm',
        name: 'go',
        message: installLabel + '?',
        initial: true,
      });
      abortOnCancel(go);
      if (go) {
        log.info(`Running: ${installCmd}`);
        const r = spawnSync('sh', ['-c', installCmd], { stdio: 'inherit' });
        if (r.status !== 0) {
          log.err('Ollama install failed. Install manually from https://ollama.com');
          process.exit(1);
        }
      } else {
        log.info('Install Ollama yourself from https://ollama.com then re-run `npm run setup`.');
        process.exit(0);
      }
    } else {
      log.info('No automatic installer for your platform. Download Ollama from https://ollama.com');
      log.info('Then re-run `npm run setup`.');
      process.exit(0);
    }
  } else {
    log.ok('Ollama binary detected');
  }

  // Daemon ping
  if (!(await pingOllama())) {
    log.warn('Ollama daemon is not running at http://localhost:11434');
    log.info('Start it in another terminal: `ollama serve`  (or open the Ollama.app)');
    const { wait } = await prompts({
      type: 'confirm',
      name: 'wait',
      message: 'Continue once Ollama is running?',
      initial: true,
    });
    abortOnCancel(wait);
    if (!(await pingOllama())) {
      log.err('Still cannot reach Ollama. Exiting.');
      process.exit(1);
    }
  }
  log.ok('Ollama daemon reachable');

  // Model pull
  if (await ollamaHasModel(model)) {
    log.ok(`Model ${model} already pulled`);
  } else {
    log.info(`Pulling model ${model} (~3 GB, one-time download)…`);
    const r = spawnSync('ollama', ['pull', model], { stdio: 'inherit' });
    if (r.status !== 0) {
      log.err(`Failed to pull ${model}. Re-run \`ollama pull ${model}\` to debug.`);
      process.exit(1);
    }
    log.ok(`Pulled ${model}`);
  }

  return {
    LAVERN_PROVIDER: 'local',
    LAVERN_LOCAL_URL: 'http://localhost:11434',
    LAVERN_LOCAL_DEFAULT_MODEL: model,
    LAVERN_LOCAL_ROUTER_MODEL: model,
    LAVERN_LOCAL_ASSEMBLY_MODEL: model,
  };
}

// ── Provider: Anthropic ────────────────────────────────────────────────────

async function setupAnthropic(): Promise<Record<string, string>> {
  log.step('Anthropic Cloud (Claude)');
  log.info('Get a key at https://console.anthropic.com/settings/keys');

  const { key } = await prompts({
    type: 'password',
    name: 'key',
    message: 'Paste your Anthropic API key',
    validate: (v: string) =>
      v.startsWith('sk-ant-') ? true : 'Key should start with `sk-ant-`',
  });
  abortOnCancel(key);

  return {
    LAVERN_PROVIDER: 'anthropic',
    ANTHROPIC_API_KEY: key,
  };
}

// ── Provider: Mistral ──────────────────────────────────────────────────────

async function setupMistral(): Promise<Record<string, string>> {
  log.step('Mistral (EU Sovereign)');
  log.info('Get a key at https://console.mistral.ai/api-keys');

  const { key } = await prompts({
    type: 'password',
    name: 'key',
    message: 'Paste your Mistral API key',
    validate: (v: string) => (v.length > 10 ? true : 'Key looks too short'),
  });
  abortOnCancel(key);

  return {
    LAVERN_PROVIDER: 'mistral',
    MISTRAL_API_KEY: key,
  };
}

// ── .env writer ────────────────────────────────────────────────────────────

function writeEnv(values: Record<string, string>) {
  // Start from .env.example so users still see the optional knobs as comments.
  if (!existsSync(envExamplePath)) {
    log.err(`Missing .env.example at ${envExamplePath}`);
    process.exit(1);
  }
  let body = readFileSync(envExamplePath, 'utf8');

  // For each key, either replace `KEY=...` (commented or not) or append.
  for (const [k, v] of Object.entries(values)) {
    const pattern = new RegExp(`^#?\\s*${k}=.*$`, 'm');
    const line = `${k}=${v}`;
    if (pattern.test(body)) body = body.replace(pattern, line);
    else body += `\n${line}\n`;
  }

  // Comment out the OTHER provider lines so only the chosen one is live.
  const provider = values.LAVERN_PROVIDER;
  if (provider !== 'local') {
    body = body.replace(/^LAVERN_PROVIDER=local$/m, '# LAVERN_PROVIDER=local');
  }

  writeFileSync(envPath, body, { mode: 0o600 });
  log.ok('.env written (mode 0600)');
}

function ensureDirs() {
  for (const d of ['data', 'audit-logs', '.shem']) {
    mkdirSync(resolve(repoRoot, d), { recursive: true });
  }
  log.ok('Data directories ready');
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  banner();

  log.step('Checking prerequisites');
  checkNode();
  if (!hasBin('npm')) {
    log.err('npm not found on PATH.');
    process.exit(1);
  }
  log.ok('npm');

  log.step('Workspace');
  installVizDeps();

  // Protect existing .env
  if (existsSync(envPath)) {
    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: '.env already exists. Overwrite?',
      initial: false,
    });
    abortOnCancel(overwrite);
    if (!overwrite) {
      log.info('Keeping existing .env. Skipping provider setup.');
      ensureDirs();
      log.step('Done.');
      log.info('Start the app:  npm run dev -- --serve');
      return;
    }
    copyFileSync(envPath, envPath + '.backup');
    log.ok('Existing .env backed up to .env.backup');
  }

  log.step('Choose a provider');
  const { provider } = await prompts({
    type: 'select',
    name: 'provider',
    message: 'How do you want to run inference?',
    choices: [
      {
        title: 'Local (Ollama)  · on-device, free, private',
        description: 'Runs gemma4:e4b locally. ~3 GB download, no API key.',
        value: 'local',
      },
      {
        title: 'Anthropic Cloud · best capability, paid',
        description: 'Claude via Anthropic. Requires an API key.',
        value: 'anthropic',
      },
      {
        title: 'Mistral (EU Sovereign) · GDPR-friendly, paid',
        description: 'EU-hosted Mistral. Requires an API key.',
        value: 'mistral',
      },
    ],
    initial: 0,
  });
  abortOnCancel(provider);

  let values: Record<string, string>;
  if (provider === 'local') values = await setupLocal();
  else if (provider === 'anthropic') values = await setupAnthropic();
  else values = await setupMistral();

  log.step('Writing configuration');
  writeEnv(values);
  ensureDirs();

  log.step('Done.');
  console.log(`
  ${c.bold}Next:${c.reset}
    ${c.cyan}npm run dev -- --serve${c.reset}     Start the API server
    open ${c.cyan}http://localhost:3000${c.reset}   Open the dashboard

  Docs:    ${c.dim}README.md${c.reset}
  Issues:  ${c.dim}https://github.com/AnttiHero/lavern/issues${c.reset}
`);

  const { launch } = await prompts({
    type: 'confirm',
    name: 'launch',
    message: 'Start the dev server now?',
    initial: true,
  });
  if (launch) {
    log.info('Starting `npm run dev -- --serve` …');
    spawnSync('npm', ['run', 'dev', '--', '--serve'], {
      cwd: repoRoot,
      stdio: 'inherit',
    });
  }
}

main().catch((err) => {
  log.err(String(err?.stack ?? err));
  process.exit(1);
});
