const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TbQueja = sequelize.define('TbQueja', {
    num_reporte: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: true,
      defaultValue: 0,
      validate: {
        len: {
          args: [4, 6],
          msg: 'El teléfono debe tener entre 4 y 6 caracteres'
        },
        unique: {
          msg: 'El número de reporte debe ser único'
        }
      }
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          msg: 'La fecha debe ser una fecha válida'
        },
        isBefore: {
          args: new Date().toISOString().split('T')[0],
          msg: 'La fecha no puede ser en el futuro'
        },
      }
    },
    prioridad: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    probador: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fecha_pdte: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          msg: 'La fecha_pdte debe ser una fecha válida'
        },
        isBefore: {
          args: new Date().toISOString().split('T')[0],
          msg: 'La fecha_pdte no puede ser en el futuro'
        },
      }
    },
    clave_pdte: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 12],
          msg: 'La clave_pdte debe tener hasta 12 caracteres'
        }
      },
    },
    claveok: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 12],
          msg: 'La claveok debe tener hasta 12 caracteres'
        }
      },
    },
    fechaok: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          msg: 'La fechaok debe ser una fecha válida'
        },
        isBefore: {
          args: new Date().toISOString().split('T')[0],
          msg: 'La fechaok no puede ser en el futuro'
        },
      }
    },
    red: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      validate: {
        isBoolean: {
          msg: 'La red debe ser verdadero o falso'
        }
      }
    },
    id_queja: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    id_telefono: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_linea: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_tipoqueja: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_clave: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_pizarra: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    reportado_por: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: true,
      enum: ['Abierta', 'En Proceso', 'Pendiente', 'Resuelto', 'Cerrada'],
      defaultValue: 'Abierta',
      validate: {
        isIn: {
          args: [['Abierta', 'En Proceso', 'Pendiente', 'Resuelto', 'Cerrada']],
          msg: 'El estado debe ser: Abierta, En Proceso, Pendiente, Resuelto o Cerrada'
        }
      }
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
    tableName: 'tb_queja',
    timestamps: true,
    underscored: true,
    hooks: {
      // Antes de crear, asignar num_reporte usando una secuencia PostgreSQL
      beforeCreate: async (instance, options) => {
        try {
          // Si ya viene con num_reporte válido, no sobrescribir
          if (instance.num_reporte && parseInt(instance.num_reporte, 10) > 0) return;

          const t = options.transaction || null;

          // Asegurar que la secuencia exista
          await sequelize.query("CREATE SEQUENCE IF NOT EXISTS num_reporte_seq START WITH 100000;", { transaction: t });

          // Obtener el máximo actual en la tabla
          // Convertimos el resultado a texto en SQL (COALESCE sobre text) para evitar errores
          // si la columna tiene tipos mixtos en la base de datos. Luego parseamos en JS.
          const [[maxRow]] = await sequelize.query("SELECT COALESCE(MAX(num_reporte)::text, '0') AS maxnum FROM tb_queja;", { transaction: t });
          const maxNum = parseInt(maxRow.maxnum || '0', 10) || 0;
          const startValue = Math.max(100000, maxNum + 1);

          // Intentar obtener el último valor de la secuencia (puede fallar en algunos estados)
          let seqLast = null;
          try {
            const [[seqRow]] = await sequelize.query("SELECT last_value::bigint AS last_value FROM num_reporte_seq;", { transaction: t });
            seqLast = seqRow && seqRow.last_value ? parseInt(seqRow.last_value, 10) : null;
          } catch (e) {
            // No crítico: proceder a ajustar la secuencia
            seqLast = null;
          }

          // Si la secuencia está por detrás del startValue, moverla (setval to startValue-1 so nextval yields startValue)
          if (seqLast === null || seqLast < (startValue - 1)) {
            await sequelize.query(`SELECT setval('num_reporte_seq', ${startValue - 1}, false);`, { transaction: t });
          }

          // Obtener el siguiente valor de la secuencia
          const [[nextRow]] = await sequelize.query("SELECT nextval('num_reporte_seq') AS nextval;", { transaction: t });
          instance.num_reporte = parseInt(nextRow.nextval, 10);
        } catch (err) {
          console.error('Error generando num_reporte en hook beforeCreate:', err);
          throw new Error('Error generando num_reporte: ' + (err.message || err));
        }
      }
    }, 
     validate: {
      alMenosUnId() {
        if (!this.id_telefono && !this.id_linea && !this.id_pizarra) {
          throw new Error('Debe seleccionar al menos un elemento (teléfono, línea o pizarra)');
        }
      }
     }
  });

  return TbQueja;
};
