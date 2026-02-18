const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = require('./User')(sequelize);
const Rol = require('./Rol')(sequelize);
const Permiso = require('./Permiso')(sequelize);
const Roles_Permisos = require('./Roles_Permisos')(sequelize);
const User_Roles = require('./User_Roles')(sequelize);

// Configurar relaciones
User.belongsToMany(Rol, { through: User_Roles, foreignKey: 'id_usuario', otherKey: 'id_rol', as: 'tb_rol' });
Rol.belongsToMany(User, { through: User_Roles, foreignKey: 'id_rol', otherKey: 'id_usuario', as: 'tb_user' });

Rol.belongsToMany(Permiso, { through: Roles_Permisos, foreignKey: 'id_rol', otherKey: 'id_permiso', as: 'tb_permiso' });
Permiso.belongsToMany(Rol, { through: Roles_Permisos, foreignKey: 'id_permiso', otherKey: 'id_rol', as: 'tb_rol' });

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
  User,
  Rol,
  Permiso,
  Roles_Permisos,
  User_Roles
};