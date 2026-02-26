const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TbMando = sequelize.define(
    "TbMando",
    {
      id_mando: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      mando: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [0, 18],
            msg: "El nombre del mando debe tener como máximo 18 caracteres",
          },
          is: {
            args: /^[a-zA-Z0-9\s]*$/i,
            msg: "El nombre del mando solo puede contener letras, números y espacios",
          },
          notNull: {
            msg: "El nombre del mando es requerido",
          },
        },
        unique: true,
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
      tableName: "tb_mando",
      timestamps: true,
      underscored: true,
    },
  );

  return TbMando;
};
