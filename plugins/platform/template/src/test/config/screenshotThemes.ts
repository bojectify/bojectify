import { expect } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import type { ReactElement } from 'react';

const THEMES = ['light', 'dark'] as const;

/**
 * Render `ui` once per theme (light + dark) and assert one screenshot each:
 * `<baseName>-light` and `<baseName>-dark`.
 *
 * Forces the theme via the `data-theme` attribute that the generated
 * `light-dark()` semantic tokens key off (`:root[data-theme='…']` pins
 * `color-scheme`). Baselines are therefore deterministic regardless of the
 * headless browser's `prefers-color-scheme` default. The attribute is reset
 * after each pass so themes never leak between renders.
 *
 * Baselines are intentionally exact-match — no comparator-options passthrough
 * (e.g. pixelmatch thresholds). A component that genuinely needs comparator
 * options should call `toMatchScreenshot` directly in a bespoke test rather
 * than via this helper.
 */
export const screenshotBothThemes = async (
  baseName: string,
  testId: string,
  ui: () => ReactElement
): Promise<void> => {
  for (const theme of THEMES) {
    document.documentElement.setAttribute('data-theme', theme);
    const { unmount } = await render(ui());
    try {
      await expect(page.getByTestId(testId)).toMatchScreenshot(
        `${baseName}-${theme}`
      );
    } finally {
      await unmount();
      document.documentElement.removeAttribute('data-theme');
    }
  }
};
