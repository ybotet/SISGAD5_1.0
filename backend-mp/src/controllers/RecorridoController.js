const { Recorrido } = require('../models');
const { Op } = require('sequelize');

const RecorridoController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbRecorrido
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
          { recorrido: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Agregar otros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Recorrido.findAndCountAll({
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
      console.error('Error en RecorridoController.getAll:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbRecorrido/:id
   * @access  Public
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await Recorrido.findByPk(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Recorrido no encontrado'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error en RecorridoController.getById:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbRecorrido
   * @access  Public
   */
  async create(req, res) {
    try {
      const data = await Recorrido.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'Recorrido creado exitosamente'
      });
    } catch (error) {
      console.error('Error en RecorridoController.create:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error creando Recorrido',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbRecorrido/:id
   * @access  Public
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Recorrido.update(req.body, {
        where: { id_recorrido: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Recorrido no encontrado'
        });
      }

      const updatedData = await Recorrido.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: 'Recorrido actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en RecorridoController.update:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error actualizando Recorrido'
      });
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbRecorrido/:id
   * @access  Public
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const affectedRows = await Recorrido.destroy({
        where: { id_recorrido: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Recorrido no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Recorrido eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en RecorridoController.delete:', error);
      res.status(500).json({
        success: false,
        error: 'Error eliminando Recorrido'
      });
    }
  }
};

module.exports = RecorridoController;
