import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
  build: {
    rollupOptions: {
      external: [
        'http',
        'https',
        'http-proxy-agent',
        'https-proxy-agent',
        'socks-proxy-agent',
        'net',
        'tls',
        'assert',
        'events',
        'node:http',
        'node:https',
        'node:zlib',
        'node:stream',
        'node:buffer',
        'node:util',
        'node:url',
        'node:net',
      ],
    },
  },
}));