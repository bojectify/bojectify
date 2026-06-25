import type { ObjectValues } from '@model/types/utility.types';

export const THEME_PREFERENCES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
} as const;

export type ThemePreference = ObjectValues<typeof THEME_PREFERENCES>;
