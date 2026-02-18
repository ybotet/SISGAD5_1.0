const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TbTipolinea = sequelize.define('TbTipolinea', {
    tipo: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 23]
      },
    },
    id_tipolinea: {
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
    tableName: 'tb_tipolinea',
    timestamps: true,
    underscored: true
  });

  return TbTipolinea;
};
