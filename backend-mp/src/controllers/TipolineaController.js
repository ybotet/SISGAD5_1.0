const { Tipolinea } = require('../models');
const { Op } = require('sequelize');

const TipolineaController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbTipolinea
   * @access  Public
   */
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'tipo',
        sortOrder = 'ASC',
        search = '',
        ...filters
      } = req.query;

      const offset = (page - 1) * limit;

      // Construir where clause para búsqueda
      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          // Buscar en el campo tipo
          { tipo: { [Op.iLike]: `%${search}%` } }
        ].filter(Boolean);
      }

      // Agregar otros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Tipolinea.findAndCountAll({
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
      console.error('Error en TipolineaController.getAll:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbTipolinea/:id
   * @access  Public
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await Tipolinea.findByPk(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Tipolinea no encontrado'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error en TipolineaController.getById:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbTipolinea
   * @access  Public
   */
  async create(req, res) {
    try {
      const data = await Tipolinea.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'Tipolinea creado exitosamente'
      });
    } catch (error) {
      console.error('Error en TipolineaController.create:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error creando Tipolinea',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbTipolinea/:id
   * @access  Public
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Tipolinea.update(req.body, {
        where: { id_tipolinea: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Tipolinea no encontrado'
        });
      }

      const updatedData = await Tipolinea.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: 'Tipolinea actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en TipolineaController.update:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error actualizando Tipolinea'
      });
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbTipolinea/:id
   * @access  Public
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const affectedRows = await Tipolinea.destroy({
        where: { id_tipolinea: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Tipolinea no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Tipolinea eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en TipolineaController.delete:', error);
      res.status(500).json({
        success: false,
        error: 'Error eliminando Tipolinea'
      });
    }
  }
};

module.exports = TipolineaController;
