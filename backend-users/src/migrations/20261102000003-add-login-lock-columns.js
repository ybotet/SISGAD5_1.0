"use strict";

/**
 * Migration: agregar columnas de bloqueo por intentos fallidos a tb_user
 * Columnas: failed_attempts (int default 0), locked_until (timestamptz null)
 * @see TASK-300-07 — Bloqueo temporal de cuenta por intentos fallidos
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("tb_user", "failed_attempts", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn("tb_user", "locked_until", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addIndex("tb_user", ["locked_until"]);

    console.log("✅ Migration: columnas failed_attempts y locked_until añadidas a tb_user");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex("tb_user", ["locked_until"]);
    await queryInterface.removeColumn("tb_user", "locked_until");
    await queryInterface.removeColumn("tb_user", "failed_attempts");
    console.log("✅ Rollback: columnas failed_attempts y locked_until eliminadas de tb_user");
  },
};
