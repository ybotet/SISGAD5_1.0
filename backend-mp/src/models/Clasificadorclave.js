const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TbClasificadorclave = sequelize.define('TbClasificadorclave', {
    id_clasificadorclave: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    clasificador: {
      type: DataTypes.STRING,
      allowNull: false,
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
    tableName: 'tb_clasificadorclave',
    timestamps: true,
    underscored: true
  });

  return TbClasificadorclave;
};
