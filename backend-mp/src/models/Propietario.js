const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TbPropietario = sequelize.define('TbPropietario', {
    id_propietario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.TEXT,
      validate: {
        notEmpty: {
          msg: 'El nombre no puede estar vacío'
        },
        len: {
          args: [1, 255],
          msg: 'El nombre debe tener entre 1 y 255 caracteres'
        },
          is: { 
          args: /^[a-zA-Z0-9\s]+$/i,
          msg: 'El nombre solo puede contener letras, números y espacios'
        },
        notNull: {
          msg: 'El nombre es requerido'
        }
      },
      allowNull: false,
      unique: true
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
    tableName: 'tb_propietario',
    timestamps: true,
    underscored: true
  });

  return TbPropietario;
};
