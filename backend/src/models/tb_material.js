const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TbMaterial = sequelize.define('TbMaterial', {
  id_material: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  material: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  }, {
    tableName: 'tb_material',
    timestamps: true,
    underscored: false
  });

  return TbMaterial;
};
