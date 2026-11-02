const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TbPermiso = sequelize.define(
    "TbPermiso",
    {
      id_permiso: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
      },
      modulo: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      accion: {
        type: DataTypes.STRING(50),
        allowNull: false,
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
      tableName: "tb_permiso",
      timestamps: true,
      underscored: true,
    },
  );

  // ✅ Definir asociaciones
  TbPermiso.associate = (models) => {
    if (models.TbRol) {
      TbPermiso.belongsToMany(models.TbRol, {
        through: models.Roles_Permisos,
        foreignKey: "id_permiso",
        otherKey: "id_rol",
        as: "tb_rol",
      });
    }
  };

  return TbPermiso;
};
