const { DataTypes } = require("sequelize");

modelexports = (sequelize) => {
  const TbAsignacion = sequelize.define(
    "TbAsignacion",
    {
      id_asignacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      id_queja: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      id_trabajador: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      fechaAsigancion: {
        type: DataTypes.DATE,
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
      tableName: "tb_asignacion",
      timestamps: true,
      underscored: true,
    },
  );
  return TbAsignacion;
};
