const { Propietario } = require('../models');
const { Op } = require('sequelize');

const PropietarioController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbPropietario
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
          // Buscar en el campo nombre
          { nombre: { [Op.iLike]: `%${search}%` } }
        ].filter(Boolean);
      }

      // Agregar otros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Propietario.findAndCountAll({
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
      console.error('Error en PropietarioController.getAll:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbPropietario/:id
   * @access  Public
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await Propietario.findByPk(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Propietario no encontrado'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error en PropietarioController.getById:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbPropietario
   * @access  Public
   */
  async create(req, res) {
    try {
      const data = await Propietario.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'Propietario creado exitosamente'
      });
    } catch (error) {
      console.error('Error en PropietarioController.create:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error creando Propietario',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbPropietario/:id
   * @access  Public
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Propietario.update(req.body, {
        where: { id_propietario: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Propietario no encontrado'
        });
      }

      const updatedData = await Propietario.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: 'Propietario actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en PropietarioController.update:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error actualizando Propietario'
      });
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbPropietario/:id
   * @access  Public
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const affectedRows = await Propietario.destroy({
        where: { id_propietario: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Propietario no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Propietario eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en PropietarioController.delete:', error);
      res.status(500).json({
        success: false,
        error: 'Error eliminando Propietario'
      });
    }
  }
};

module.exports = PropietarioController;
