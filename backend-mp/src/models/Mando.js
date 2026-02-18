const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TbMando = sequelize.define('TbMando', {
    mando: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 18]
      },
    },
    id_mando: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
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
    tableName: 'tb_mando',
    timestamps: true,
    underscored: true
  });

  return TbMando;
};
