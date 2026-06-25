import { mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { pagePathToRoute } from './extract.js';
import { formatRoutesTs } from './format.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const APP_DIR = join(ROOT, 'src', 'app');
const OUT_DIR = join(ROOT, 'src', 'constants', '__generated__');
const OUT_FILE = join(OUT_DIR, 'routes.generated.ts');

const PAGE_FILENAME = /^page\.(ts|tsx)$/;

/**
 * `src/app/api/**` holds route handlers, not pages — skip it.
 * Private folders (`_prefix`) are also ignored by the App Router.
 */
function isIgnoredSegment(name: string): boolean {
  return name === 'api' || name.startsWith('_');
}

function findPageFiles(dir: string, pages: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const entryPath = join(dir, entry);
    const stats = statSync(entryPath);

    if (stats.isDirectory()) {
      if (isIgnoredSegment(entry)) continue;
      findPageFiles(entryPath, pages);
    } else if (PAGE_FILENAME.test(entry)) {
      pages.push(entryPath);
    }
  }

  return pages;
}

function main(): void {
  const pageFiles = findPageFiles(APP_DIR);
  const routes = pageFiles.map((filePath) =>
    pagePathToRoute(relative(APP_DIR, filePath))
  );

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, formatRoutesTs(routes), 'utf8');

  console.log(
    `Written: ${relative(ROOT, OUT_FILE)} (${routes.length} route${routes.length === 1 ? '' : 's'})`
  );
}

main();
