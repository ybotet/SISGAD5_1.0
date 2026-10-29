const { sequelize } = require("../shared/config/database");

const TbUser = require("./user/user.model")(sequelize);
const TbRol = require("./rol/rol.model")(sequelize);
const TbPermiso = require("./permiso/permiso.model")(sequelize);
const User_Roles = require("./user_rol/user_rol.model")(sequelize);
const Roles_Permisos = require("./roles_permiso/roles_permiso.model")(sequelize);
const RefreshToken = require("./auth/refresh_token.model")(sequelize);

// Configurar relaciones
TbUser.belongsToMany(TbRol, {
  through: User_Roles,
  foreignKey: "id_usuario",
  otherKey: "id_rol",
  as: "tb_rol",
});
TbRol.belongsToMany(TbUser, {
  through: User_Roles,
  foreignKey: "id_rol",
  otherKey: "id_usuario",
  as: "tb_user",
});

TbRol.belongsToMany(TbPermiso, {
  through: Roles_Permisos,
  foreignKey: "id_rol",
  otherKey: "id_permiso",
  as: "tb_permiso",
});
TbPermiso.belongsToMany(TbRol, {
  through: Roles_Permisos,
  foreignKey: "id_permiso",
  otherKey: "id_rol",
  as: "tb_rol",
});

// RefreshToken → TbUser (belongs to)
RefreshToken.belongsTo(TbUser, {
  foreignKey: "id_usuario",
  as: "usuario",
});

// Configurar asociaciones explícitas (los modelos en esta base no usan .associate;
// todas las relaciones se definen directamente arriba, evitando aliased association conflicts)

// Sincronizar modelos
const syncModels = async () => {
  try {
    await sequelize.sync({ alter: false });
    console.log("✅ Modelos sincronizados con la base de datos");
  } catch (error) {
    console.error("❌ Error sincronizando modelos: ", error);
  }
};

module.exports = {
  sequelize,
  syncModels,
  TbUser,
  TbRol,
  TbPermiso,
  User_Roles,
  Roles_Permisos,
  RefreshToken,
};
