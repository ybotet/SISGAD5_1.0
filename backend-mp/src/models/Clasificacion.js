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
      allowNull: false,
      validate: {
        len: {
          args: [0, 14],
          msg: 'El nombre debe tener como máximo 14 caracteres'
        },
         is: { 
          args: /^[a-zA-Z0-9\s]*$/i,
          msg: 'El nombre solo puede contener letras, números y espacios'
        },  
        notNull: {
          msg: 'El nombre es requerido'
        }
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
