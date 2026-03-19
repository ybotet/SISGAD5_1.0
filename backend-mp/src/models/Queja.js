const { DataTypes } = require("sequelize");

// ✅ Exporta una FUNCIÓN que recibe sequelize y retorna el modelo
module.exports = (sequelize) => {
  const TbQueja = sequelize.define(
    "TbQueja",
    {
      num_reporte: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true,
        defaultValue: 0,
        validate: { isInt: { msg: "num_reporte must be integer" } },
      },
      fecha: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: { isDate: { msg: "fecha must be valid date" } },
      },
      prioridad: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: { min: 0, max: 5 },
      },
      probador: { type: DataTypes.INTEGER, allowNull: true },
      claves_flujo: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: true,
        defaultValue: [],
      },
      fechas_flujo: {
        type: DataTypes.ARRAY(DataTypes.DATE),
        allowNull: true,
        defaultValue: [],
      },
      red: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        validate: { isBoolean: { msg: "red must be boolean" } },
      },
      id_queja: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      id_telefono: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "tb_telefono", key: "id_telefono" },
      },
      id_linea: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "tb_linea", key: "id_linea" },
      },
      id_pizarra: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "tb_pizarra", key: "id_pizarra" },
      },
      id_tipoqueja: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "tb_tipoqueja", key: "id_tipoqueja" },
      },
      id_clave: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "tb_clave", key: "id_clave" },
      },
      reportado_por: { type: DataTypes.STRING, allowNull: true },
      estado: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "Abierta",
        validate: {
          isIn: {
            args: [
              ["Abierta", "En Proceso", "Pendiente", "Resuelto", "Cerrada"],
            ],
            msg: "estado must be valid value",
          },
        },
      },
      // created_by: { type: DataTypes.INTEGER, allowNull: true },
      // updated_by: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      tableName: "tb_queja",
      timestamps: true,
      underscored: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",

      hooks: {
        beforeCreate: async (instance, options) => {
          try {
            if (instance.num_reporte && parseInt(instance.num_reporte, 10) > 0)
              return;
            const t = options.transaction || null;
            await sequelize.query(
              "CREATE SEQUENCE IF NOT EXISTS num_reporte_seq START WITH 100000;",
              { transaction: t },
            );
            const [[maxRow]] = await sequelize.query(
              "SELECT COALESCE(MAX(num_reporte)::text, '0') AS maxnum FROM tb_queja;",
              { transaction: t },
            );
            const maxNum = parseInt(maxRow.maxnum || "0", 10) || 0;
            const startValue = Math.max(100000, maxNum + 1);
            let seqLast = null;
            try {
              const [[seqRow]] = await sequelize.query(
                "SELECT last_value::bigint AS last_value FROM num_reporte_seq;",
                { transaction: t },
              );
              seqLast = seqRow?.last_value
                ? parseInt(seqRow.last_value, 10)
                : null;
            } catch (e) {
              seqLast = null;
            }
            if (seqLast === null || seqLast < startValue - 1) {
              await sequelize.query(
                `SELECT setval('num_reporte_seq', ${startValue - 1}, false);`,
                { transaction: t },
              );
            }
            const [[nextRow]] = await sequelize.query(
              "SELECT nextval('num_reporte_seq') AS nextval;",
              { transaction: t },
            );
            instance.num_reporte = parseInt(nextRow.nextval, 10);
          } catch (err) {
            console.error("Error generando num_reporte:", err);
            throw new Error(
              "Error generando num_reporte: " + (err.message || err),
            );
          }
        },
      },

      validate: {
        alMenosUnIdentificador() {
          if (!this.id_telefono && !this.id_linea && !this.id_pizarra) {
            throw new Error("tb_queja: al menos un identificador requerido");
          }
        },
      },
    },
  );

  // ✅ Definir asociaciones (asegúrate que los nombres coincidan con tu index.js)
  TbQueja.associate = (models) => {
    if (models.TbTelefono)
      TbQueja.belongsTo(models.TbTelefono, {
        foreignKey: "id_telefono",
        as: "tb_telefono",
      });
    if (models.TbLinea)
      TbQueja.belongsTo(models.TbLinea, {
        foreignKey: "id_linea",
        as: "tb_linea",
      });
    if (models.TbPizarra)
      TbQueja.belongsTo(models.TbPizarra, {
        foreignKey: "id_pizarra",
        as: "tb_pizarra",
      });
    if (models.Tipoqueja)
      TbQueja.belongsTo(models.Tipoqueja, {
        foreignKey: "id_tipoqueja",
        as: "tb_tipoqueja",
      });
    if (models.Clave)
      TbQueja.belongsTo(models.Clave, {
        foreignKey: "id_clave",
        as: "tb_clave",
      });
    if (models.Trabajador)
      TbQueja.belongsTo(models.Trabajador, {
        foreignKey: "probador",
        as: "tb_trabajador",
      });
    if (models.Prueba)
      TbQueja.hasMany(models.Prueba, {
        foreignKey: "id_queja",
        as: "tb_pruebas",
      });
    if (models.Trabajo)
      TbQueja.hasMany(models.Trabajo, {
        foreignKey: "id_queja",
        as: "tb_trabajos",
      });
  };

  return TbQueja;
};
