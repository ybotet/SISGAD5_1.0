const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TbMovimiento = sequelize.define('TbMovimiento', {
    id_movimiento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    id_tipomovimiento: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    motivo: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 100]
      },
    },
    id_os: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    os: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_telefono: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_linea: {
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
    tableName: 'tb_movimiento',
    timestamps: true,
    underscored: true
  });

  return TbMovimiento;
};
