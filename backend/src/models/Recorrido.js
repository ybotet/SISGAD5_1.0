const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TbRecorrido = sequelize.define('TbRecorrido', {
    id_recorrido: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    par: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 6]
      },
    },
    terminal: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 12]
      },
    },
    de: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 4]
      },
    },
    a: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 4]
      },
    },
    dirter: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 30]
      },
    },
    soporte: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 50]
      },
    },
    canal: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 50]
      },
    },
    id_telefono: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_linea: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_propietario: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_planta: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_cable: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_sistema: {
      type: DataTypes.INTEGER,
      allowNull: false
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
    tableName: 'tb_recorrido',
    timestamps: true,
    underscored: true
  });

  return TbRecorrido;
};
