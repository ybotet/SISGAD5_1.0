const { DataTypes } = require("sequelize");
const crypto = require("crypto");

module.exports = (sequelize) => {
  const RefreshToken = sequelize.define(
    "RefreshToken",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      token: {
        type: DataTypes.STRING(512),
        allowNull: false,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      revoked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      replaced_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "tb_refresh_tokens",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: false,
      indexes: [
        { fields: ["id_usuario"] },
        { fields: ["token"] },
      ],
    },
  );

  // ✅ Definir asociaciones
  RefreshToken.associate = (models) => {
    if (models.TbUser) {
      RefreshToken.belongsTo(models.TbUser, {
        foreignKey: "id_usuario",
        as: "usuario",
      });
    }
  };

  // ✅ Hash del token para almacenamiento seguro
  RefreshToken.hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
  };

  // ✅ Verificar si el token está expirado
  RefreshToken.prototype.isExpired = function () {
    return new Date() > new Date(this.expires_at);
  };

  // ✅ Verificar si está revocado o expirado (inválido)
  RefreshToken.prototype.isValid = function () {
    return !this.revoked && !this.isExpired();
  };

  return RefreshToken;
};
