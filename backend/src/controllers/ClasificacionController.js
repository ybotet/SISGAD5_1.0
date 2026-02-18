const { Clasificacion } = require('../models');
const { Op } = require('sequelize');

const ClasificacionController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbClasificacion
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
          { nombre: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Agregar otros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Clasificacion.findAndCountAll({
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
      console.error('Error en ClasificacionController.getAll:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbClasificacion/:id
   * @access  Public
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await Clasificacion.findByPk(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Clasificacion no encontrado'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error en ClasificacionController.getById:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbClasificacion
   * @access  Public
   */
  async create(req, res) {
    try {
      const data = await Clasificacion.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'Clasificacion creado exitosamente'
      });
    } catch (error) {
      console.error('Error en ClasificacionController.create:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error creando Clasificacion',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbClasificacion/:id
   * @access  Public
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Clasificacion.update(req.body, {
        where: { id_clasificacion: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Clasificacion no encontrado'
        });
      }

      const updatedData = await Clasificacion.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: 'Clasificacion actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en ClasificacionController.update:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error actualizando Clasificacion'
      });
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbClasificacion/:id
   * @access  Public
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const affectedRows = await Clasificacion.destroy({
        where: { id_clasificacion: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Clasificacion no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Clasificacion eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en ClasificacionController.delete:', error);
      res.status(500).json({
        success: false,
        error: 'Error eliminando Clasificacion'
      });
    }
  }
};

module.exports = ClasificacionController;
