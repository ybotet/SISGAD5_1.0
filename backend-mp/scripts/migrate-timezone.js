// scripts/migrate-timezone.js
require("../src/config/env");
const { sequelize } = require("../src/config/database");

async function migrateDatesToText() {
  try {
    console.log("\n🔄 Iniciando migración de zonas horarias...\n");

    await sequelize.authenticate();
    console.log("✅ Conexión establecida\n");

    // SHOW TIMEZONE - manejar diferentes estructuras
    const tzResult = await sequelize.query("SHOW TIMEZONE;");
    console.log("DEBUG tzResult:", JSON.stringify(tzResult, null, 2));

    // Acceder de forma robusta
    let timezone;
    if (tzResult[0] && tzResult[0][0] && tzResult[0][0].TimeZone) {
      timezone = tzResult[0][0].TimeZone;
    } else if (tzResult[0] && tzResult[0].TimeZone) {
      timezone = tzResult[0].TimeZone;
    } else if (tzResult[0] && typeof tzResult[0] === "object") {
      timezone = Object.values(tzResult[0])[0];
    } else {
      timezone = "Desconocido";
    }
    console.log(`🕐 Zona horaria PostgreSQL: ${timezone}\n`);

    // Obtener todas las columnas timestamp
    const columnsResult = await sequelize.query(`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'tb_%'
      AND data_type LIKE '%timestamp%'
      ORDER BY table_name, column_name;
    `);

    console.log("DEBUG columnsResult length:", columnsResult.length);
    console.log(
      "DEBUG columnsResult[0]:",
      columnsResult[0] ? columnsResult[0].length : "undefined",
    );

    // Los datos están en columnsResult[0]
    let columns = [];
    if (columnsResult[0] && Array.isArray(columnsResult[0])) {
      columns = columnsResult[0];
    } else if (Array.isArray(columnsResult)) {
      columns = columnsResult;
    }

    if (!columns || columns.length === 0) {
      console.log("✅ No se encontraron columnas timestamp para convertir");
      return;
    }

    console.log(`\n📊 Encontradas ${columns.length} columnas timestamp:\n`);
    columns.forEach((col) => {
      console.log(`  📌 ${col.table_name}.${col.column_name} (${col.data_type})`);
    });

    let converted = 0;

    for (const col of columns) {
      console.log(`\n🔄 Procesando: ${col.table_name}.${col.column_name}`);

      try {
        // Verificar tipo actual
        const typeCheck = await sequelize.query(`
          SELECT data_type 
          FROM information_schema.columns 
          WHERE table_name = '${col.table_name}' 
          AND column_name = '${col.column_name}';
        `);

        let currentType;
        if (typeCheck[0] && typeCheck[0][0] && typeCheck[0][0].data_type) {
          currentType = typeCheck[0][0].data_type;
        } else if (typeCheck[0] && typeCheck[0].data_type) {
          currentType = typeCheck[0].data_type;
        } else {
          currentType = "unknown";
        }

        if (currentType === "text") {
          console.log(`  ⏭️  Ya es TEXT, saltando`);
          continue;
        }

        // Mostrar ejemplo de datos
        const sample = await sequelize.query(`
          SELECT ${col.column_name} 
          FROM ${col.table_name} 
          WHERE ${col.column_name} IS NOT NULL 
          LIMIT 1;
        `);

        let sampleValue = null;
        if (sample[0] && sample[0].length > 0) {
          sampleValue = sample[0][0][col.column_name];
          console.log(`  📝 Ejemplo: ${sampleValue}`);
        }

        // Convertir a TEXT
        await sequelize.query(`
          ALTER TABLE ${col.table_name} 
          ALTER COLUMN ${col.column_name} TYPE TEXT 
          USING ${col.column_name}::TEXT;
        `);

        console.log(`  ✅ Convertida a TEXT`);
        converted++;
      } catch (err) {
        console.error(`  ❌ Error: ${err.message}`);
      }
    }

    console.log(`\n✅ Migración completada. ${converted} columnas convertidas.\n`);

    // Verificar resultado final
    const remainingResult = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      AND data_type LIKE '%timestamp%'
      AND table_name LIKE 'tb_%';
    `);

    let remainingCount = 0;
    if (remainingResult[0] && remainingResult[0][0] && remainingResult[0][0].count) {
      remainingCount = parseInt(remainingResult[0][0].count);
    } else if (remainingResult[0] && remainingResult[0].count) {
      remainingCount = parseInt(remainingResult[0].count);
    }

    if (remainingCount === 0) {
      console.log("🎉 ¡Todas las columnas timestamp fueron convertidas a TEXT!");
    } else {
      console.log(`⚠️ Quedan ${remainingCount} columnas timestamp por convertir`);
    }
  } catch (error) {
    console.error("❌ Error en migración:", error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

migrateDatesToText();
