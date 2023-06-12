/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: '.',
  test: {
    clearMocks: true,
    globals: true,
    setupFiles: ['dotenv/config'],
    watchExclude: ['node_modules', 'src', 'artifacts', 'cache'],
    forceRerunTriggers: ['contract/**/*.sol'],
  },
});
