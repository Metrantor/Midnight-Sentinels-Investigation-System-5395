import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// DEPLOYMENT-OPTIMIERTE KONFIGURATION
export default defineConfig({
  plugins: [react()],
  
  // WICHTIG: Für Greta's Server
  base: './',
  
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild', // Schneller für Deployment
    
    // Chunk-Größe für bessere Performance
    chunkSizeWarningLimit: 1000,
    
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          icons: ['react-icons'],
          animations: ['framer-motion'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  },
  
  server: {
    host: true,
    port: 3000,
    // CORS für Entwicklung
    cors: true
  },
  
  preview: {
    port: 4173,
    host: true,
    // CORS für Preview
    cors: true
  },
  
  // Optimierungen
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js']
  }
});