const { Clasifpizarra } = require('../models');
const { Op } = require('sequelize');

const ClasifpizarraController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbClasifpizarra
   * @access  Public
   */
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'clasificacion',
        sortOrder = 'ASC',
        search = '',
        ...filters
      } = req.query;

      const offset = (page - 1) * limit;

      // Construir where clause para búsqueda
      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          // Buscar en el campo clasificacion
          { clasificacion: { [Op.iLike]: `%${search}%` } }
        ].filter(Boolean);
      }

      // Agregar otros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Clasifpizarra.findAndCountAll({
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
      console.error('Error en ClasifpizarraController.getAll:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbClasifpizarra/:id
   * @access  Public
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await Clasifpizarra.findByPk(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Clasifpizarra no encontrado'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error en ClasifpizarraController.getById:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbClasifpizarra
   * @access  Public
   */
  async create(req, res) {
    try {
      const data = await Clasifpizarra.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'Clasifpizarra creado exitosamente'
      });
    } catch (error) {
      console.error('Error en ClasifpizarraController.create:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error creando Clasifpizarra',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbClasifpizarra/:id
   * @access  Public
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Clasifpizarra.update(req.body, {
        where: { id_clasifpizarra: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Clasifpizarra no encontrado'
        });
      }

      const updatedData = await Clasifpizarra.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: 'Clasifpizarra actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en ClasifpizarraController.update:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error actualizando Clasifpizarra'
      });
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbClasifpizarra/:id
   * @access  Public
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const affectedRows = await Clasifpizarra.destroy({
        where: { id_clasifpizarra: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Clasifpizarra no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Clasifpizarra eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en ClasifpizarraController.delete:', error);
      res.status(500).json({
        success: false,
        error: 'Error eliminando Clasifpizarra'
      });
    }
  }
};

module.exports = ClasifpizarraController;
