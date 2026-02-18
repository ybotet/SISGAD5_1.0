const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TbTipopizarra = sequelize.define('TbTipopizarra', {
    id_tipopizarra: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 20]
      },
    },

    id_clasifpizarra: {
      type: DataTypes.INTEGER,
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
    tableName: 'tb_tipopizarra',
    timestamps: true,
    underscored: true
  });

  return TbTipopizarra;
};
