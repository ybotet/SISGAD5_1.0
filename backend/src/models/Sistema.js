const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TbSistema = sequelize.define('TbSistema', {
    id_sistema: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    id_propietario: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sistema: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 15]
      },
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 30]
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
    tableName: 'tb_sistema',
    timestamps: true,
    underscored: true
  });

  return TbSistema;
};