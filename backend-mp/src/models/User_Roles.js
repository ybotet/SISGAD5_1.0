const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const User_Roles = sequelize.define('User_Roles', {
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            field: 'id_usuario'
        },
        id_rol: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            field: 'id_rol'
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
        tableName: 'tb_user_roles',
        timestamps: false,
        underscored: true
    });

    return User_Roles;
};
