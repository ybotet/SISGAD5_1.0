const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TbResultadoprueba = sequelize.define('TbResultadoprueba', {
    resultado: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 20]
      },
    },
    id_resultadoprueba: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
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
    tableName: 'tb_resultadoprueba',
    timestamps: true,
    underscored: true
  });

  return TbResultadoprueba;
};
