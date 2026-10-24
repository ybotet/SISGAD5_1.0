const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TbAsignacionTrabajadores = sequelize.define(
    "TbAsignacionTrabajadores",
    {
      id_asignacion_trabajadores: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      id_asignacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_trabajador: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

    },
    {
      tableName: "tb_asignacion_trabajadores",
      timestamps: true, 
      underscored: true, 
      createdAt: "created_at", 
      updatedAt: "updated_at", 

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
  return TbAsignacionTrabajadores;
};
