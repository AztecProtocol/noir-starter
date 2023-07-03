/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: '.',
  test: {
    testTimeout: 600000000,
    clearMocks: true,
    globals: true,
    setupFiles: ['dotenv/config'],
    watchExclude: ['node_modules', 'artifacts', 'cache'],
    forceRerunTriggers: ['circuits/**/*.sol'],
  },
});
