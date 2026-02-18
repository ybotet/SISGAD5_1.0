const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TbTipoqueja = sequelize.define('TbTipoqueja', {
    id_tipoqueja: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    tipoqueja: {
      type: DataTypes.STRING,
      allowNull: true,
      enum: ['TELÉFONO', 'LÍNEA', 'PIZARRA'],
    },

    servicio: {
      type: DataTypes.STRING,
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
    tableName: 'tb_tipoqueja',
    timestamps: true,
    underscored: true
  });

  return TbTipoqueja;
};
