"use strict";

/**
 * Migration: crear tabla tb_refresh_tokens
 * Almacena refresh tokens con hash, expiración y rotación.
 * @see SPEC.md §5.1 (refresh_tokens) y §8.1 (JWT + Refresh Tokens)
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("tb_refresh_tokens", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      token: {
        type: Sequelize.STRING(512),
        allowNull: false,
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
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      revoked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      replaced_by: {
        type: Sequelize.INTEGER,
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

    // Índices para queries rápidos
    await queryInterface.addIndex("tb_refresh_tokens", ["id_usuario"]);
    await queryInterface.addIndex("tb_refresh_tokens", ["token"]);

    console.log("✅ Migration: tabla tb_refresh_tokens creada");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("tb_refresh_tokens");
    console.log("✅ Rollback: tabla tb_refresh_tokens eliminada");
  },
};
