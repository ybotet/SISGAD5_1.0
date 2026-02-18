const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TbPropietario = sequelize.define('TbPropietario', {
    id_propietario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.TEXT,
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
    tableName: 'tb_propietario',
    timestamps: true,
    underscored: true
  });

  return TbPropietario;
};
