const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Grupow = sequelize.define('TbGrupow', {
    id_grupow: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    grupo: {
      type: DataTypes.STRING,
      validate: {
        notNull: {
          msg: 'El grupo es obligatorio'
        },
        notEmpty: {
          msg: 'El grupo no puede estar vacío'
        },
        len: {
          args: [1, 50],
          msg: 'El campo grupo debe tener entre 1 y 50 caracteres'
        },
        is: {
          args: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
          msg: 'El grupo solo puede contener letras y espacios'
        },
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
    tableName: 'tb_grupow',
    timestamps: true,
    underscored: true
  });

  return Grupow;
};
