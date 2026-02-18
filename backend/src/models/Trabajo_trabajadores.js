const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TbTrabajoTrabajadores = sequelize.define('TbTrabajoTrabajadores', {
    id_trabajo_trabajadores: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    id_trabajo: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_trabajador: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'tb_trabajo_trabajadores',
    timestamps: true,
    underscored: true
  });

  return TbTrabajoTrabajadores;
};
