// models/Prueba.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TbPrueba = sequelize.define(
    "TbPrueba",
    {
      id_prueba: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      fecha: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      id_resultado: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      id_trabajador: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      id_cable: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      id_clave: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      id_queja: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      // ✅ NO definimos createdAt ni updatedAt aquí
      // Sequelize los crea automáticamente por el timestamps: true
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

  return TbPrueba;
};
