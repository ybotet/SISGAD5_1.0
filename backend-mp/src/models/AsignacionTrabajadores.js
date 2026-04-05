const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TbAsignacionTrabajadores = sequelize.define(
    "TbAsignacionTrabajadores",
    {
      id_asignacion_trabajadores: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      id_asignacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_trabajador: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "tb_asignacion_trabajadores",
      timestamps: true,
      underscored: true,
    },
  );
  return TbAsignacionTrabajadores;
};
