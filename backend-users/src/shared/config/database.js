const { Sequelize } = require("sequelize");
const path = require("path");
const dotenv = require("dotenv");
const logger = require("./logger");

dotenv.config({ path: path.join(__dirname, "../../../../.env.local") });

// Configurar zona horaria global
process.env.TZ = process.env.TZ || "America/Santiago";

// Función helper para obtener fecha local en formato correcto
const getLocalDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const sequelize = new Sequelize(
  process.env.USERS_DB_NAME || "bd_sisgad5_users",
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development" ? (msg) => logger.informacion(msg) : false,

    timezone: process.env.DB_TIMEZONE || "America/Santiago",

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },

    define: {
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",

      hooks: {
        beforeCreate: (instance) => {
          const now = new Date();
          const formattedNow = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

          if (!instance.created_at) {
            instance.created_at = formattedNow;
          }
          if (!instance.updated_at) {
            instance.updated_at = formattedNow;
          }
        },
        beforeUpdate: (instance) => {
          const now = new Date();
          instance.updated_at = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
        },
      },
    },

    dialectOptions: {
      useUTC: false,
      dateStrings: true,
    },
  },
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.informacion("✅ Conexión a PostgreSQL establecida correctamente.");

    const tzResult = await sequelize.query("SHOW TIMEZONE;");
    const timezone = tzResult[0][0]?.TimeZone || tzResult[0]?.TimeZone;
    logger.informacion(`🕐 Zona horaria PostgreSQL: ${timezone}`);

    return true;
  } catch (error) {
    logger.error("❌ Error conectando:", error.message);
    return false;
  }
};

const setupPostgresTimezone = async () => {
  try {
    const timezone = process.env.DB_TIMEZONE || "America/Santiago";
    await sequelize.query(`SET TIME ZONE '${timezone}';`);
    return true;
  } catch (error) {
    logger.warn("⚠️ No se pudo configurar zona horaria en PostgreSQL:", error.message);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
  getLocalDateTime,
  setupPostgresTimezone,
};
