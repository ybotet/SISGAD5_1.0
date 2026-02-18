const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TbTipomovimiento = sequelize.define('TbTipomovimiento', {
    movimiento: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 3]
      },
    },
    id_tipomovimiento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    estadobaja: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
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
    tableName: 'tb_tipomovimiento',
    timestamps: true,
    underscored: true
  });

  return TbTipomovimiento;
};
