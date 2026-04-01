// start-local.js - Para iniciar todos los servicios localmente
const { spawn } = require("child_process");
const path = require("path");
const dotenv = require("dotenv");

// Cargar variables
dotenv.config({ path: path.join(__dirname, ".env.local") });

console.log("🚀 Iniciando todos los servicios localmente...\n");

const services = [
  {
    name: "backend-users",
    port: process.env.USERS_PORT || 5001,
    dir: "backend-users",
    color: "\x1b[32m", // Verde
  },
  {
    name: "backend-mp",
    port: process.env.MP_PORT || 5002,
    dir: "backend-mp",
    color: "\x1b[34m", // Azul
  },
  {
    name: "api-gateway",
    port: process.env.GATEWAY_PORT || 5000,
    dir: "api-gateway",
    color: "\x1b[35m", // Magenta
  },
  {
    name: "frontend",
    port: 5004,
    dir: "frontend",
    color: "\x1b[33m", // Amarillo
  },
];

// Iniciar servicios en orden
let currentIndex = 0;

function startNextService() {
  if (currentIndex >= services.length) {
    console.log("\n\x1b[36m%s\x1b[0m", "✅ TODOS LOS SERVICIOS INICIADOS!");
    console.log("\x1b[36m%s\x1b[0m", "📊 Frontend: http://localhost:5004");
    console.log("\x1b[36m%s\x1b[0m", "🔌 API Gateway: http://localhost:5000");
    console.log(
      "\x1b[36m%s\x1b[0m",
      "📝 Health: http://localhost:5000/health\n",
    );
    return;
  }

  const service = services[currentIndex];

  console.log(
    `${service.color}📦 Iniciando ${service.name} en puerto ${service.port}...\x1b[0m`,
  );

  const proc = spawn("npm", ["run", "dev"], {
    cwd: path.join(__dirname, service.dir),
    shell: true,
    env: { ...process.env, FORCE_COLOR: true },
  });

  proc.stdout.on("data", (data) => {
    console.log(
      `${service.color}[${service.name}] \x1b[0m${data.toString().trim()}`,
    );
  });

  proc.stderr.on("data", (data) => {
    console.error(
      `\x1b[31m[${service.name} ERROR] \x1b[0m${data.toString().trim()}`,
    );
  });

  // Esperar un poco antes del siguiente servicio
  setTimeout(() => {
    currentIndex++;
    startNextService();
  }, 1000); // Reducido de 2000ms a 1000ms
}

// Iniciar el primer servicio
startNextService();

// Manejar cierre
process.on("SIGINT", () => {
  console.log("\n\x1b[31m🛑 Deteniendo servicios...\x1b[0m");
  process.exit();
});
