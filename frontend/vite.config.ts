// vite.config.ts - CORREGIDO
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    plugins: [react()],
    resolve: {
      dedupe: ["react", "react-dom"],
    },

    base: isProduction ? "/sisgad5/" : "/",

    server: {
      host: true, // Esto está bien
      port: 5173,
      strictPort: true, // Cambia a true para forzar el puerto exacto
      open: true,
      watch: {
        usePolling: true, // Necesario para hot reload en Docker
      },
      proxy: !isProduction
        ? {
            "/api": {
              target: "http://api-gateway:5000", // CAMBIO CRÍTICO: usa el nombre del servicio, no localhost
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
    },

    build: {
      outDir: "dist",
      sourcemap: isProduction ? false : true,
    },
  };
});
