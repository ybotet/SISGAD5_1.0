const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TbTelefono = sequelize.define('TbTelefono', {
    id_telefono: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    telefono: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [6, 10],
          msg: 'El campo teléfono debe tener entre 6 y 10 caracteres'
        },
        notNull: {
          msg: 'El teléfono es obligatorio'
        },
        notEmpty: {
          msg: 'El teléfono no puede estar vacío'
        },
        is: {
          args: /^[0-9+\-\s()]+$/,
          msg: 'El teléfono solo puede contener números, espacios y los caracteres + - ( )'
        },
      },
      unique: true,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El nombre es obligatorio'
        },
        is: {
          args: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
          msg: 'El nombre solo puede contener letras y espacios'
        },
        len: {
          args: [0, 30],
          msg: 'El campo nombre no debe exceder los 30 caracteres'
        },
      },
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'La dirección es obligatoria'
        },
        len: {
          args: [0, 50],
          msg: 'El campo dirección no debe exceder los 50 caracteres'
        },
      },
    },
    lic: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 50],
          msg: 'El campo licencia no debe exceder los 50 caracteres'
        },
      },
    },
    zona: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 20],
          msg: 'El campo zona no debe exceder los 20 caracteres'
        },
      },
    },
    esbaja: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      validate: {
        isBoolean: {
          msg: 'El estado debe ser verdadero o falso'
        }
      }
    },
    extensiones: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    facturado: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 60],
          msg: 'El campo facturado no debe exceder los 60 caracteres'
        },
      },
    },
    sector: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 2],
          msg: 'El campo sector no debe exceder los 2 caracteres'
        },
      },
    },
    id_mando: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_clasificacion: {
      type: DataTypes.INTEGER,
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
    tableName: 'tb_telefono',
    timestamps: true,
    underscored: true
  });

  return TbTelefono;
};
