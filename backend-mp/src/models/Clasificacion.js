const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TbClasificacion = sequelize.define('TbClasificacion', {
    id_clasificacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },

    nombre: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 14]
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
    tableName: 'tb_clasificacion',
    timestamps: true,
    underscored: true
  });

  return TbClasificacion;
};
