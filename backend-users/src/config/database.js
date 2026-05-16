const { Sequelize } = require("sequelize");
const path = require("path");
const dotenv = require("dotenv");
// require("dotenv").config();
dotenv.config({ path: path.join(__dirname, "../../.env.local") });

const logger = require("./logger");

const sequelize = new Sequelize(
  process.env.DB_NAME || "bd_sisgad5_users",
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development" ? (msg) => logger.informacion(msg) : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
    },
  },
);

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.informacion("✅ Conexión a PostgreSQL establecida correctamente.");
  } catch (error) {
    logger.error("❌ Error conectando a la base de datos:", error);
  }
};

module.exports = { sequelize, testConnection };
