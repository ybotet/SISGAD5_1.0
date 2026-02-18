const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TbMaterialempleado = sequelize.define('TbMaterialempleado', {
  id_materialeempleado: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  trabajo: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  material: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  }, {
    tableName: 'tb_materialempleado',
    timestamps: true,
    underscored: false
  });

  return TbMaterialempleado;
};
