const { TbOs } = require('../models');
const { Op } = require('sequelize');

const TbOsController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbOs
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
        // Solo tiene IDs
        if (!isNaN(search)) {
          const searchNum = parseInt(search);
          whereClause[Op.or] = [
            { id_os: searchNum },
            { id_trabajo: searchNum }
          ];
        }
      }

      // Agregar otros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await TbOs.findAndCountAll({
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
      console.error('Error en TbOsController.getAll:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbOs/:id
   * @access  Public
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await TbOs.findByPk(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'TbOs no encontrado'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error en TbOsController.getById:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbOs
   * @access  Public
   */
  async create(req, res) {
    try {
      const data = await TbOs.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'TbOs creado exitosamente'
      });
    } catch (error) {
      console.error('Error en TbOsController.create:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error creando TbOs',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbOs/:id
   * @access  Public
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const [affectedRows] = await TbOs.update(req.body, {
        where: { id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'TbOs no encontrado'
        });
      }

      const updatedData = await TbOs.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: 'TbOs actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en TbOsController.update:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error actualizando TbOs'
      });
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbOs/:id
   * @access  Public
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const affectedRows = await TbOs.destroy({
        where: { id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'TbOs no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'TbOs eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en TbOsController.delete:', error);
      res.status(500).json({
        success: false,
        error: 'Error eliminando TbOs'
      });
    }
  }
};

module.exports = TbOsController;
