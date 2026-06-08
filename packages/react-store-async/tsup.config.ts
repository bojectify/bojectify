import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: {
    tsconfig: 'tsconfig.lib.json',
    compilerOptions: {
      composite: false,
    },
  },
  clean: true,
  external: ['react', 'react-dom', '@bojectify/react-store'],
});
