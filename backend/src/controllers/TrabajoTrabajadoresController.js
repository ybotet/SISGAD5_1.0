const { TrabajoTrabajadores } = require('../models');
const { Op } = require('sequelize');

const TrabajoTrabajadoresController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbTrabajoTrabajadores
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
            { id_trabajo: searchNum },
            { id_trabajador: searchNum }
          ];
        }
      }

      // Agregar otros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await TrabajoTrabajadores.findAndCountAll({
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
      console.error('Error en TrabajoTrabajadoresController.getAll:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbTrabajoTrabajadores/:id
   * @access  Public
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await TrabajoTrabajadores.findByPk(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'TrabajoTrabajadores no encontrado'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error en TrabajoTrabajadoresController.getById:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbTrabajoTrabajadores
   * @access  Public
   */
  async create(req, res) {
    try {
      const data = await TrabajoTrabajadores.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'TrabajoTrabajadores creado exitosamente'
      });
    } catch (error) {
      console.error('Error en TrabajoTrabajadoresController.create:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error creando TrabajoTrabajadores',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbTrabajoTrabajadores/:id
   * @access  Public
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const [affectedRows] = await TrabajoTrabajadores.update(req.body, {
        where: { id_trabajo_trabajadores: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'TrabajoTrabajadores no encontrado'
        });
      }

      const updatedData = await TrabajoTrabajadores.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: 'TrabajoTrabajadores actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en TrabajoTrabajadoresController.update:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error actualizando TrabajoTrabajadores'
      });
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbTrabajoTrabajadores/:id
   * @access  Public
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const affectedRows = await TrabajoTrabajadores.destroy({
        where: { id_trabajo_trabajadores: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'TrabajoTrabajadores no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'TrabajoTrabajadores eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en TrabajoTrabajadoresController.delete:', error);
      res.status(500).json({
        success: false,
        error: 'Error eliminando TrabajoTrabajadores'
      });
    }
  }
};

module.exports = TrabajoTrabajadoresController;
