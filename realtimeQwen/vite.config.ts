import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { attachSignaling, readServerEnv } from "./server/signaling";

function signalingPlugin(mode: string): Plugin {
  const env = readServerEnv(mode, process.cwd());
  return {
    name: "qwen-signaling",
    configureServer(server) {
      attachSignaling(server.middlewares, env);
    },
    configurePreviewServer(server) {
      attachSignaling(server.middlewares, env);
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), signalingPlugin(mode)],
  server: {
    port: 5190,
    strictPort: true,
  },
  preview: {
    port: 5190,
    strictPort: true,
  },
}));
