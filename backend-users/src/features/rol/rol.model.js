const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TbRol = sequelize.define(
    "TbRol",
    {
      id_rol: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
        validate: {
          isIn: {
            args: [["admin", "probador", "editor", "visor", "admin_materiales"]],
            msg: "estado must be valid value",
          },
        },
      },
      descripcion: {
        type: DataTypes.TEXT,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
      tableName: "tb_rol",
      timestamps: true,
      underscored: true,
    },
  );

  // ✅ Definir asociaciones
  TbRol.associate = (models) => {
    if (models.TbUser) {
      TbRol.belongsToMany(models.TbUser, {
        through: models.User_Roles,
        foreignKey: "id_rol",
        otherKey: "id_usuario",
        as: "tb_user",
      });
    }
    if (models.TbPermiso) {
      TbRol.belongsToMany(models.TbPermiso, {
        through: models.Roles_Permisos,
        foreignKey: "id_rol",
        otherKey: "id_permiso",
        as: "tb_permiso",
      });
    }
  };

  return TbRol;
};
