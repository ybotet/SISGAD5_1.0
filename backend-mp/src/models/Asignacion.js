const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TbAsignacion = sequelize.define(
    "TbAsignacion",
    {
      id_asignacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      id_queja: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      fechaAsignacion: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "tb_prueba",
      timestamps: true, // ✅ Habilita la creación automática de timestamps
      underscored: true, // ✅ Usa created_at y updated_at en la BD
      createdAt: "created_at", // ✅ Nombre de la columna en BD
      updatedAt: "updated_at", // ✅ Nombre de la columna en BD

      // ✅ Hooks para lógica adicional si la necesitas
      hooks: {
        beforeCreate: (instance, options) => {
          // Esto es automático con timestamps: true
          // Solo lo agregas si necesitas lógica adicional
          console.log("📝 Creando registro en:", new Date().toISOString());
        },
        beforeUpdate: (instance, options) => {
          // Esto es automático con timestamps: true
          console.log("🔄 Actualizando registro en:", new Date().toISOString());
        },
      },
    },
  );
  return TbAsignacion;
};
