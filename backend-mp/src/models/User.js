const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');


module.exports = (sequelize) => {
    const TbUser = sequelize.define('TbUser', {
        id_usuario: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING(255),
            unique: true,
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        apellidos: {
            type: DataTypes.STRING(100),
            allowNull: false
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
        tableName: 'tb_user',
        timestamps: true,
        underscored: true,
        hooks: {
            beforeCreate: async (usuario) => {
                if (usuario.password_hash) {
                    usuario.password_hash = await bcrypt.hash(usuario.password_hash, 10);
                }
            },
            beforeUpdate: async (usuario) => {
                if (usuario.changed('password_hash')) {
                    usuario.password_hash = await bcrypt.hash(usuario.password_hash, 10);
                }
            }
        }
    });


    // Método para verificar password
    TbUser.prototype.verificarPassword = function (password) {
        return bcrypt.compare(password, this.password_hash);
    };

    return TbUser;
};