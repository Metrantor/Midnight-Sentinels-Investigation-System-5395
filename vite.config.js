import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// NETLIFY-OPTIMIERTE KONFIGURATION
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',  // Esbuild ist schneller für Netlify
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          icons: ['react-icons'],
          animations: ['framer-motion']
        }
      }
    }
  },
  server: {
    host: true,
    port: 3000
  },
  preview: {
    port: 4173,
    host: true
  }
});