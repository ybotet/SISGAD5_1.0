const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Cable = require('./Cable')(sequelize);
const Clasificacion = require('./Clasificacion')(sequelize);
const Clasificadorclave = require('./Clasificadorclave')(sequelize);
const Clasifpizarra = require('./Clasifpizarra')(sequelize);
const Clave = require('./Clave')(sequelize);
const Grupow = require('./Grupow')(sequelize);
const Linea = require('./Linea')(sequelize);
const Mando = require('./Mando')(sequelize);
const Movimiento = require('./Movimiento')(sequelize);
const Permiso = require('./Permiso')(sequelize);
const Pizarra = require('./Pizarra')(sequelize);
const Planta = require('./Planta')(sequelize);
const Propietario = require('./Propietario')(sequelize);
const Prueba = require('./Prueba')(sequelize);
const Queja = require('./Queja')(sequelize);
const Recorrido = require('./Recorrido')(sequelize);
const Resultadoprueba = require('./Resultadoprueba')(sequelize);
const Rol = require('./Rol')(sequelize);
const Roles_Permisos = require('./Roles_Permisos')(sequelize);
const Senalizacion = require('./Senalizacion')(sequelize);
const Sistema = require('./Sistema')(sequelize);
const Telefono = require('./Telefono')(sequelize);
const Tipolinea = require('./Tipolinea')(sequelize);
const Tipomovimiento = require('./Tipomovimiento')(sequelize);
const Tipopizarra = require('./Tipopizarra')(sequelize);
const Tipoqueja = require('./Tipoqueja')(sequelize);
const Trabajador = require('./Trabajador')(sequelize);
const Trabajo = require('./Trabajo')(sequelize);
const TrabajoTrabajadores = require('./Trabajo_trabajadores')(sequelize);
const User = require('./User')(sequelize);
const User_Roles = require('./User_Roles')(sequelize);


const TbMaterial = require('./tb_material')(sequelize);
const TbMaterialEntregado = require('./tb_material_entregado')(sequelize);
const TbMaterialempleado = require('./tb_materialempleado')(sequelize);
const TbOs = require('./tb_os')(sequelize);



// Configurar relaciones aquí
//#region Primeras relaciones
//clasificadorclave - clave 
Clasificadorclave.hasMany(Clave, { foreignKey: 'id_clasificadorclave', as: 'tb_claves' });
Clave.belongsTo(Clasificadorclave, { foreignKey: 'id_clasificadorclave', as: 'tb_clasificadorclave' });

//Propietario - Sistema
Propietario.hasMany(Sistema, { foreignKey: 'id_propietario', as: 'tb_sistema' });
Sistema.belongsTo(Propietario, { foreignKey: 'id_propietario', as: 'tb_propietario' });

//Trabajador - Grupo de Trabajo
Grupow.hasMany(Trabajador, { foreignKey: 'id_grupow', as: 'tb_trabajadores' });
Trabajador.belongsTo(Grupow, { foreignKey: 'id_grupow', as: 'tb_grupow' });

//Cable - Propietario
Cable.belongsTo(Propietario, { foreignKey: 'id_propietario', as: 'tb_propietario' });
Propietario.hasMany(Cable, { foreignKey: 'id_propietario', as: 'tb_cables' });

//ClasifPizarra - Tipopizarra 1:N
Clasifpizarra.hasMany(Tipopizarra, { foreignKey: 'id_clasifpizarra', as: 'tb_tipopizarra' });
Tipopizarra.belongsTo(Clasifpizarra, { foreignKey: 'id_clasifpizarra', as: 'tb_clasifpizarra' });
//#endregion

//#region Relaciones tipoPizarra -pizarra
Tipopizarra.hasMany(Pizarra, { foreignKey: 'id_tipopizarra', as: 'tb_pizarras' });
Pizarra.belongsTo(Tipopizarra, { foreignKey: 'id_tipopizarra', as: 'tb_tipopizarra' });
//#endregion

//#region Relaciones de Telefono
//Clasificacion - Telefono 1:N
Clasificacion.hasMany(Telefono, { foreignKey: 'id_clasificacion', as: 'tb_telefonos' });
Telefono.belongsTo(Clasificacion, { foreignKey: 'id_clasificacion', as: 'tb_clasificacion' });

//mando - telefono
Mando.hasMany(Telefono, { foreignKey: 'id_mando', as: 'tb_telefonos' });
Telefono.belongsTo(Mando, { foreignKey: 'id_mando', as: 'tb_mando' });

//#endregion

//#region Relaciones de Linea
//Senalizacion - Linea 1:N
Senalizacion.hasMany(Linea, { foreignKey: 'id_senalizacion', as: 'tb_lineas' });
Linea.belongsTo(Senalizacion, { foreignKey: 'id_senalizacion', as: 'tb_senalizacion' });
//TipoLinea - Linea 1:N
Tipolinea.hasMany(Linea, { foreignKey: 'id_tipolinea', as: 'tb_lineas' });
Linea.belongsTo(Tipolinea, { foreignKey: 'id_tipolinea', as: 'tb_tipolinea' });
//Propietario - Linea 1:N
Propietario.hasMany(Linea, { foreignKey: 'id_propietario', as: 'tb_lineas' });
Linea.belongsTo(Propietario, { foreignKey: 'id_propietario', as: 'tb_propietario' });
//#endregion

//#region Relaciones de Recorrido
//Linea - Recorrido 1:N
Linea.hasMany(Recorrido, { foreignKey: 'id_linea', as: 'tb_recorridos' });
Recorrido.belongsTo(Linea, { foreignKey: 'id_linea', as: 'tb_linea' });

//telefono - Recorrido 1:N
Telefono.hasMany(Recorrido, { foreignKey: 'id_telefono', as: 'tb_recorridos' });
Recorrido.belongsTo(Telefono, { foreignKey: 'id_telefono', as: 'tb_telefono' });

//propietario - Recorrido 1:N 
Propietario.hasMany(Recorrido, { foreignKey: 'id_propietario', as: 'tb_recorridos' });
Recorrido.belongsTo(Propietario, { foreignKey: 'id_propietario', as: 'tb_propietario' });

//plantas - Recorrido 1:N
Planta.hasMany(Recorrido, { foreignKey: 'id_planta', as: 'tb_recorridos' });
Recorrido.belongsTo(Planta, { foreignKey: 'id_planta', as: 'tb_planta' });

//cable - Recorrido 1:N
Cable.hasMany(Recorrido, { foreignKey: 'id_cable', as: 'tb_recorridos' });
Recorrido.belongsTo(Cable, { foreignKey: 'id_cable', as: 'tb_cable' });

//sistema - Recorrido 1:N
Sistema.hasMany(Recorrido, { foreignKey: 'id_sistema', as: 'tb_recorridos' });
Recorrido.belongsTo(Sistema, { foreignKey: 'id_sistema', as: 'tb_sistema' });
//#endregion

//#region Relaciones de Queja
//Telefono - Queja 1:N
Telefono.hasMany(Queja, { foreignKey: 'id_telefono', as: 'tb_quejas' });
Queja.belongsTo(Telefono, { foreignKey: 'id_telefono', as: 'tb_telefono' });

//Linea - Queja 1:N
Linea.hasMany(Queja, { foreignKey: 'id_linea', as: 'tb_quejas' });
Queja.belongsTo(Linea, { foreignKey: 'id_linea', as: 'tb_linea' });

//Pizarra - Queja 1:N
Pizarra.hasMany(Queja, { foreignKey: 'id_pizarra', as: 'tb_quejas' });
Queja.belongsTo(Pizarra, { foreignKey: 'id_pizarra', as: 'tb_pizarra' });

//Clave - Queja 1:N
Clave.hasMany(Queja, { foreignKey: 'id_clave', as: 'tb_quejas' });
Queja.belongsTo(Clave, { foreignKey: 'id_clave', as: 'tb_clave' });

//Tipoqueja - Queja 1:N
Tipoqueja.hasMany(Queja, { foreignKey: 'id_tipoqueja', as: 'tb_quejas' });
Queja.belongsTo(Tipoqueja, { foreignKey: 'id_tipoqueja', as: 'tb_tipoqueja' });

//Probador - Queja 1:N
Trabajador.hasMany(Queja, { foreignKey: 'probador', as: 'tb_quejas' });
Queja.belongsTo(Trabajador, { foreignKey: 'probador', as: 'tb_trabajador' });


//#endregion

//#region Relaciones de Prueba
//Queja - Prueba 1:N
Queja.hasMany(Prueba, { foreignKey: 'id_queja', as: 'tb_pruebas' });
Prueba.belongsTo(Queja, { foreignKey: 'id_queja', as: 'tb_queja' });

//ResultadoPrueba - Prueba 1:N
Resultadoprueba.hasMany(Prueba, { foreignKey: 'id_resultado', as: 'tb_pruebas' });
Prueba.belongsTo(Resultadoprueba, { foreignKey: 'id_resultado', as: 'tb_resultadoprueba' });

//Probador - Prueba 1:N
Trabajador.hasMany(Prueba, { foreignKey: 'id_trabajador', as: 'tb_pruebas' });
Prueba.belongsTo(Trabajador, { foreignKey: 'id_trabajador', as: 'tb_trabajador' });

//Cable - Prueba 1:N
Cable.hasMany(Prueba, { foreignKey: 'id_cable', as: 'tb_pruebas' });
Prueba.belongsTo(Cable, { foreignKey: 'id_cable', as: 'tb_cable' });

//Clave - Prueba 1:N
Clave.hasMany(Prueba, { foreignKey: 'id_clave', as: 'tb_pruebas' });
Prueba.belongsTo(Clave, { foreignKey: 'id_clave', as: 'tb_clave' });
//#endregion

//#region Relaciones de Trabajo 
//Trabajo - Trabajador 1:N
Trabajador.hasMany(Trabajo, { foreignKey: 'probador', as: 'tb_trabajo' });
Trabajo.belongsTo(Trabajador, { foreignKey: 'probador', as: 'tb_trabajador' });

Clave.hasMany(Trabajo, { foreignKey: 'estado', as: 'tb_trabajo' });
Trabajo.belongsTo(Clave, { foreignKey: 'estado', as: 'tb_clave' });

//#endregion


//#region Relaciones de Trabajo_trabajadores
Trabajo.hasMany(TrabajoTrabajadores, { foreignKey: 'id_trabajo', as: 'tb_trabajadores' });
TrabajoTrabajadores.belongsTo(Trabajo, { foreignKey: 'id_trabajo', as: 'tb_trabajo' });

Trabajador.hasMany(TrabajoTrabajadores, { foreignKey: 'id_trabajador', as: 'tb_trabajos' });
TrabajoTrabajadores.belongsTo(Trabajador, { foreignKey: 'id_trabajador', as: 'tb_trabajador' });
//#endregion

//#region Relaciones de Usuario, Rol y Permiso
// Usuario <-> Rol (Muchos a Muchos) usando modelos through
User.belongsToMany(Rol, { through: User_Roles, foreignKey: 'id_usuario', otherKey: 'id_rol', as: 'tb_rol' });
Rol.belongsToMany(User, { through: User_Roles, foreignKey: 'id_rol', otherKey: 'id_usuario', as: 'tb_user' });

// Rol <-> Permiso (Muchos a Muchos) usando modelo through
Rol.belongsToMany(Permiso, { through: Roles_Permisos, foreignKey: 'id_rol', otherKey: 'id_permiso', as: 'tb_permiso' });
Permiso.belongsToMany(Rol, { through: Roles_Permisos, foreignKey: 'id_permiso', otherKey: 'id_rol', as: 'tb_rol' });
//#endregion

//#region Relaciones de Movimiento
//Movimiento - Tipomovimiento 1:N
Tipomovimiento.hasMany(Movimiento, { foreignKey: 'id_tipomovimiento', as: 'tb_movimientos' });
Movimiento.belongsTo(Tipomovimiento, { foreignKey: 'id_tipomovimiento', as: 'tb_tipomovimiento' });

//Movimiento - Telefono 1:N
Telefono.hasMany(Movimiento, { foreignKey: 'id_telefono', as: 'tb_movimientos' });
Movimiento.belongsTo(Telefono, { foreignKey: 'id_telefono', as: 'tb_telefono' });

//Movimiento - Linea 1:N
Linea.hasMany(Movimiento, { foreignKey: 'id_linea', as: 'tb_movimientos' });
Movimiento.belongsTo(Linea, { foreignKey: 'id_linea', as: 'tb_linea' });

//Movimiento - Os 1:N
TbOs.hasMany(Movimiento, { foreignKey: 'id_os', as: 'tb_movimientos' });
Movimiento.belongsTo(TbOs, { foreignKey: 'id_os', as: 'tb_os' });
//#endregion

// Sincronizar modelos
const syncModels = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log("✅ Modelos sincronizados con la base de datos");
  } catch (error) {
    console.error("❌ Error sincronizando modelos: ", error);
  }
};

module.exports = {
  sequelize,
  DataTypes,
  syncModels,
  Cable,
  Clasificacion,
  Clasificadorclave,
  Clasifpizarra,
  Clave,
  Grupow,
  Linea,
  Mando,
  Sistema,
  TbMaterial,
  TbMaterialEntregado,
  TbMaterialempleado,
  Movimiento,
  TbOs,
  Permiso,
  Pizarra,
  Planta,
  Propietario,
  Prueba,
  Queja,
  Recorrido,
  Resultadoprueba,
  Rol,
  Roles_Permisos,
  Senalizacion,
  Telefono,
  Tipolinea,
  Tipomovimiento,
  Tipopizarra,
  Tipoqueja,
  Trabajador,
  Trabajo,
  TrabajoTrabajadores,
  User_Roles,
  User
};