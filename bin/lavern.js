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

if (existsSync(distEntry)) {
  // Production path: compiled entry, no transpiler overhead.
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
