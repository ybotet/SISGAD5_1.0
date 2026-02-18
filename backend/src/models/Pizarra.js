const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TbPizarra = sequelize.define('TbPizarra', {
    id_pizarra: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate:{
        notNull:{
          msg: 'El nombre es obligatorio'
        },
        notEmpty: {
          msg: 'El nombre no puede estar vacío'
        }
      }
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: false,
      validate:{
        notNull:{
          msg: 'La dirección es obligatoria'
        },
        notEmpty: {
          msg: 'la dirección no puede estar vacía'
        }
      }
    },
    observacion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_tipopizarra: {
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
    tableName: 'tb_pizarra',
    timestamps: true,
    underscored: true
  });

  return TbPizarra;
};
