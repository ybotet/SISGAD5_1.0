"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Auditoria = sequelize.define(
    "Auditoria",
    {
      id_auditoria: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      entidad: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      id_entidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      accion: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      desde_estado: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      hacia_estado: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      detalle: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      ip: {
        type: DataTypes.INET,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "tb_auditoria",
      timestamps: false, // Usamos created_at manual
    }
  );

  return Auditoria;
};