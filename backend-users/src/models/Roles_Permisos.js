const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Roles_Permisos = sequelize.define('Roles_Permisos', {
        id_rol: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            field: 'id_rol'
        },
        id_permiso: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            field: 'id_permiso'
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'tb_roles_permisos',
        timestamps: false,
        underscored: true
    });
    return Roles_Permisos;
}