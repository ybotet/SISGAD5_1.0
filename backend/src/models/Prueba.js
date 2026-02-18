const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TbPrueba = sequelize.define('TbPrueba', {
    id_prueba: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    id_resultado: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_trabajador: {            //probador
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_cable: {               //pdte_cable
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_clave: {             //estado
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_queja: {
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
    tableName: 'tb_prueba',
    timestamps: true,
    underscored: true
  });

  return TbPrueba;
};
