#!/usr/bin/env node
//
// Lavern CLI entry shim.
//
// Loads the compiled entry from dist/index.js if present (fast, production
// style), otherwise re-executes the TypeScript source via tsx. That way
// `lavern --help` works immediately after `npm install`, without a build
// step, and also works post-build with zero overhead.
//
// Apache 2.0. Part of the Lavern OSS release.
//

import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const distEntry = resolve(root, 'dist', 'index.js');
const srcEntry  = resolve(root, 'src', 'index.ts');

// Silence the DEP0040 punycode deprecation warning that surfaces because
// openai@4 ships node-fetch@2 → whatwg-url@5 → require('punycode'). The
// warning is cosmetic, prints on every Lavern boot, and openai@4 → v5/v6
// dropped that chain — but the SDK upgrade carries API-shape risk so we
// defer it to a follow-up release. Until then, suppress only on the
// Lavern entry. NODE_OPTIONS is merged with any user-set value so we
// don't clobber their own flags.
const preserveOptions = process.env.NODE_OPTIONS ?? '';
if (!preserveOptions.includes('--no-deprecation')) {
  process.env.NODE_OPTIONS = (preserveOptions + ' --no-deprecation').trim();
}

if (existsSync(distEntry)) {
  // Production path: compiled entry, no transpiler overhead.
  // process.noDeprecation is the in-process equivalent of --no-deprecation;
  // honoured by both Node ESM and CJS warning emitters.
  process.noDeprecation = true;
  await import(pathToFileURL(distEntry).href);
} else if (existsSync(srcEntry)) {
  // Source path: spawn tsx so `.ts` is loaded transparently.
  // Prefer the local `node_modules/.bin/tsx` so we don't pay for `npx`'s
  // global registry lookup; fall back to `npx tsx` if not found.
  const localTsx = resolve(root, 'node_modules', '.bin', 'tsx');
  const cmd = existsSync(localTsx) ? localTsx : 'npx';
  const args = existsSync(localTsx)
    ? [srcEntry, ...process.argv.slice(2)]
    : ['--yes', 'tsx', srcEntry, ...process.argv.slice(2)];

  const child = spawn(cmd, args, { stdio: 'inherit' });
  child.on('exit', (code) => process.exit(code ?? 1));
  child.on('error', (err) => {
    console.error('Lavern: failed to spawn tsx —', err.message);
    console.error('Run `npm install` in the repo root, then try again.');
    process.exit(1);
  });
} else {
  console.error('Lavern: cannot find entry point.');
  console.error('Expected one of:');
  console.error('  ' + distEntry);
  console.error('  ' + srcEntry);
  console.error('Are you inside the lavern repo? `git clone https://github.com/AnttiHero/lavern.git`');
  process.exit(1);
}
