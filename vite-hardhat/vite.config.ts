import { defineConfig } from 'vite';
import copy from 'rollup-plugin-copy';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  build: {
    target: 'esnext',
  },
  plugins: [react()],
});
