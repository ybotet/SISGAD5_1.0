const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TbClave = sequelize.define('TbClave', {
    id_clave: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    clave: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 8]
      },
      unique: true,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 25]
      },
    },
    valor_p: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: 0,
    },
    id_clasificadorclave: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    es_pendiente: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
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
    tableName: 'tb_clave',
    timestamps: true,
    underscored: true
  });

  return TbClave;
};
