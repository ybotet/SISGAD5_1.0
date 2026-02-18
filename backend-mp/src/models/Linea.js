const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TbLinea = sequelize.define('TbLinea', {
    id_linea: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    clavelinea: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [0, 12],
          msg: 'La clave no debe ser mayos de 12 caracteres'
        },
        notNull: {
          msg: 'La clave es obligatoria'
        },
        notEmpty: {
          msg: 'La clave no puede estar vacía'
        },

      },
      unique: true

    },
    clave_n: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 12],
          msg: 'La clave no debe ser mayor de 12 caracteres'}
      },
      unique: true
    },
    codificacion: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 7],
          msg: 'La codificación no debe ser mayor de 7 caracteres'
        }
      },
    },
    hilos: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 2],
          msg: 'Los hilos no deben poseer más de 2 caracteres'
        },
      },
    },
    desde: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 50],
          msg: 'El campo desde no debe poseer más de 50 caracteres'
        },
      },
    },
    dirde: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 50],
          msg: 'El campo dirde no debe poseer más de 50 caracteres'
        },
      },
    },
    distdesde: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    zd: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 20],
          msg: 'El campo zd no debe poseer más de 20 caracteres'
        },
      },
    },
    hasta: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 50],
          msg: 'El campo hasta no debe poseer más de 50 caracteres'
        },
      },
    },
    dirha: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 50],
          msg: 'El campo dirha no debe poseer más de 50 caracteres'
        },
      },
    },
    disthasta: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    zh: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 20],
          msg: 'El campo desde no debe poseer más de 20 caracteres'
        },
      },
    },
    esbaja: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    facturado: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 60],
          msg: 'El campo facturado no debe poseer más de 60 caracteres'
        },
      },
    },
    sector: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 2],
          msg: 'El campo sector no debe poseer más de 2 caracteres'
        },
      },
    },
    id_senalizacion: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_tipolinea: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_propietario: {
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
    tableName: 'tb_linea',
    timestamps: true,
    underscored: true
  });

  return TbLinea;
};
