const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TbSenalizacion = sequelize.define('TbSenalizacion', {
    id_senalizacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    senalizacion: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 25]
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
    tableName: 'tb_senalizacion',
    timestamps: true,
    underscored: true
  });

  return TbSenalizacion;
};
