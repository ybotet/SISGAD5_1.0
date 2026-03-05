// api-gateway/server.js
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

// 🔥 Configuración CORS simplificada para desarrollo
app.use(
  cors({
    origin: true, // Permite cualquier origen
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// Middleware para logging (útil para debugging)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Origin:", req.headers.origin);
  console.log("Headers:", req.headers);
  next();
});

// Seguridad básica (deshabilitamos algunas restricciones para desarrollo)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(morgan("combined"));

// 🔥 IMPORTANTE: Configuración de proxies con logs detallados
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: process.env.USERS_SERVICE_URL || "http://backend-users:5001",
    changeOrigin: true,
    logLevel: "debug",
    onProxyReq: (proxyReq, req, res) => {
      console.log(`🔀 Proxying auth: ${req.method} ${req.url} → Users Service`);
    },
    onError: (err, req, res) => {
      console.error("❌ Proxy error:", err);
      res.status(500).json({ error: "Proxy error", message: err.message });
    },
  }),
);

app.use(
  "/api/user",
  createProxyMiddleware({
    target: process.env.USERS_SERVICE_URL || "http://backend-users:5001",
    changeOrigin: true,
    logLevel: "debug",
  }),
);

app.use(
  "/api/roles",
  createProxyMiddleware({
    target: process.env.USERS_SERVICE_URL || "http://backend-users:5001",
    changeOrigin: true,
    logLevel: "debug",
  }),
);

// Proxy para MP service
app.use(
  "/api",
  createProxyMiddleware({
    target: process.env.MP_SERVICE_URL || "http://backend-mp:5002",
    changeOrigin: true,
    logLevel: "debug",
    onProxyReq: (proxyReq, req, res) => {
      if (
        !req.url.startsWith("/api/auth") &&
        !req.url.startsWith("/api/user") &&
        !req.url.startsWith("/api/roles")
      ) {
        console.log(`🔀 Proxying: ${req.method} ${req.url} → MP Service`);
      }
    },
  }),
);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "API Gateway funcionando",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "API Gateway SISGAD5",
    services: {
      users: process.env.USERS_SERVICE_URL,
      mp: process.env.MP_SERVICE_URL,
    },
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 API Gateway en puerto ${PORT}`);
  console.log(`👥 Users service: ${process.env.USERS_SERVICE_URL}`);
  console.log(`🛠️ MP service: ${process.env.MP_SERVICE_URL}`);
});
