const path = require("path");
const dotenv = require("dotenv");

// El archivo .env.local está en la raíz del repositorio (no en backend-users/).
// Desde src/config/ se necesitan 3 subdirectorios para llegar a la raíz.
dotenv.config({ path: path.join(__dirname, "../../../.env.local") });

const commonConfig = {
  dialect: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.USERS_DB_NAME || "bd_sisgad5_users",
};

module.exports = {
  development: { ...commonConfig },
  test: { ...commonConfig },
  production: { ...commonConfig },
};
