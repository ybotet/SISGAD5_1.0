const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TbClasifpizarra = sequelize.define('TbClasifpizarra', {
    id_clasifpizarra: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    clasificacion: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [0, 100]
      },
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
    tableName: 'tb_clasifpizarra',
    timestamps: true,
    underscored: true
  });

  return TbClasifpizarra;
};
