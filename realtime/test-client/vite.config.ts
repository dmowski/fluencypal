import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root,
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: {
      '/v1': {
        target: 'http://127.0.0.1:8081',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
