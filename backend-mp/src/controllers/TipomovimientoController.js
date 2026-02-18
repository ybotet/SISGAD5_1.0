const { Tipomovimiento } = require('../models');
const { Op } = require('sequelize');

const TipomovimientoController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbTipomovimiento
   * @access  Public
   */
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'movimiento',
        sortOrder = 'ASC',
        search = '',
        ...filters
      } = req.query;

      const offset = (page - 1) * limit;

      // Construir where clause para búsqueda
      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          // Buscar en el campo movimiento
          { movimiento: { [Op.iLike]: `%${search}%` } }
        ].filter(Boolean);
      }

      // Agregar otros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Tipomovimiento.findAndCountAll({
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
      console.error('Error en TipomovimientoController.getAll:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbTipomovimiento/:id
   * @access  Public
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await Tipomovimiento.findByPk(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Tipomovimiento no encontrado'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error en TipomovimientoController.getById:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbTipomovimiento
   * @access  Public
   */
  async create(req, res) {
    try {
      const data = await Tipomovimiento.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'Tipomovimiento creado exitosamente'
      });
    } catch (error) {
      console.error('Error en TipomovimientoController.create:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error creando Tipomovimiento',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbTipomovimiento/:id
   * @access  Public
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Tipomovimiento.update(req.body, {
        where: { id_tipomovimiento: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Tipomovimiento no encontrado'
        });
      }

      const updatedData = await Tipomovimiento.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: 'Tipomovimiento actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en TipomovimientoController.update:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error actualizando Tipomovimiento'
      });
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbTipomovimiento/:id
   * @access  Public
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const affectedRows = await Tipomovimiento.destroy({
        where: { id_tipomovimiento: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Tipomovimiento no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Tipomovimiento eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en TipomovimientoController.delete:', error);
      res.status(500).json({
        success: false,
        error: 'Error eliminando Tipomovimiento'
      });
    }
  }
};

module.exports = TipomovimientoController;
