const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../../.env.local") });

const commonConfig = {
  dialect: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.MP_DB_NAME || "bd_sisgad5_mp",
};

module.exports = {
  development: { ...commonConfig },
  test: { ...commonConfig, database: process.env.MP_DB_NAME || "bd_sisgad5_mp" },
  production: { ...commonConfig },
};
