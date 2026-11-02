const { Sequelize } = require("sequelize");

const s = new Sequelize(
  "bd_sisgad5_users",
  "postgres",
  process.env.DB_PASSWORD,
  { host: "localhost", dialect: "postgres" }
);

s.authenticate()
  .then(() => s.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"))
  .then(([rows]) => {
    console.log("Tablas en bd_sisgad5_users:");
    rows.forEach((r) => console.log(" ", r.table_name));
    process.exit(0);
  })
  .catch((e) => {
    console.error("ERROR:", e.message);
    process.exit(1);
  });