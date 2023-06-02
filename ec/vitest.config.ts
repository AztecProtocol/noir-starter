import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  esbuild: {
    tsconfigRaw: '{}',
  },
  test: {
    clearMocks: true,
    globals: true,
    setupFiles: ['dotenv/config'], //this line,
    watchExclude: ['node_modules', 'src', 'contract'],
  },
  resolve: {
    alias: [{ find: '~', replacement: resolve(__dirname, 'src') }],
  },
});
