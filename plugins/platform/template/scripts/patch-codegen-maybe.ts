/**
 * Post-codegen script that patches the generated `Maybe` type alias.
 *
 * The `client` preset always generates `Maybe<T> = T | null`, ignoring
 * the `maybeValue` config. This script reads the desired value from
 * `codegen.ts` config and rewrites the type alias in the generated output.
 *
 * Usage: tsx scripts/patch-codegen-maybe.ts
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const GENERATED_FILE = resolve(
  __dirname,
  '../src/lib/graphql/__generated__/graphql.ts'
);

const CODEGEN_CONFIG = resolve(__dirname, '../codegen.ts');

// Extract maybeValue from codegen config
const configSource = readFileSync(CODEGEN_CONFIG, 'utf8');
const match = configSource.match(/maybeValue:\s*['"](.+?)['"]/);

if (!match) {
  console.log('No maybeValue config found in codegen.ts — skipping patch.');
  process.exit(0);
}

const maybeValue = match[1];
const defaultMaybe = 'T | null';

if (maybeValue === defaultMaybe) {
  console.log('maybeValue matches default (T | null) — no patch needed.');
  process.exit(0);
}

const generated = readFileSync(GENERATED_FILE, 'utf8');
const patched = generated.replace(
  /export type Maybe<T> = T \| null;/,
  `export type Maybe<T> = ${maybeValue};`
);

if (patched === generated) {
  console.log('Maybe type not found or already patched — skipping.');
  process.exit(0);
}

writeFileSync(GENERATED_FILE, patched);
console.log(`Patched Maybe<T> to: ${maybeValue}`);
