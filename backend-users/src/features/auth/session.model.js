const { DataTypes } = require("sequelize");

/**
 * Modelo: tb_sesiones
 * Historial de sesiones de usuario. Registra cada login, refresh y logout.
 * @see SPEC.md §5.1 — `sesiones` (Historial de sesiones)
 */
module.exports = (sequelize) => {
  const Sesion = sequelize.define(
    "Sesion",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      evento: {
        type: DataTypes.ENUM("login", "refresh", "logout"),
        allowNull: false,
      },
      ip: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      exitoso: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      // Detalle opcional (error message, token rotado, etc.)
      detalle: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "tb_sesiones",
      timestamps: false,
      underscored: true,
      createdAt: false,
      updatedAt: false,
      indexes: [
        { fields: ["id_usuario"] },
        { fields: ["evento"] },
        { fields: ["fecha"] },
      ],
    },
  );

  // ✅ Definir asociaciones
  Sesion.associate = (models) => {
    if (models.TbUser) {
      Sesion.belongsTo(models.TbUser, {
        foreignKey: "id_usuario",
        as: "usuario",
      });
    }
  };

  return Sesion;
};
