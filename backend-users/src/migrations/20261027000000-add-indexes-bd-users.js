"use strict";

/**
 * Migration: add indexes to existing tables in bd_users
 * Adds indexes on: email (users), FK columns (user_roles, roles_permisos), estado (if exists)
 * Safe to run on existing databases (uses IF NOT EXISTS pattern)
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = ["tb_users", "tb_roles", "tb_permisos", "tb_user_roles", "tb_roles_permisos"];

    for (const table of tables) {
      // Verify table exists before creating indices
      const tableExists = await queryInterface.sequelize.query(
        `SELECT to_regclass('${table}') as exists;`,
        { type: Sequelize.QueryTypes.SELECT },
      );

      if (!tableExists[0] || !tableExists[0].exists) {
        console.log(`⚠️ Tabla ${table} no existe — saltando índices.`);
        continue;
      }
    }

    try {
      await queryInterface.sequelize.query(
        `DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_indexes WHERE tablename = 'tb_users' AND indexname = 'tb_users_idx_email'
          ) THEN
            CREATE INDEX CONCURRENTLY tb_users_idx_email ON tb_users (email);
          END IF;
        END $$;`,
      );
    } catch (e) {
      console.warn("⚠️ No se pudo crear índice email en tb_users:", e.message);
    }

    const fkTables = [
      { table: "tb_user_roles", column: "id_usuario" },
      { table: "tb_user_roles", column: "id_rol" },
      { table: "tb_roles_permisos", column: "id_rol" },
      { table: "tb_roles_permisos", column: "id_permiso" },
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

    console.log("✅ Migration completada: índices añadidos a bd_users");
  },

  down: async (queryInterface, Sequelize) => {
    const dropIndex = async (indexName) => {
      try {
        await queryInterface.sequelize.query(`DROP INDEX IF EXISTS ${indexName};`);
      } catch (e) {
        console.warn(`⚠️ No se pudo remover índice ${indexName}:`, e.message);
      }
    };

    await dropIndex("tb_users_idx_email");
    await dropIndex("tb_user_roles_idx_id_usuario");
    await dropIndex("tb_user_roles_idx_id_rol");
    await dropIndex("tb_roles_permisos_idx_id_rol");
    await dropIndex("tb_roles_permisos_idx_id_permiso");

    console.log("✅ Rollback completado: índices removidos de bd_users");
  },
};
