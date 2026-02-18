const { Planta } = require('../models');
const { Op } = require('sequelize');

const PlantaController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbPlanta
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
          { planta: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Agregar otros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Planta.findAndCountAll({
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
      console.error('Error en PlantaController.getAll:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbPlanta/:id
   * @access  Public
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await Planta.findByPk(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Planta no encontrado'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error en PlantaController.getById:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbPlanta
   * @access  Public
   */
  async create(req, res) {
    try {
      const data = await Planta.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'Planta creado exitosamente'
      });
    } catch (error) {
      console.error('Error en PlantaController.create:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error creando Planta',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbPlanta/:id
   * @access  Public
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Planta.update(req.body, {
        where: { id_planta: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Planta no encontrado'
        });
      }

      const updatedData = await Planta.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: 'Planta actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en PlantaController.update:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error actualizando Planta'
      });
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbPlanta/:id
   * @access  Public
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const affectedRows = await Planta.destroy({
        where: { id_planta: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Planta no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Planta eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en PlantaController.delete:', error);
      res.status(500).json({
        success: false,
        error: 'Error eliminando Planta'
      });
    }
  }
};

module.exports = PlantaController;
