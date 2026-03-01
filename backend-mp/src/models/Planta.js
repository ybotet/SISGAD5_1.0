const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TbPlanta = sequelize.define(
    "TbPlanta",
    {
      id_planta: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },

      planta: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [0, 12],
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "tb_planta",
      timestamps: true,
      underscored: true,
    },
  );

  return TbPlanta;
};
