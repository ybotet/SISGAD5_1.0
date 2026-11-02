// scripts/fix-existing-dates.js
const { sequelize } = require("../src/config/database");

async function fixExistingDates() {
  try {
    // Obtener todas las tablas con columnas de fecha
    const [tables] = await sequelize.query(`
      SELECT table_name, column_name
      FROM information_schema.columns 
      WHERE table_name LIKE 'tb_%'
      AND data_type = 'text'
      AND (column_name LIKE '%fecha%' OR column_name LIKE '%date%' OR column_name IN ('created_at', 'updated_at'));
    `);

    for (const { table_name, column_name } of tables) {
      console.log(`Corrigiendo ${table_name}.${column_name}...`);

      // Eliminar posibles zonas horarias de los datos existentes
      await sequelize.query(`
        UPDATE ${table_name}
        SET ${column_name} = REGEXP_REPLACE(${column_name}, '\\+\\d{2}:\\d{2}$', '')
        WHERE ${column_name} IS NOT NULL;
      `);
    }

    console.log("✅ Datos existentes corregidos");
  } catch (error) {
    console.error("Error:", error);
  }
}

fixExistingDates();
