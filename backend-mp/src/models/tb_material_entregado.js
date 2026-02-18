const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TbMaterialEntregado = sequelize.define('TbMaterialEntregado', {
  id_material_entregado: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  vale: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 50]
    },
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  operario: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  material: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  }, {
    tableName: 'tb_material_entregado',
    timestamps: true,
    underscored: false
  });

  return TbMaterialEntregado;
};
