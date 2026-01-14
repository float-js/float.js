import { defineConfig } from 'tsup';

export default defineConfig([
  // Main library entries (no shebang)
  {
    entry: {
      'index': 'src/index.ts',
      'server/index': 'src/server/index.ts',
      'router/index': 'src/router/index.ts',
    },
    format: ['esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    target: 'node18',
    shims: true,
  },
  // CLI entry (with shebang)
  {
    entry: {
      'cli/index': 'src/cli/index.ts',
    },
    format: ['esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: false, // Don't clean, other build already did
    target: 'node18',
    shims: true,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
]);
