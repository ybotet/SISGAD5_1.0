const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TbPizarra = sequelize.define(
    "TbPizarra",
    {
      id_pizarra: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "El nombre es obligatorio",
          },
          notEmpty: {
            msg: "El nombre no puede estar vacío",
          },
        },
      },
      direccion: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "La dirección es obligatoria",
          },
          notEmpty: {
            msg: "la dirección no puede estar vacía",
          },
        },
      },
      observacion: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      id_tipopizarra: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

    },
    {
      tableName: "tb_pizarra",
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

  return TbPizarra;
};
