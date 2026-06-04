import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root,
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    hmr: {
      host: '127.0.0.1',
    },
    watch: {
      usePolling: false,
    },
    proxy: {
      '/v1': {
        target: 'http://127.0.0.1:8081',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
