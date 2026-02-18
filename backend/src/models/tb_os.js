const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TbOs = sequelize.define('TbOs', {
    id_os: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Telefono: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 50]
      },
    },
    fecha_queja: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cliente: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 50]
      },
    },
    facilidades: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 50]
      },
    },
    orden: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 50]
      },
    },
    asignacion: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 50]
      },
    },
    id_clave: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 50]
      },
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    confirmacion: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },

  }, {
    tableName: 'tb_os',
    timestamps: true,
    underscored: false
  });

  return TbOs;
};
