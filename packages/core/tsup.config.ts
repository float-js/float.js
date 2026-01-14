import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/cli.ts'],
    format: ['esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    shims: true,
    skipNodeModulesBundle: true,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
  {
    entry: ['src/index.ts', 'src/server.ts'],
    format: ['esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    shims: true,
    skipNodeModulesBundle: true,
  },
]);
