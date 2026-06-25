import '../src/styles/globals.scss';
import { BODY_FONT, HEADING_FONT, MONO_FONT } from '../site-fonts.config';
import type { Preview } from '@storybook/nextjs-vite';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Colour theme',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
          { value: 'auto', icon: 'mirror', title: 'OS preference' },
        ],
        dynamicTitle: true,
      },
    },
  },

  initialGlobals: {
    theme: 'auto',
  },

  decorators: [
    (Story, context) => {
      const theme = String(context.globals.theme ?? 'auto');
      document.documentElement.setAttribute(
        'data-theme',
        theme === 'auto' ? '' : theme
      );
      if (theme === 'auto') {
        document.documentElement.removeAttribute('data-theme');
      }
      document.body.classList.add(
        HEADING_FONT.variable,
        BODY_FONT.variable,
        MONO_FONT.variable
      );
      return Story();
    },
  ],

  parameters: {
    options: {
      storySort: {
        method: 'alphabetical',
      },
    },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },

    viewport: {
      options: {
        xs: {
          name: 'XS (375px)',
          styles: { width: '375px', height: '667px' },
          type: 'mobile',
        },
        s: {
          name: 'S (567px)',
          styles: { width: '567px', height: '768px' },
          type: 'mobile',
        },
        m: {
          name: 'M (768px)',
          styles: { width: '768px', height: '1024px' },
          type: 'tablet',
        },
        l: {
          name: 'L (1024px)',
          styles: { width: '1024px', height: '768px' },
          type: 'desktop',
        },
        xl: {
          name: 'XL (1440px)',
          styles: { width: '1440px', height: '900px' },
          type: 'desktop',
        },
        xxl: {
          name: 'XXL (1920px)',
          styles: { width: '1920px', height: '1080px' },
          type: 'desktop',
        },
      },
    },
  },
};

export default preview;
