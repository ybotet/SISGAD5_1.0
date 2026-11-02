const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TbResultadoprueba = sequelize.define(
    "TbResultadoprueba",
    {
      resultado: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [0, 20],
        },
      },
      id_resultadoprueba: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
    },
    {
      tableName: "tb_resultadoprueba",
      timestamps: true,
      underscored: true,
    },
  );

  return TbResultadoprueba;
};
