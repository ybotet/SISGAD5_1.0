// scripts/test-db.js
require("../src/config/env");
const { sequelize } = require("../src/config/database");

async function testDatabase() {
  console.log("\n🔍 Probando configuración de base de datos...\n");

  try {
    await sequelize.authenticate();
    console.log("✅ Conexión exitosa a PostgreSQL\n");

    // Versión
    const versionResult = await sequelize.query("SELECT version();");
    const versionText = versionResult[0].version;
    console.log(`📦 Versión: ${versionText.split(",")[0]}\n`);

    // Zona horaria
    const tzResult = await sequelize.query("SHOW TIMEZONE;");
    console.log(`🕐 Zona horaria PostgreSQL: ${tzResult[0].TimeZone}`);

    // Hora actual
    const nowResult = await sequelize.query("SELECT NOW() as current_time;");
    console.log(`🕐 Hora actual en PostgreSQL: ${nowResult[0].current_time}\n`);

    // Columnas de fecha
    const dateColumns = await sequelize.query(`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      AND (data_type LIKE '%timestamp%' OR data_type LIKE '%date%')
      AND table_name LIKE 'tb_%'
      ORDER BY table_name, column_name;
    `);

    const timestampCols = dateColumns.filter((c) => c.data_type.includes("timestamp"));
    const textCols = dateColumns.filter((c) => c.data_type === "text");

    console.log(`📊 Columnas de fecha encontradas: ${dateColumns.length}`);
    console.log(`   - Timestamp: ${timestampCols.length}`);
    console.log(`   - Text: ${textCols.length}\n`);

    if (timestampCols.length > 0) {
      console.log("⚠️ Columnas que aún son TIMESTAMP (deberían convertirse a TEXT):");
      timestampCols.forEach((col) => {
        console.log(`    📌 ${col.table_name}.${col.column_name}`);
      });
    } else if (textCols.length > 0) {
      console.log("✅ Todas las columnas de fecha están en formato TEXT");
      console.log("\n📋 Ejemplos de fechas guardadas:");

      // Mostrar ejemplos de fechas
      const ejemplos = await sequelize.query(`
        SELECT fecha FROM tb_queja WHERE fecha IS NOT NULL LIMIT 3;
      `);

      if (ejemplos && ejemplos.length > 0) {
        ejemplos.forEach((row, i) => {
          if (row.fecha) console.log(`   ${i + 1}. ${row.fecha}`);
        });
      }
    }

    // Estadísticas de quejas
    try {
      const quejasCount = await sequelize.query(`SELECT COUNT(*) as total FROM tb_queja;`);
      console.log(`\n📋 Total de quejas: ${quejasCount[0].total}`);

      const fechasResult = await sequelize.query(`
        SELECT 
          MIN(fecha) as fecha_min,
          MAX(fecha) as fecha_max
        FROM tb_queja 
        WHERE fecha IS NOT NULL;
      `);

      if (fechasResult[0] && fechasResult[0].fecha_min) {
        console.log(`   Fecha más antigua: ${fechasResult[0].fecha_min}`);
        console.log(`   Fecha más reciente: ${fechasResult[0].fecha_max}`);
      }
    } catch (err) {
      console.log("\n📋 tb_queja: no hay datos o la tabla no existe");
    }

    console.log("\n✅ Pruebas completadas exitosamente");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

testDatabase();
