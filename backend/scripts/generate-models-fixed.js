const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function generateModels() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });

    try {
        await client.connect();
        console.log('✅ Conectado a PostgreSQL');

        // Obtener todas las tablas
        const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE 'pg_%'
      AND table_name NOT LIKE 'sql_%'
      ORDER BY table_name
    `;

        const tablesResult = await client.query(tablesQuery);
        const tables = tablesResult.rows.map(row => row.table_name);

        console.log(`📊 Tablas encontradas: ${tables.join(', ')}`);

        // Crear directorio de modelos
        const modelsDir = path.join(__dirname, '../src/models');
        if (!fs.existsSync(modelsDir)) {
            fs.mkdirSync(modelsDir, { recursive: true });
        }

        // Generar modelo para cada tabla
        for (const tableName of tables) {
            await generateModelForTable(client, tableName);
        }

        // Crear archivo index.js
        createModelsIndex(tables);

        console.log('🎉 ¡Todos los modelos generados exitosamente!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

async function generateModelForTable(client, tableName) {
    try {
        // Obtener información de las columnas
        const columnsQuery = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale
      FROM information_schema.columns 
      WHERE table_name = $1
      ORDER BY ordinal_position
    `;

        const columnsResult = await client.query(columnsQuery, [tableName]);
        const columns = columnsResult.rows;

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
    underscored: false
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
        'timestamp without time zone': 'DATE',
        'timestamp with time zone': 'DATE',
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
        if (column.data_type === 'serial' || column.data_type === 'bigserial') {
            options += `    autoIncrement: true,\n`;
        }
    }

    // Allow null
    if (column.is_nullable === 'NO') {
        options += `    allowNull: false,\n`;
    } else {
        options += `    allowNull: true,\n`;
    }

    // Default value
    if (column.column_default) {
        let defaultValue = column.column_default;

        // Limpiar valores por defecto
        if (defaultValue.includes('nextval')) {
            // Es una secuencia, Sequelize maneja autoincrement
        } else if (defaultValue.includes('now()') || defaultValue.includes('CURRENT_TIMESTAMP')) {
            options += `    defaultValue: DataTypes.NOW,\n`;
        } else if (defaultValue === 'true') {
            options += `    defaultValue: true,\n`;
        } else if (defaultValue === 'false') {
            options += `    defaultValue: false,\n`;
        } else if (!isNaN(defaultValue) && defaultValue !== '') {
            options += `    defaultValue: ${Number(defaultValue)},\n`;
        } else {
            // Valor string por defecto
            const cleanValue = defaultValue.replace(/'/g, '');
            options += `    defaultValue: '${cleanValue}',\n`;
        }
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
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}

function createModelsIndex(tableNames) {
    let indexContent = `const { Sequelize, DataTypes } = require('sequelize');\n`;
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
    indexContent += '    await sequelize.sync({ force: false });\n';
    indexContent += '    console.log(\\"✅ Modelos sincronizados con la base de datos\\");\n';
    indexContent += '  } catch (error) {\n';
    indexContent += '    console.error(\\"❌ Error sincronizando modelos: \\", error);\n';
    indexContent += '  }\n';
    indexContent += '};\n\n';

    indexContent += 'module.exports = {\n';
    indexContent += '  sequelize,\n';
    indexContent += '  DataTypes,\n';
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