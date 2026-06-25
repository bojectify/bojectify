// ---------------------------------------------------------------------------
// Shared types for generate-tokens modules
// ---------------------------------------------------------------------------

export interface Token {
  name: string; // CSS custom property name (e.g. --s-colour-background-site)
  type: string; // Figma $type: color | number | string
  value: string | number | Record<string, unknown>;
  hex?: string; // Only for color tokens
}

export interface ModeMapEntry {
  type: 'default' | 'media';
  query?: string;
}

export type ModeMap = Record<string, ModeMapEntry>;

export interface CollectionResult {
  outputPath: string;
  content: string;
}
