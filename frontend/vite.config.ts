// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [react()],
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    
    // 🔥 IMPORTANTE: Configurar base para producción
    base: isProduction ? '/sisgad5/' : '/',
    
    server: {
      host: 'localhost',
      port: 5173,
      strictPort: false,
      proxy: !isProduction ? {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      } : undefined,
    },
    
    build: {
      outDir: 'dist',
      sourcemap: isProduction ? false : true,
      // Vite ahora generará las rutas relativas a /sisgad5/
    }
  };
});