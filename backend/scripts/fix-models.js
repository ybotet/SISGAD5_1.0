const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🔧 Corrigiendo estructura de modelos...');

const modelsDir = path.join(__dirname, '../src/models');
const modelFiles = fs.readdirSync(modelsDir)
    .filter(file => file.endsWith('.js') && file !== 'index.js');

// Corregir cada modelo
modelFiles.forEach(file => {
    const filePath = path.join(modelsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Verificar si el modelo tiene la estructura correcta
    if (!content.includes('module.exports = (sequelize)')) {
        console.log(`🔄 Corrigiendo: ${file}`);

        // Reemplazar la estructura
        content = content.replace(
            /const \{ DataTypes \} = require\('sequelize'\);\s*module\.exports = \(sequelize, DataTypes\) => \{/,
            `const { DataTypes } = require('sequelize');\n\nmodule.exports = (sequelize) => {`
        );

        fs.writeFileSync(filePath, content);
        console.log(`✅ Corregido: ${file}`);
    }
});

// Recrear el index.js correctamente
createFixedIndex();

console.log('🎉 Modelos corregidos exitosamente!');

function createFixedIndex() {
    let indexContent = `const { Sequelize, DataTypes } = require('sequelize');\n`;
    indexContent += `const sequelize = require('../config/database');\n\n`;

    // Importar cada modelo
    modelFiles.forEach(file => {
        const modelName = path.basename(file, '.js');
        const className = toPascalCase(modelName);
        indexContent += `const ${className} = require('./${modelName}')(sequelize, DataTypes);\n`;
    });

    indexContent += '\n// Configurar relaciones aquí\n';
    indexContent += '// Ejemplo: Usuario.hasMany(Queja);\n\n';

    indexContent += '// Sincronizar modelos\n';
    indexContent += 'const syncModels = async () => {\n';
    indexContent += '  try {\n';
    indexContent += '    await sequelize.sync({ alter: process.env.NODE_ENV === \\' + development + '\\ });\n';
    indexContent += '    console.log(\\"✅ Modelos sincronizados con la base de datos\\");\n';
    indexContent += '  } catch (error) {\n';
    indexContent += '    console.error(\\"❌ Error sincronizando modelos:\\", error);\n';
    indexContent += '  }\n';
    indexContent += '};\n\n';

    indexContent += 'module.exports = {\n';
    indexContent += '  sequelize,\n';
    indexContent += '  DataTypes,\n';
    indexContent += '  syncModels,\n';
    modelFiles.forEach(file => {
        const modelName = path.basename(file, '.js');
        const className = toPascalCase(modelName);
        indexContent += `  ${className},\n`;
    });
    indexContent += '};';

    fs.writeFileSync(path.join(modelsDir, 'index.js'), indexContent);
    console.log('✅ index.js recreado correctamente');
}

function toPascalCase(str) {
    return str
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}