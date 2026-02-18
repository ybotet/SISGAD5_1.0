require('dotenv').config();
const bcrypt = require('bcryptjs');

// Configurar la conexión a la base de datos directamente
const { Sequelize, DataTypes } = require('sequelize');

// Configurar conexión (usa tus credenciales reales)
const sequelize = new Sequelize(
    process.env.DB_NAME || 'sisgad',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || '123',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5433,
        dialect: 'postgres',
        logging: true
    }
);

// Definir modelo User temporal para el script
const User = sequelize.define('User', {
    id_usuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false
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
    underscored: true

});

// Definir modelo Rol temporal
const Rol = sequelize.define('Rol', {
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
    tableName: 'roles',
    timestamps: true,
    underscored: true
});

// Tabla intermedia
const UserRol = sequelize.define('UserRol', {}, {
    tableName: 'tb_user_roles',
    timestamps: true,
    underscored: true,
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
});

// Relaciones
User.belongsToMany(Rol, { through: UserRol, foreignKey: 'id_usuario' });
Rol.belongsToMany(User, { through: UserRol, foreignKey: 'id_rol' });

async function crearUsuarioAdmin() {
    try {
        console.log('🚀 Iniciando creación de usuario admin...');

        // Conectar a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a BD establecida');

        // Sincronizar modelos (solo para desarrollo)
        await sequelize.sync();
        console.log('✅ Modelos sincronizados');

        // Verificar si ya existe
        const usuarioExistente = await User.findOne({
            where: { email: 'admin@sisgad.com' }
        });

        if (usuarioExistente) {
            console.log('⚠️  El usuario admin ya existe');
            console.log('📧 Email existente:', usuarioExistente.email);
            return;
        }

        // Crear rol admin si no existe
        let rolAdmin = await Rol.findOne({ where: { nombre: 'admin' } });
        if (!rolAdmin) {
            console.log('📝 Creando rol admin...');
            rolAdmin = await Rol.create({
                nombre: 'admin',
                descripcion: 'Administrador del sistema con todos los permisos',
                activo: true
            });
            console.log('✅ Rol admin creado');
        }

        // Crear usuario admin
        console.log('🔐 Hasheando contraseña...');
        const passwordHash = await bcrypt.hash('admin123', 10);

        console.log('👤 Creando usuario admin...');
        const usuario = await User.create({
            email: 'admin@sisgad.com',
            password_hash: passwordHash,
            nombre: 'Admin',
            apellidos: 'Sistema',
            activo: true
        });

        console.log('✅ Usuario creado, asignando rol...');

        // Asignar rol admin
        await usuario.addRol(rolAdmin);

        console.log('🎉 USUARIO ADMIN CREADO EXITOSAMENTE');
        console.log('====================================');
        console.log('📧 Email: admin@sisgad.com');
        console.log('🔑 Password: admin123');
        console.log('👤 Nombre: Admin Sistema');
        console.log('🎯 Rol: admin');
        console.log('====================================');

    } catch (error) {
        console.error('❌ ERROR:', error.message);
        console.error('Detalles:', error);
    } finally {
        // Cerrar conexión
        await sequelize.close();
        console.log('🔌 Conexión cerrada');
    }
}

// Ejecutar el script
crearUsuarioAdmin();