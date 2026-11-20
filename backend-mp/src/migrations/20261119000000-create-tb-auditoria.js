"use strict";

/**
 * Migration: create tb_auditoria table for single audit trail (MP service)
 * Stores: entidad, id_entidad, accion, desde_estado, hacia_estado, usuario_id, detalle (jsonb), ip, created_at
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS tb_auditoria (
        id_auditoria BIGSERIAL PRIMARY KEY,
        entidad VARCHAR(64) NOT NULL,
        id_entidad INTEGER NOT NULL,
        accion VARCHAR(32) NOT NULL,
        desde_estado VARCHAR(64),
        hacia_estado VARCHAR(64),
        usuario_id INTEGER NOT NULL,
        detalle JSONB,
        ip INET,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Índices para consultas típicas
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS tb_auditoria_idx_entidad_id
      ON tb_auditoria (entidad, id_entidad);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS tb_auditoria_idx_usuario
      ON tb_auditoria (usuario_id);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS tb_auditoria_idx_created_at
      ON tb_auditoria (created_at DESC);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS tb_auditoria_idx_accion
      ON tb_auditoria (accion);
    `);

    console.log("✅ Migration completada: tb_auditoria creada");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS tb_auditoria;`);
    console.log("✅ Rollback completado: tb_auditoria eliminada");
  },
};