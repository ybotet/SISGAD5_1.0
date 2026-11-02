const { Sequelize, DataTypes } = require("sequelize");
const { sequelize, setupPostgresTimezone } = require("../config/database");

// Configurar zona horaria antes de cualquier operación
(async () => {
  try {
    await setupPostgresTimezone();
  } catch (error) {
    console.warn("⚠️ No se pudo configurar zona horaria:", error.message);
  }
})();

const Asignacion = require("./Asignacion")(sequelize);
const AsignacionTrabajadores = require("./AsignacionTrabajadores")(sequelize);
const Cable = require("./Cable")(sequelize);
const Clasificacion = require("./Clasificacion")(sequelize);
const Clasificadorclave = require("./Clasificadorclave")(sequelize);
const Clasifpizarra = require("./Clasifpizarra")(sequelize);
const Clave = require("./Clave")(sequelize);
const Grupow = require("./Grupow")(sequelize);
const Linea = require("./Linea")(sequelize);
const Mando = require("./Mando")(sequelize);
const Movimiento = require("./Movimiento")(sequelize);
const Pizarra = require("./Pizarra")(sequelize);
const Planta = require("./Planta")(sequelize);
const Propietario = require("./Propietario")(sequelize);
const Prueba = require("./Prueba")(sequelize);
const Queja = require("./Queja")(sequelize);
const Recorrido = require("./Recorrido")(sequelize);
const Resultadoprueba = require("./Resultadoprueba")(sequelize);
const Senalizacion = require("./Senalizacion")(sequelize);
const Sistema = require("./Sistema")(sequelize);
const Telefono = require("./Telefono")(sequelize);
const Tipolinea = require("./Tipolinea")(sequelize);
const Tipomovimiento = require("./Tipomovimiento")(sequelize);
const Tipopizarra = require("./Tipopizarra")(sequelize);
const Tipoqueja = require("./Tipoqueja")(sequelize);
const Trabajador = require("./Trabajador")(sequelize);
const Trabajo = require("./Trabajo")(sequelize);
const TrabajoTrabajadores = require("./Trabajo_trabajadores")(sequelize);

// Configurar relaciones aquí
//#region Primeras relaciones
//clasificadorclave - clave
Clasificadorclave.hasMany(Clave, {
  foreignKey: "id_clasificadorclave",
  as: "tb_claves",
});
Clave.belongsTo(Clasificadorclave, {
  foreignKey: "id_clasificadorclave",
  as: "tb_clasificadorclave",
});

//Propietario - Sistema
Propietario.hasMany(Sistema, {
  foreignKey: "id_propietario",
  as: "tb_sistema",
});
Sistema.belongsTo(Propietario, {
  foreignKey: "id_propietario",
  as: "tb_propietario",
});

//Trabajador - Grupo de Trabajo
Grupow.hasMany(Trabajador, { foreignKey: "id_grupow", as: "tb_trabajadores" });
Trabajador.belongsTo(Grupow, { foreignKey: "id_grupow", as: "tb_grupow" });

//Cable - Propietario
Cable.belongsTo(Propietario, {
  foreignKey: "id_propietario",
  as: "tb_propietario",
});
Propietario.hasMany(Cable, { foreignKey: "id_propietario", as: "tb_cables" });

//ClasifPizarra - Tipopizarra 1:N
Clasifpizarra.hasMany(Tipopizarra, {
  foreignKey: "id_clasifpizarra",
  as: "tb_tipopizarra",
});
Tipopizarra.belongsTo(Clasifpizarra, {
  foreignKey: "id_clasifpizarra",
  as: "tb_clasifpizarra",
});
//#endregion

//#region Relaciones tipoPizarra -pizarra
Tipopizarra.hasMany(Pizarra, {
  foreignKey: "id_tipopizarra",
  as: "tb_pizarras",
});
Pizarra.belongsTo(Tipopizarra, {
  foreignKey: "id_tipopizarra",
  as: "tb_tipopizarra",
});
//#endregion

//#region Relaciones de Telefono
//Clasificacion - Telefono 1:N
Clasificacion.hasMany(Telefono, {
  foreignKey: "id_clasificacion",
  as: "tb_telefonos",
});
Telefono.belongsTo(Clasificacion, {
  foreignKey: "id_clasificacion",
  as: "tb_clasificacion",
});

//mando - telefono
Mando.hasMany(Telefono, { foreignKey: "id_mando", as: "tb_telefonos" });
Telefono.belongsTo(Mando, { foreignKey: "id_mando", as: "tb_mando" });

//#endregion

//#region Relaciones de Linea
//Senalizacion - Linea 1:N
Senalizacion.hasMany(Linea, { foreignKey: "id_senalizacion", as: "tb_lineas" });
Linea.belongsTo(Senalizacion, {
  foreignKey: "id_senalizacion",
  as: "tb_senalizacion",
});
//TipoLinea - Linea 1:N
Tipolinea.hasMany(Linea, { foreignKey: "id_tipolinea", as: "tb_lineas" });
Linea.belongsTo(Tipolinea, { foreignKey: "id_tipolinea", as: "tb_tipolinea" });
//Propietario - Linea 1:N
Propietario.hasMany(Linea, { foreignKey: "id_propietario", as: "tb_lineas" });
Linea.belongsTo(Propietario, {
  foreignKey: "id_propietario",
  as: "tb_propietario",
});
//#endregion

//#region Relaciones de Recorrido
//Linea - Recorrido 1:N
Linea.hasMany(Recorrido, { foreignKey: "id_linea", as: "tb_recorridos" });
Recorrido.belongsTo(Linea, { foreignKey: "id_linea", as: "tb_linea" });

//telefono - Recorrido 1:N
Telefono.hasMany(Recorrido, { foreignKey: "id_telefono", as: "tb_recorridos" });
Recorrido.belongsTo(Telefono, { foreignKey: "id_telefono", as: "tb_telefono" });

//propietario - Recorrido 1:N
Propietario.hasMany(Recorrido, {
  foreignKey: "id_propietario",
  as: "tb_recorridos",
});
Recorrido.belongsTo(Propietario, {
  foreignKey: "id_propietario",
  as: "tb_propietario",
});

//plantas - Recorrido 1:N
Planta.hasMany(Recorrido, { foreignKey: "id_planta", as: "tb_recorridos" });
Recorrido.belongsTo(Planta, { foreignKey: "id_planta", as: "tb_planta" });

//cable - Recorrido 1:N
Cable.hasMany(Recorrido, { foreignKey: "id_cable", as: "tb_recorridos" });
Recorrido.belongsTo(Cable, { foreignKey: "id_cable", as: "tb_cable" });

//sistema - Recorrido 1:N
Sistema.hasMany(Recorrido, { foreignKey: "id_sistema", as: "tb_recorridos" });
Recorrido.belongsTo(Sistema, { foreignKey: "id_sistema", as: "tb_sistema" });
//#endregion

//#region Relaciones de Queja
//Telefono - Queja 1:N
Telefono.hasMany(Queja, { foreignKey: "id_telefono", as: "tb_quejas" });
Queja.belongsTo(Telefono, { foreignKey: "id_telefono", as: "tb_telefono" });

//Linea - Queja 1:N
Linea.hasMany(Queja, { foreignKey: "id_linea", as: "tb_quejas" });
Queja.belongsTo(Linea, { foreignKey: "id_linea", as: "tb_linea" });

//Pizarra - Queja 1:N
Pizarra.hasMany(Queja, { foreignKey: "id_pizarra", as: "tb_quejas" });
Queja.belongsTo(Pizarra, { foreignKey: "id_pizarra", as: "tb_pizarra" });

//Clave - Queja 1:N
Clave.hasMany(Queja, { foreignKey: "id_clave", as: "tb_quejas" });
Queja.belongsTo(Clave, { foreignKey: "id_clave", as: "tb_clave" });

//Clave de cierre - Queja 1:N
Clave.hasMany(Queja, { foreignKey: "id_clavecierre", as: "tb_quejas_cierre" });
Queja.belongsTo(Clave, { foreignKey: "id_clavecierre", as: "tb_clave_cierre" });

//Tipoqueja - Queja 1:N
Tipoqueja.hasMany(Queja, { foreignKey: "id_tipoqueja", as: "tb_quejas" });
Queja.belongsTo(Tipoqueja, { foreignKey: "id_tipoqueja", as: "tb_tipoqueja" });

//Probador - Queja 1:N
Trabajador.hasMany(Queja, { foreignKey: "probador", as: "tb_quejas" });
Queja.belongsTo(Trabajador, { foreignKey: "probador", as: "tb_trabajador" });

//#endregion

//#region Relaciones de Prueba
//Queja - Prueba 1:N
Queja.hasMany(Prueba, { foreignKey: "id_queja", as: "tb_pruebas" });
Prueba.belongsTo(Queja, { foreignKey: "id_queja", as: "tb_queja" });

//ResultadoPrueba - Prueba 1:N
Resultadoprueba.hasMany(Prueba, {
  foreignKey: "id_resultado",
  as: "tb_pruebas",
});
Prueba.belongsTo(Resultadoprueba, {
  foreignKey: "id_resultado",
  as: "tb_resultadoprueba",
});

//Probador - Prueba 1:N
Trabajador.hasMany(Prueba, { foreignKey: "id_trabajador", as: "tb_pruebas" });
Prueba.belongsTo(Trabajador, {
  foreignKey: "id_trabajador",
  as: "tb_trabajador",
});

//Cable - Prueba 1:N
Cable.hasMany(Prueba, { foreignKey: "id_cable", as: "tb_pruebas" });
Prueba.belongsTo(Cable, { foreignKey: "id_cable", as: "tb_cable" });

//Clave - Prueba 1:N
Clave.hasMany(Prueba, { foreignKey: "id_clave", as: "tb_pruebas" });
Prueba.belongsTo(Clave, { foreignKey: "id_clave", as: "tb_clave" });
//#endregion

//#region Relaciones de Trabajo
//Trabajo - Trabajador 1:N
Trabajador.hasMany(Trabajo, { foreignKey: "probador", as: "tb_trabajo" });
Trabajo.belongsTo(Trabajador, { foreignKey: "probador", as: "tb_trabajador" });

Clave.hasMany(Trabajo, { foreignKey: "estado", as: "tb_trabajo" });
Trabajo.belongsTo(Clave, { foreignKey: "estado", as: "tb_clave" });

//#endregion

//#region Relaciones de Trabajo_trabajadores
Trabajo.hasMany(TrabajoTrabajadores, {
  foreignKey: "id_trabajo",
  as: "tb_trabajo_trabajadores",
});
TrabajoTrabajadores.belongsTo(Trabajo, {
  foreignKey: "id_trabajo",
  as: "tb_trabajo",
});

Trabajador.hasMany(TrabajoTrabajadores, {
  foreignKey: "id_trabajador",
  as: "tb_trabajo_trabajadores",
});
TrabajoTrabajadores.belongsTo(Trabajador, {
  foreignKey: "id_trabajador",
  as: "tb_trabajador",
});
//#endregion

//#region Relaciones de Movimiento
//Movimiento - Tipomovimiento 1:N
Tipomovimiento.hasMany(Movimiento, {
  foreignKey: "id_tipomovimiento",
  as: "tb_movimientos",
});
Movimiento.belongsTo(Tipomovimiento, {
  foreignKey: "id_tipomovimiento",
  as: "tb_tipomovimiento",
});

//Movimiento - Telefono 1:N
Telefono.hasMany(Movimiento, {
  foreignKey: "id_telefono",
  as: "tb_movimientos",
});
Movimiento.belongsTo(Telefono, {
  foreignKey: "id_telefono",
  as: "tb_telefono",
});

//Movimiento - Linea 1:N
Linea.hasMany(Movimiento, { foreignKey: "id_linea", as: "tb_movimientos" });
Movimiento.belongsTo(Linea, { foreignKey: "id_linea", as: "tb_linea" });

// Relaciones de Asignacion
Asignacion.hasMany(AsignacionTrabajadores, {
  foreignKey: "id_asignacion",
  as: "tb_asignacion_trabajadores",
});
AsignacionTrabajadores.belongsTo(Asignacion, {
  foreignKey: "id_asignacion",
  as: "tb_asignacion",
});

Trabajador.hasMany(AsignacionTrabajadores, {
  foreignKey: "id_trabajador",
  as: "tb_asignacion_trabajadores",
});
AsignacionTrabajadores.belongsTo(Trabajador, {
  foreignKey: "id_trabajador",
  as: "tb_trabajador",
});

// Sincronizar modelos
const syncModels = async () => {
  try {
    // Configurar zona horaria antes de sincronizar
    await setupPostgresTimezone();

    await sequelize.sync({ force: false });
    console.log("✅ Modelos sincronizados con la base de datos");

    // Verificar que las columnas de fecha sean del tipo correcto
    await ensureDateColumnsType();
  } catch (error) {
    console.error("❌ Error sincronizando modelos: ", error);
  }
};

// Función para asegurar que las columnas de fecha sean del tipo correcto
async function ensureDateColumnsType() {
  try {
    // Obtener todas las tablas con columnas de fecha
    const tables = [
      "tb_queja",
      "tb_telefono",
      "tb_linea",
      "tb_pizarra",
      "tb_prueba",
      "tb_asignacion",
      "tb_movimiento",
      "tb_trabajo",
    ];

    for (const table of tables) {
      try {
        // Cambiar columnas de timestamp a text si es necesario
        await sequelize.query(`
          DO $$
          DECLARE
            rec RECORD;
          BEGIN
            FOR rec IN 
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_name = '${table}' 
              AND data_type LIKE '%timestamp%'
            LOOP
              EXECUTE format('ALTER TABLE ${table} ALTER COLUMN ' || rec.column_name || ' TYPE text USING ' || rec.column_name || '::text');
            END LOOP;
          END $$;
        `);
        console.log(`✅ Columnas de fecha en ${table} convertidas a texto`);
      } catch (err) {
        // Si la tabla no existe o hay error, continuar
        if (!err.message.includes("does not exist")) {
          console.warn(`⚠️ Error procesando ${table}:`, err.message);
        }
      }
    }
  } catch (error) {
    console.warn("⚠️ No se pudieron convertir columnas de fecha:", error.message);
  }
}

module.exports = {
  sequelize,
  DataTypes,
  syncModels,
  Asignacion,
  AsignacionTrabajadores,
  Cable,
  Clasificacion,
  Clasificadorclave,
  Clasifpizarra,
  Clave,
  Grupow,
  Linea,
  Mando,
  Sistema,
  Movimiento,
  Pizarra,
  Planta,
  Propietario,
  Prueba,
  Queja,
  Recorrido,
  Resultadoprueba,
  Senalizacion,
  Telefono,
  Tipolinea,
  Tipomovimiento,
  Tipopizarra,
  Tipoqueja,
  Trabajador,
  Trabajo,
  TrabajoTrabajadores,
};
