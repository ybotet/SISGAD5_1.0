const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🔄 Generando modelos desde PostgreSQL...');

// Configuración de conexión
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false
    }
);

async function generateModels() {
    try {
        // Verificar conexión
        await sequelize.authenticate();
        console.log('✅ Conectado a PostgreSQL correctamente');

        // Obtener todas las tablas
        const tables = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name NOT IN ('sequelizemeta')
      ORDER BY table_name
    `, { type: sequelize.QueryTypes.SELECT });

        console.log(`📊 Tablas encontradas: ${tables.length}`);

        // Crear directorio de modelos si no existe
        const modelsDir = path.join(__dirname, '../src/models');
        if (!fs.existsSync(modelsDir)) {
            fs.mkdirSync(modelsDir, { recursive: true });
        }

        // Generar modelo para cada tabla
        for (const table of tables) {
            await generateModelForTable(table.table_name);
        }

        // Crear archivo index.js
        createModelsIndex(tables.map(t => t.table_name));

        console.log('🎉 ¡Todos los modelos generados exitosamente!');

    } catch (error) {
        console.error('❌ Error generando modelos:', error.message);
    } finally {
        await sequelize.close();
    }
}

async function generateModelForTable(tableName) {
    try {
        // Obtener información de las columnas
        const columns = await sequelize.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = '${tableName}'
      ORDER BY ordinal_position
    `, { type: sequelize.QueryTypes.SELECT });

        // Generar contenido del modelo
        const modelContent = generateModelContent(tableName, columns);
        const modelPath = path.join(__dirname, '../src/models', `${tableName}.js`);

        fs.writeFileSync(modelPath, modelContent);
        console.log(`✅ Modelo creado: ${tableName} (${columns.length} columnas)`);

    } catch (error) {
        console.error(`❌ Error generando modelo para ${tableName}:`, error.message);
    }
}

function generateModelContent(tableName, columns) {
    const modelName = toPascalCase(tableName);

    let fieldsContent = '';

    columns.forEach(column => {
        const fieldType = mapPostgresTypeToSequelize(column.data_type);
        const fieldOptions = generateFieldOptions(column);

        fieldsContent += `  ${column.column_name}: {\n`;
        fieldsContent += `    type: DataTypes.${fieldType},\n`;
        fieldsContent += fieldOptions;
        fieldsContent += `  },\n`;
    });

    return `const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ${modelName} = sequelize.define('${modelName}', {
${fieldsContent}
  }, {
    tableName: '${tableName}',
    timestamps: true,
    underscored: true
  });

  return ${modelName};
};
`;
}

function mapPostgresTypeToSequelize(postgresType) {
    const typeMap = {
        'integer': 'INTEGER',
        'bigint': 'BIGINT',
        'serial': 'INTEGER',
        'bigserial': 'BIGINT',
        'text': 'TEXT',
        'varchar': 'STRING',
        'character varying': 'STRING',
        'char': 'STRING',
        'boolean': 'BOOLEAN',
        'date': 'DATEONLY',
        'timestamp': 'DATE',
        'timestamptz': 'DATE',
        'numeric': 'DECIMAL',
        'decimal': 'DECIMAL',
        'real': 'FLOAT',
        'double precision': 'DOUBLE',
        'json': 'JSON',
        'jsonb': 'JSONB'
    };

    return typeMap[postgresType] || 'STRING';
}

function generateFieldOptions(column) {
    let options = '';

    // Primary key (asumiendo que 'id' es PK)
    if (column.column_name === 'id') {
        options += `    primaryKey: true,\n`;
        options += `    autoIncrement: true,\n`;
    }

    // Allow null
    if (column.is_nullable === 'NO') {
        options += `    allowNull: false,\n`;
    }

    // Default value
    if (column.column_default) {
        let defaultValue = column.column_default;

        // Limpiar valores por defecto
        if (defaultValue.includes('nextval')) {
            defaultValue = 'Sequelize.literal("nextval()")';
        } else if (defaultValue.includes('now()')) {
            defaultValue = 'Sequelize.literal("CURRENT_TIMESTAMP")';
        } else if (defaultValue === 'true' || defaultValue === 'false') {
            defaultValue = defaultValue === 'true';
        } else if (!isNaN(defaultValue)) {
            defaultValue = Number(defaultValue);
        } else {
            defaultValue = `'${defaultValue.replace(/'/g, '')}'`;
        }

        options += `    defaultValue: ${defaultValue},\n`;
    }

    // Length for string types
    if (column.character_maximum_length && column.data_type.includes('char')) {
        options += `    validate: {\n`;
        options += `      len: [0, ${column.character_maximum_length}]\n`;
        options += `    },\n`;
    }

    return options;
}

function toPascalCase(str) {
    return str
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}

function createModelsIndex(tableNames) {
    let indexContent = `const { Sequelize } = require('sequelize');\n`;
    indexContent += `const sequelize = require('../config/database');\n\n`;

    // Importar cada modelo
    tableNames.forEach(tableName => {
        const modelName = toPascalCase(tableName);
        indexContent += `const ${modelName} = require('./${tableName}')(sequelize);\n`;
    });

    indexContent += '\n// Configurar relaciones aquí\n';
    indexContent += '// Ejemplo: Usuario.hasMany(Queja);\n\n';

    indexContent += '// Sincronizar modelos\n';
    indexContent += 'const syncModels = async () => {\n';
    indexContent += '  try {\n';
    indexContent += '    await sequelize.sync({ alter: process.env.NODE_ENV === \'development\' });\n';
    indexContent += '    console.log(\'✅ Modelos sincronizados con la base de datos\');\n';
    indexContent += '  } catch (error) {\n';
    indexContent += '    console.error(\'❌ Error sincronizando modelos:\', error);\n';
    indexContent += '  }\n';
    indexContent += '};\n\n';

    indexContent += 'module.exports = {\n';
    indexContent += '  sequelize,\n';
    indexContent += '  syncModels,\n';
    tableNames.forEach(tableName => {
        const modelName = toPascalCase(tableName);
        indexContent += `  ${modelName},\n`;
    });
    indexContent += '};';

    const modelsDir = path.join(__dirname, '../src/models');
    fs.writeFileSync(path.join(modelsDir, 'index.js'), indexContent);
    console.log('✅ Archivo index.js creado');
}

// Ejecutar generación
generateModels();