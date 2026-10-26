const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TbTrabajador = sequelize.define(
    "TbTrabajador",
    {
      id_trabajador: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      clave_trabajador: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [0, 10],
        },
      },
      id_operario_v: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [0, 10],
        },
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [0, 18],
        },
      },
      cargo: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [0, 40],
        },
      },
      id_grupow: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },

    },
    {
      tableName: "tb_trabajador",
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

  return TbTrabajador;
};
