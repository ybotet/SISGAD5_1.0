const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

module.exports = (sequelize) => {
    const TbRol = sequelize.define('TbRol', {
        id_rol: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING(50),
            unique: true,
            allowNull: false
        },
        descripcion: {
            type: DataTypes.TEXT
        },
        activo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
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
        tableName: 'tb_rol',
        timestamps: true,
        underscored: true

    });

    return TbRol;
};