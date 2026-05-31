import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
      '@registry': fileURLToPath(new URL('./src/registry', import.meta.url)),
      '@renderer': fileURLToPath(new URL('./src/renderer', import.meta.url)),
      '@ui': fileURLToPath(new URL('./src/ui', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url))
    }
  }
});