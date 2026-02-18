const { Prueba } = require('../models');
const { Op } = require('sequelize');

const PruebaController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbPrueba
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
        // Prueba solo tiene IDs y fechas, buscar por ID si es número
        if (!isNaN(search)) {
          const searchNum = parseInt(search);
          whereClause[Op.or] = [
            { id_prueba: searchNum },
            { id_resultado: searchNum },
            { id_trabajador: searchNum },
            { id_cable: searchNum },
            { id_clave: searchNum },
            { id_queja: searchNum }
          ];
        }
      }

      // Agregar otros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Prueba.findAndCountAll({
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
      console.error('Error en PruebaController.getAll:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbPrueba/:id
   * @access  Public
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await Prueba.findByPk(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Prueba no encontrado'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error en PruebaController.getById:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbPrueba
   * @access  Public
   */
  async create(req, res) {
    try {
      const data = await Prueba.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'Prueba creado exitosamente'
      });
    } catch (error) {
      console.error('Error en PruebaController.create:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error creando Prueba',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbPrueba/:id
   * @access  Public
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Prueba.update(req.body, {
        where: { id_prueba: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Prueba no encontrado'
        });
      }

      const updatedData = await Prueba.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: 'Prueba actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en PruebaController.update:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error actualizando Prueba'
      });
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbPrueba/:id
   * @access  Public
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const affectedRows = await Prueba.destroy({
        where: { id_prueba: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Prueba no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Prueba eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en PruebaController.delete:', error);
      res.status(500).json({
        success: false,
        error: 'Error eliminando Prueba'
      });
    }
  }
};

module.exports = PruebaController;
