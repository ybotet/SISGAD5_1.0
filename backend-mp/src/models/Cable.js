const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TbCable = sequelize.define("TbCable", {
    id_cable: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    numero: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        len: [0, 13]
      },
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 30]
      },
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
    tableName: 'tb_cable',
    timestamps: true,
    underscored: true
  });

  return TbCable;
};
