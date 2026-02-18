const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🔄 Generando CRUDs automáticamente...');

// Obtener todos los modelos
const modelsDir = path.join(__dirname, '../src/models');
const modelFiles = fs.readdirSync(modelsDir)
    .filter(file => file.endsWith('.js') && file !== 'index.js')
    .map(file => path.basename(file, '.js'));

console.log(`📁 Modelos encontrados: ${modelFiles.join(', ')}`);

// Crear directorios si no existen
const controllersDir = path.join(__dirname, '../src/controllers');
const routesDir = path.join(__dirname, '../src/routes');

if (!fs.existsSync(controllersDir)) fs.mkdirSync(controllersDir, { recursive: true });
if (!fs.existsSync(routesDir)) fs.mkdirSync(routesDir, { recursive: true });

// Generar CRUD para cada modelo
modelFiles.forEach(modelName => {
    generateController(modelName);
    generateRoutes(modelName);
    console.log(`✅ CRUD generado para: ${modelName}`);
});

// Crear archivo de rutas principal
createMainRoutesFile(modelFiles);

console.log('🎉 ¡Todos los CRUDs generados exitosamente!');
console.log('📝 Próximos pasos:');
console.log('   1. Revisar controladores en src/controllers/');
console.log('   2. Revisar rutas en src/routes/');
console.log('   3. Actualizar server.js para cargar las rutas');

function generateController(modelName) {
    const singular = toPascalCase(modelName);
    const plural = toCamelCase(modelName);
    const controllerName = `${singular}Controller`;

    const controllerContent = `const { ${singular} } = require('../models');
const { Op } = require('sequelize');

const ${controllerName} = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/${plural}
   * @access  Public
   */
  async getAll(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        sortBy = 'createdAt', 
        sortOrder = 'DESC',
        search = '',
        ...filters 
      } = req.query;

      const offset = (page - 1) * limit;
      
      // Construir where clause para búsqueda
      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          // Buscar en campos de texto (ajusta según tus campos)
          { nombre: { [Op.iLike]: \`%\${search}%\" } },
          { descripcion: { [Op.iLike]: \`%\${search}%\" } },
          { email: { [Op.iLike]: \`%\${search}%\" } }
        ].filter(Boolean);
      }

      // Agregar otros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await ${singular}.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: offset,
        order: [[sortBy, sortOrder.toUpperCase()]]
      });

      res.json({
        success: true,
        data: data.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: data.count,
          pages: Math.ceil(data.count / limit)
        }
      });
    } catch (error) {
      console.error('Error en ${controllerName}.getAll:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/${plural}/:id
   * @access  Public
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await ${singular}.findByPk(id);

      if (!data) {
        return res.status(404).json({ 
          success: false, 
          error: '${singular} no encontrado' 
        });
      }

      res.json({ 
        success: true, 
        data 
      });
    } catch (error) {
      console.error('Error en ${controllerName}.getById:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor' 
      });
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/${plural}
   * @access  Public
   */
  async create(req, res) {
    try {
      const data = await ${singular}.create(req.body);
      
      res.status(201).json({ 
        success: true, 
        data,
        message: '${singular} creado exitosamente'
      });
    } catch (error) {
      console.error('Error en ${controllerName}.create:', error);
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          success: false, 
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({ 
        success: false, 
        error: 'Error creando ${singular}',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/${plural}/:id
   * @access  Public
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      
      const [affectedRows] = await ${singular}.update(req.body, {
        where: { id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({ 
          success: false, 
          error: '${singular} no encontrado' 
        });
      }

      const updatedData = await ${singular}.findByPk(id);
      
      res.json({ 
        success: true, 
        data: updatedData,
        message: '${singular} actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en ${controllerName}.update:', error);
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          success: false, 
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({ 
        success: false, 
        error: 'Error actualizando ${singular}' 
      });
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/${plural}/:id
   * @access  Public
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const affectedRows = await ${singular}.destroy({
        where: { id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({ 
          success: false, 
          error: '${singular} no encontrado' 
        });
      }

      res.json({ 
        success: true, 
        message: '${singular} eliminado exitosamente' 
      });
    } catch (error) {
      console.error('Error en ${controllerName}.delete:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error eliminando ${singular}' 
      });
    }
  }
};

module.exports = ${controllerName};
`;

    fs.writeFileSync(path.join(controllersDir, `${controllerName}.js`), controllerContent);
}

function generateRoutes(modelName) {
    const singular = toPascalCase(modelName);
    const plural = toCamelCase(modelName);
    const controllerName = `${singular}Controller`;
    const routeFileName = `${plural}.js`;

    const routesContent = `const express = require('express');
const router = express.Router();
const ${controllerName} = require('../controllers/${controllerName}');

/**
 * @route   GET /api/${plural}
 * @desc    Obtener todos los ${plural}
 * @access  Public
 */
router.get('/', ${controllerName}.getAll);

/**
 * @route   GET /api/${plural}/:id
 * @desc    Obtener un ${singular} por ID
 * @access  Public
 */
router.get('/:id', ${controllerName}.getById);

/**
 * @route   POST /api/${plural}
 * @desc    Crear nuevo ${singular}
 * @access  Public
 */
router.post('/', ${controllerName}.create);

/**
 * @route   PUT /api/${plural}/:id
 * @desc    Actualizar ${singular}
 * @access  Public
 */
router.put('/:id', ${controllerName}.update);

/**
 * @route   DELETE /api/${plural}/:id
 * @desc    Eliminar ${singular}
 * @access  Public
 */
router.delete('/:id', ${controllerName}.delete);

module.exports = router;
`;

    fs.writeFileSync(path.join(routesDir, routeFileName), routesContent);
}

function createMainRoutesFile(modelFiles) {
    let mainRoutesContent = `const express = require('express');
const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Importar y usar todas las rutas automáticamente
`;

    modelFiles.forEach(modelName => {
        const plural = toCamelCase(modelName);
        mainRoutesContent += `router.use('/${plural}', require('./${plural}'));\n`;
    });

    mainRoutesContent += `
// Ruta de fallback para APIs no encontradas
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint de API no encontrado',
    path: req.originalUrl
  });
});

module.exports = router;
`;

    fs.writeFileSync(path.join(routesDir, 'index.js'), mainRoutesContent);
}

function toPascalCase(str) {
    return str
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}

function toCamelCase(str) {
    const pascal = toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}