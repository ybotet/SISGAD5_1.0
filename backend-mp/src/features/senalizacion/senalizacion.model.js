const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TbSenalizacion = sequelize.define(
    "TbSenalizacion",
    {
      id_senalizacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      senalizacion: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [0, 25],
        },
      },
    },
    {
      tableName: "tb_senalizacion",
      timestamps: true,
      underscored: true,
    },
  );

  return TbSenalizacion;
};
