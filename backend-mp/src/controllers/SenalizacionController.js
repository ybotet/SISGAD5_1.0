const { Senalizacion } = require('../models');
const { Op } = require('sequelize');

const SenalizacionController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbSenalizacion
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
          { senalizacion: { [Op.iLike]: `%${search}%` } },
        ].filter(Boolean);
      }

      // Agregar otros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Senalizacion.findAndCountAll({
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
      console.error('Error en SenalizacionController.getAll:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbSenalizacion/:id
   * @access  Public
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await Senalizacion.findByPk(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Senalizacion no encontrado'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error en SenalizacionController.getById:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbSenalizacion
   * @access  Public
   */
  async create(req, res) {
    try {
      const data = await Senalizacion.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'Senalizacion creado exitosamente'
      });
    } catch (error) {
      console.error('Error en SenalizacionController.create:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error creando Senalizacion',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbSenalizacion/:id
   * @access  Public
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Senalizacion.update(req.body, {
        where: { id_senalizacion: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Senalizacion no encontrado'
        });
      }

      const updatedData = await Senalizacion.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: 'Senalizacion actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en SenalizacionController.update:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error actualizando Senalizacion'
      });
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbSenalizacion/:id
   * @access  Public
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const affectedRows = await Senalizacion.destroy({
        where: { id_senalizacion: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Senalizacion no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Senalizacion eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en SenalizacionController.delete:', error);
      res.status(500).json({
        success: false,
        error: 'Error eliminando Senalizacion'
      });
    }
  }
};

module.exports = SenalizacionController;
