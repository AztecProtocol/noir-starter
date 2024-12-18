import react from '@vitejs/plugin-react-swc';

export default {
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
  plugins: [react()],
};
