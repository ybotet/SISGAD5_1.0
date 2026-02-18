const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TbTrabajador = sequelize.define('TbTrabajador', {
    id_trabajador: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    clave_trabajador: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 10]
      },
    },
    id_operario_v: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 10]
      },
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 18]
      },
    },
    cargo: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 40]
      },
    },
    id_grupow: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    activo: {
      type: DataTypes.BOOLEAN,
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
    tableName: 'tb_trabajador',
    timestamps: true,
    underscored: true
  });

  return TbTrabajador;
};
