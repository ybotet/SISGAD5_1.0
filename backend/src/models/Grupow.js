const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Grupow = sequelize.define('TbGrupow', {
    id_grupow: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    grupo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
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
    tableName: 'tb_grupow',
    timestamps: true,
    underscored: true
  });

  return Grupow;
};
