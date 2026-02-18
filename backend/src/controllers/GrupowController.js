const { Grupow } = require('../models');
const { Op } = require('sequelize');

const GrupowController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/grupow
   * @access  Public
   */
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'grupo',
        sortOrder = 'ASC',
        search = '',
        ...filters
      } = req.query;

      const offset = (page - 1) * limit;

      // Construir where clause para búsqueda
      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          // Buscar en el campo grupo
          { grupo: { [Op.iLike]: `%${search}%` } }
        ].filter(Boolean);
      }

      // Agregar otros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Grupow.findAndCountAll({
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
      console.error('Error en GrupowController.getAll:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/grupow/:id
   * @access  Public
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await Grupow.findByPk(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Grupo de trabajo no encontrado'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error en GrupowController.getById:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/grupow
   * @access  Public
   */
  async create(req, res) {
    try {
      const data = await Grupow.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'Grupo de trabajo creado exitosamente'
      });
    } catch (error) {
      console.error('Error en GrupowController.create:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error creando el grupo de trabajo',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/grupow/:id
   * @access  Public
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Grupow.update(req.body, {
        where: { id_grupow: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Grupo de trabajo no encontrado'
        });
      }

      const updatedData = await Grupow.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: 'Grupo de trabajo actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en GrupowController.update:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error actualizando Grupow'
      });
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/grupow/:id
   * @access  Public
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const affectedRows = await Grupow.destroy({
        where: { id_grupow: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Grupo de trabajo no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Grupo de trabajo eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en GrupowController.delete:', error);
      res.status(500).json({
        success: false,
        error: 'Error eliminando Grupo de trabajo'
      });
    }
  }
};

module.exports = GrupowController;
