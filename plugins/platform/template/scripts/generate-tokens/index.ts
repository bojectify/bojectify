import {
  readFileSync,
  readdirSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  statSync,
} from 'node:fs';
import { join, dirname, relative, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateColour } from './colour.js';
import { generateBreakpoints } from './breakpoints.js';
import { generateTypography } from './typography.js';
import { extractTokens, resolveCondition, readBrand } from './extract.js';
import { toKebabCase } from './format.js';
import type { CollectionResult, ModeMap, Token } from './types.js';

// ---------------------------------------------------------------------------
// Path constants
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const FIGMA_EXPORTS = join(ROOT, 'figma_exports');
const MODE_MAP_PATH = join(ROOT, 'src', 'styles', 'figma-mode-map.json');
const GENERATED_DIR = join(ROOT, 'src', 'styles', '__generated__');
const CONSTANTS_OUT = join(ROOT, 'src', 'constants', '__generated__');
const SITE_CONFIG_PATH = join(ROOT, 'site.config.ts');

// ---------------------------------------------------------------------------
// --set argument parsing
// ---------------------------------------------------------------------------

type SetFilter = 'colour' | 'breakpoints' | 'typography';
const VALID_SET_VALUES: SetFilter[] = ['colour', 'breakpoints', 'typography'];

function parseArgs(): { set: SetFilter | null } {
  const args = process.argv.slice(2);
  const setIndex = args.indexOf('--set');
  if (setIndex === -1) return { set: null };

  const value = args[setIndex + 1];
  if (!value) {
    console.error(
      'Error: --set requires a value (colour|breakpoints|typography)'
    );
    process.exit(1);
  }

  if (!(VALID_SET_VALUES as string[]).includes(value)) {
    console.error(
      `Error: --set value must be one of: ${VALID_SET_VALUES.join(', ')}`
    );
    process.exit(1);
  }

  return { set: value as SetFilter };
}

const SET_FILTER_KEYWORDS: Record<SetFilter, string> = {
  colour: 'colour',
  breakpoints: 'breakpoints',
  typography: 'typography',
};

function matchesFilter(dirName: string, filter: SetFilter | null): boolean {
  if (filter === null) return true;
  return dirName.toLowerCase().includes(SET_FILTER_KEYWORDS[filter]);
}

// ---------------------------------------------------------------------------
// Collection dispatcher
// ---------------------------------------------------------------------------

/**
 * Processes a single collection directory.
 *
 * Reads all *.tokens.json files, resolves conditions, skips files whose
 * condition is another brand (starts with uppercase and doesn't appear in the
 * mode map after stripping the brand prefix), extracts tokens, and dispatches
 * to the collection-specific generator.
 */
function processCollection(
  collectionDir: string,
  brand: string,
  modeMap: ModeMap
): CollectionResult | null {
  const files = readdirSync(collectionDir).filter((f) =>
    f.endsWith('.tokens.json')
  );

  // Group files by their resolved condition
  const byCondition = new Map<string, Token[]>();

  for (const file of files) {
    const filePath = join(collectionDir, file);
    const json = JSON.parse(readFileSync(filePath, 'utf8')) as Record<
      string,
      unknown
    >;

    // Extract mode name from the canonical $extensions field
    const extensions = json['$extensions'] as
      | Record<string, unknown>
      | undefined;
    const modeName =
      (extensions?.['com.figma.modeName'] as string | undefined) ??
      file.replace(/\.tokens\.json$/, '');
    const condition = resolveCondition(modeName, brand);

    // Skip files that appear to be for another brand
    if (
      condition !== '' &&
      !(condition in modeMap) &&
      /^[A-Z]/.test(condition)
    ) {
      continue;
    }

    // Warn for unknown non-brand conditions
    if (condition !== '' && !(condition in modeMap)) {
      console.warn(
        `⚠ No mode map entry for condition "${condition}" (from mode "${modeName}") — skipping ${file}`
      );
      continue;
    }

    const tokens = extractTokens(json);
    byCondition.set(condition, tokens);
  }

  if (byCondition.size === 0) return null;

  // Derive collection name from directory name for the output filename
  const dirName = basename(collectionDir);
  // e.g. "Semantic Tokens Colour" → "colour"
  //      "Semantic Tokens Breakpoints" → "breakpoints"
  //      "Semantic Tokens Typography Brand" → "typography-brand"
  //      "Semantic Tokens Typography Font Size" → "typography-font-size"
  const suffix = toKebabCase(
    dirName.replace(/^Semantic Tokens\s*/i, '').trim()
  );

  const outputFileName = `_semantic-tokens-${suffix}.generated.scss`;
  const outputPath = join(GENERATED_DIR, outputFileName);

  // Dispatch to collection-specific generator
  if (suffix === 'colour') {
    const defaultTokens = byCondition.get('Light') ?? [];
    const darkTokens = byCondition.get('Dark') ?? [];
    const content = generateColour(
      defaultTokens,
      darkTokens,
      collectionDir,
      ROOT
    );
    return { outputPath, content };
  } else if (suffix === 'breakpoints') {
    return generateBreakpoints(
      byCondition,
      collectionDir,
      GENERATED_DIR,
      CONSTANTS_OUT,
      ROOT
    );
  } else {
    // Typography Brand and Typography Font Size
    const content = generateTypography(
      byCondition,
      modeMap,
      collectionDir,
      ROOT
    );
    return { outputPath, content };
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const { set: setFilter } = parseArgs();
  const brand = readBrand(SITE_CONFIG_PATH);
  const modeMap = JSON.parse(readFileSync(MODE_MAP_PATH, 'utf8')) as ModeMap;

  if (!existsSync(FIGMA_EXPORTS)) {
    console.error('Error: figma_exports/ directory not found');
    process.exit(1);
  }

  // Ensure output directories exist
  mkdirSync(GENERATED_DIR, { recursive: true });
  mkdirSync(CONSTANTS_OUT, { recursive: true });

  const collections = readdirSync(FIGMA_EXPORTS).filter((name) => {
    return statSync(join(FIGMA_EXPORTS, name)).isDirectory();
  });

  const filtered = collections.filter((name) => matchesFilter(name, setFilter));

  if (setFilter !== null) {
    console.log(`Filtering collections by --set ${setFilter}`);
  }

  for (const collection of filtered) {
    const collectionDir = join(FIGMA_EXPORTS, collection);
    const result = processCollection(collectionDir, brand, modeMap);

    if (result) {
      writeFileSync(result.outputPath, result.content, 'utf8');
      console.log(`Written: ${relative(ROOT, result.outputPath)}`);
    }
  }
}

main();
