import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom"],
    },

    base: isProduction ? "/sisgad5/" : "/",

    server: {
      host: true,
      port: 5004,
      strictPort: true,
      watch: {
        usePolling: true,
      },
      proxy: !isProduction
        ? {
            "/api": {
              target: "http://api-gateway:5000",
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
