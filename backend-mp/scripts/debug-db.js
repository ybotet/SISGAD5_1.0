// scripts/debug-db.js
require("../src/config/env");
const { sequelize } = require("../src/config/database");

async function debugDatabase() {
  console.log("\n🔍 DEBUG: Explorando estructura de resultados\n");

  try {
    await sequelize.authenticate();
    console.log("✅ Conexión OK\n");

    // 1. Verificar formato de SELECT version()
    console.log("1. Probando SELECT version():");
    const versionResult = await sequelize.query("SELECT version();");
    console.log("   Tipo:", typeof versionResult);
    console.log("   Es array:", Array.isArray(versionResult));
    console.log("   Longitud:", versionResult.length);
    console.log("   Contenido:", JSON.stringify(versionResult, null, 2));
    console.log("");

    // 2. Verificar formato de SHOW TIMEZONE
    console.log("2. Probando SHOW TIMEZONE:");
    const tzResult = await sequelize.query("SHOW TIMEZONE;");
    console.log("   Tipo:", typeof tzResult);
    console.log("   Contenido:", JSON.stringify(tzResult, null, 2));
    console.log("");

    // 3. Verificar formato de información_schema
    console.log("3. Probando información_schema:");
    const columnsResult = await sequelize.query(`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'tb_queja'
      AND column_name IN ('fecha', 'fechaok')
      LIMIT 2;
    `);
    console.log("   Tipo:", typeof columnsResult);
    console.log("   Es array:", Array.isArray(columnsResult));
    console.log("   Longitud:", columnsResult.length);
    console.log("   Contenido:", JSON.stringify(columnsResult, null, 2));
    console.log("");

    // 4. Verificar cada elemento individualmente
    if (columnsResult && columnsResult.length > 0) {
      console.log("4. Analizando cada fila:");
      for (let i = 0; i < columnsResult.length; i++) {
        console.log(`   Fila ${i}:`, columnsResult[i]);
        console.log(`     table_name: ${columnsResult[i].table_name}`);
        console.log(`     column_name: ${columnsResult[i].column_name}`);
      }
    } else {
      console.log("4. No hay datos en columnsResult");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await sequelize.close();
  }
}

debugDatabase();
