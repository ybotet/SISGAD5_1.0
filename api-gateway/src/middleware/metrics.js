const client = require("prom-client");

const SERVICE_NAME = "api-gateway";

const register = new client.Registry();

client.collectDefaultMetrics({ register, labels: { service: SERVICE_NAME } });

const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total de peticiones HTTP al gateway",
  labelNames: ["service", "route", "method", "status"],
  registers: [register],
});

const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duración de peticiones HTTP al gateway en segundos",
  labelNames: ["service", "route", "method"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

function metricsMiddleware(req, res, next) {
  const route = req.route && req.route.path ? req.route.path : req.path;
  const end = httpRequestDurationSeconds.startTimer({
    service: SERVICE_NAME,
    route,
    method: req.method,
  });

  res.on("finish", () => {
    httpRequestsTotal.inc({
      service: SERVICE_NAME,
      route,
      method: req.method,
      status: String(res.statusCode),
    });
    end({ service: SERVICE_NAME, route, method: req.method });
  });

  next();
}

async function metricsHandler(req, res) {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
}

module.exports = { metricsMiddleware, metricsHandler, register };
