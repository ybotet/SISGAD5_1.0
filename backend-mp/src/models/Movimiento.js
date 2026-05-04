const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TbMovimiento = sequelize.define(
    "TbMovimiento",
    {
      id_movimiento: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      id_tipomovimiento: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fecha: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      motivo: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [0, 100],
        },
      },
      id_os: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      os: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      id_telefono: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      id_linea: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "tb_movimiento",
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

  return TbMovimiento;
};
