"use strict";

/**
 * Migration: crear tabla tb_sesiones
 * Historial de sesiones: login, refresh, logout con IP y user agent.
 * @see SPEC.md §5.1 — sesiones (Historial de sesiones)
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("tb_sesiones", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "tb_user",
          key: "id_usuario",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      evento: {
        type: Sequelize.ENUM("login", "refresh", "logout"),
        allowNull: false,
      },
      ip: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      fecha: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
      exitoso: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      detalle: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });

    await queryInterface.addIndex("tb_sesiones", ["id_usuario"]);
    await queryInterface.addIndex("tb_sesiones", ["evento"]);
    await queryInterface.addIndex("tb_sesiones", ["fecha"]);

    console.log("✅ Migration: tabla tb_sesiones creada");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("tb_sesiones");
    console.log("✅ Rollback: tabla tb_sesiones eliminada");
  },
};
