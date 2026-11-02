"use strict";

/**
 * Migration: add indexes to existing tables in bd_mp
 * Adds indexes on: estado, FK columns, fecha columns
 * Safe to run on existing databases (uses IF NOT EXISTS / CREATE INDEX CONCURRENTLY)
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = [
      "tb_queja",
      "tb_telefono",
      "tb_linea",
      "tb_pizarra",
      "tb_clave",
      "tb_tipoqueja",
      "tb_trabajador",
      "tb_cable",
      "tb_sistema",
      "tb_planta",
      "tb_mando",
      "tb_clasificacion",
      "tb_clasificadorclave",
      "tb_clasifpizarra",
      "tb_tipolinea",
      "tb_tipomovimiento",
      "tb_tipopizarra",
      "tb_movimiento",
      "tb_prueba",
      "tb_asignacion",
      "tb_trabajo",
      "tb_trabajo_trabajadores",
      "tb_asignacion_trabajadores",
      "tb_resultadoprueba",
      "tb_grupow",
      "tb_propietario",
      "tb_recorrido",
      "tb_senalizacion",
    ];

    for (const table of tables) {
      // Índice de estado (where filtering)
      try {
        await queryInterface.sequelize.query(
          `DO $$ BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_indexes WHERE tablename = '${table}' AND indexname = '${table}_idx_estado'
            ) THEN
              CREATE INDEX CONCURRENTLY ${table}_idx_estado ON ${table} (estado);
            END IF;
          END $$;`,
        );
      } catch (e) {
        console.warn(`⚠️ No se pudo crear índice estado en ${table}:`, e.message);
      }
    }

    const estadoTables = ["tb_queja", "tb_trabajo", "tb_movimiento"];
    for (const table of estadoTables) {
      try {
        await queryInterface.sequelize.query(
          `DO $$ BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_indexes WHERE tablename = '${table}' AND indexname = '${table}_idx_estado'
            ) THEN
              CREATE INDEX CONCURRENTLY ${table}_idx_estado ON ${table} (estado);
            END IF;
          END $$;`,
        );
      } catch (e) {
        console.warn(`⚠️ No se pudo crear índice estado en ${table}:`, e.message);
      }
    }

    const fechaTables = ["tb_queja", "tb_telefono", "tb_linea", "tb_pizarra", "tb_prueba", "tb_asignacion", "tb_trabajo", "tb_movimiento", "tb_asignacion_trabajadores", "tb_trabajo_trabajadores"];
    for (const table of fechaTables) {
      try {
        await queryInterface.sequelize.query(
          `DO $$ BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_indexes WHERE tablename = '${table}' AND indexname = '${table}_idx_fecha'
            ) THEN
              CREATE INDEX CONCURRENTLY ${table}_idx_fecha ON ${table} (fecha);
            END IF;
          END $$;`,
        );
      } catch (e) {
        console.warn(`⚠️ No se pudo crear índice fecha en ${table}:`, e.message);
      }
    }

    const fkTables = [
      { table: "tb_queja", column: "id_tipoqueja" },
      { table: "tb_queja", column: "id_pizarra" },
      { table: "tb_queja", column: "id_clave" },
      { table: "tb_queja", column: "id_clavecierre" },
      { table: "tb_queja", column: "id_telefono" },
      { table: "tb_queja", column: "id_linea" },
      { table: "tb_queja", column: "probador" },
      { table: "tb_prueba", column: "id_queja" },
      { table: "tb_prueba", column: "id_trabajador" },
      { table: "tb_prueba", column: "id_cable" },
      { table: "tb_prueba", column: "id_clave" },
      { table: "tb_asignacion", column: "id_queja" },
      { table: "tb_asignacion", column: "id_cable" },
      { table: "tb_asignacion", column: "id_linea" },
      { table: "tb_trabajo", column: "probador" },
      { table: "tb_trabajo", column: "estado" },
      { table: "tb_movimiento", column: "id_telefono" },
      { table: "tb_movimiento", column: "id_linea" },
      { table: "tb_movimiento", column: "id_tipomovimiento" },
      { table: "tb_telefono", column: "id_clasificacion" },
      { table: "tb_telefono", column: "id_mando" },
      { table: "tb_linea", column: "id_senalizacion" },
      { table: "tb_linea", column: "id_tipolinea" },
      { table: "tb_linea", column: "id_propietario" },
      { table: "tb_pizarra", column: "id_tipopizarra" },
      { table: "tb_clave", column: "id_clasificadorclave" },
      { table: "tb_sistema", column: "id_propietario" },
      { table: "tb_cable", column: "id_propietario" },
      { table: "tb_asignacion_trabajadores", column: "id_asignacion" },
      { table: "tb_asignacion_trabajadores", column: "id_trabajador" },
      { table: "tb_trabajo_trabajadores", column: "id_trabajo" },
      { table: "tb_trabajo_trabajadores", column: "id_trabajador" },
      { table: "tb_recorrido", column: "id_linea" },
      { table: "tb_recorrido", column: "id_telefono" },
      { table: "tb_recorrido", column: "id_propietario" },
      { table: "tb_recorrido", column: "id_planta" },
      { table: "tb_recorrido", column: "id_cable" },
      { table: "tb_recorrido", column: "id_sistema" },
      { table: "tb_trabajador", column: "id_grupow" },
      { table: "tb_cable", column: "id_propietario" },
    ];

    for (const { table, column } of fkTables) {
      const indexName = `${table}_idx_${column}`;
      try {
        await queryInterface.sequelize.query(
          `DO $$ BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_indexes WHERE tablename = '${table}' AND indexname = '${indexName}'
            ) THEN
              CREATE INDEX CONCURRENTLY ${indexName} ON ${table} (${column});
            END IF;
          END $$;`,
        );
      } catch (e) {
        console.warn(`⚠️ No se pudo crear índice FK ${table}.${column}:`, e.message);
      }
    }

    console.log("✅ Migration completada: índices añadidos a bd_mp");
  },

  down: async (queryInterface, Sequelize) => {
    const dropIndex = async (table, indexName) => {
      try {
        await queryInterface.sequelize.query(`DROP INDEX IF EXISTS ${indexName};`);
      } catch (e) {
        console.warn(`⚠️ No se pudo remover índice ${indexName}:`, e.message);
      }
    };

    const estadoTables = ["tb_queja", "tb_trabajo", "tb_movimiento"];
    for (const table of estadoTables) {
      await dropIndex(table, `${table}_idx_estado`);
    }

    const fechaTables = ["tb_queja", "tb_telefono", "tb_linea", "tb_pizarra", "tb_prueba", "tb_asignacion", "tb_trabajo", "tb_movimiento", "tb_asignacion_trabajadores", "tb_trabajo_trabajadores"];
    for (const table of fechaTables) {
      await dropIndex(table, `${table}_idx_fecha`);
    }

    const fkTables = [
      { table: "tb_queja", column: "id_tipoqueja" },
      { table: "tb_queja", column: "id_pizarra" },
      { table: "tb_queja", column: "id_clave" },
      { table: "tb_queja", column: "id_clavecierre" },
      { table: "tb_queja", column: "id_telefono" },
      { table: "tb_queja", column: "id_linea" },
      { table: "tb_queja", column: "probador" },
      { table: "tb_prueba", column: "id_queja" },
      { table: "tb_asignacion", column: "id_queja" },
      { table: "tb_trabajo", column: "estado" },
      { table: "tb_movimiento", column: "id_telefono" },
      { table: "tb_asignacion_trabajadores", column: "id_asignacion" },
      { table: "tb_trabajo_trabajadores", column: "id_trabajo" },
      { table: "tb_recorrido", column: "id_linea" },
    ];

    for (const { table, column } of fkTables) {
      const indexName = `${table}_idx_${column}`;
      try {
        await queryInterface.sequelize.query(`DROP INDEX IF EXISTS ${indexName};`);
      } catch (e) {
        console.warn(`⚠️ No se pudo remover índice ${indexName}:`, e.message);
      }
    }

    console.log("✅ Rollback completado: índices removidos de bd_mp");
  },
};
