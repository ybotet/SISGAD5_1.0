const { Clave } = require('../models');
const { Op } = require('sequelize');

const ClaveController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbClave
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
          { clave: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Agregar otros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Clave.findAndCountAll({
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
      console.error('Error en ClaveController.getAll:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbClave/:id
   * @access  Public
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await Clave.findByPk(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Clave no encontrado'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error en ClaveController.getById:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbClave
   * @access  Public
   */
  async create(req, res) {
    try {
      const data = await Clave.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'Clave creado exitosamente'
      });
    } catch (error) {
      console.error('Error en ClaveController.create:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error creando Clave',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbClave/:id
   * @access  Public
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Clave.update(req.body, {
        where: { id_clave: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Clave no encontrado'
        });
      }

      const updatedData = await Clave.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: 'Clave actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en ClaveController.update:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error actualizando Clave'
      });
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbClave/:id
   * @access  Public
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const affectedRows = await Clave.destroy({
        where: { id_clave: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Clave no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Clave eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en ClaveController.delete:', error);
      res.status(500).json({
        success: false,
        error: 'Error eliminando Clave'
      });
    }
  }
};

module.exports = ClaveController;
