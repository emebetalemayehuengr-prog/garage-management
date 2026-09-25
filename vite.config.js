import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  // A Tizen widget runs from its own package, so absolute /assets paths fail.
  base: './',
  plugins: [
    react(),
    legacy({
      // Smart TVs often ship an older Chromium/WebKit engine and cannot start
      // the module-only bundle produced by Vite without this fallback.
      targets: ['Chrome >= 49', 'Safari >= 10', 'Samsung >= 4'],
      modernPolyfills: true,
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
