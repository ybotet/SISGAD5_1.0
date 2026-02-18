const { Pizarra } = require('../models');
const { Op } = require('sequelize');

const PizarraController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbPizarra
   * @access  Public
   */
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'updatedAt',
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

      const data = await Pizarra.findAndCountAll({
        where: whereClause,
        include: [{
          association: 'tb_tipopizarra',
          attributes: ['id_tipopizarra', 'tipo']
        }],
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
      console.error('Error en PizarraController.getAll:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbPizarra/:id
   * @access  Public
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await Pizarra.findByPk(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Pizarra no encontrado'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error en PizarraController.getById:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbPizarra
   * @access  Public
   */
  async create(req, res) {
    try {
      const data = await Pizarra.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'Pizarra creado exitosamente'
      });
    } catch (error) {
      console.error('Error en PizarraController.create:', error);

      if (error.name === 'SequelizeValidationError') {
        const mensajes = error.errors.map(err => err.message).join('. ');
        return res.status(400).json({
          success: false,
          message: mensajes,
          error: mensajes,
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        message: 'Error creando pizarra',
        error: 'Error creando Pizarra',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbPizarra/:id
   * @access  Public
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Pizarra.update(req.body, {
        where: { id_pizarra: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Pizarra no encontrado'
        });
      }

      const updatedData = await Pizarra.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: 'Pizarra actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en PizarraController.update:', error);

      if (error.name === 'SequelizeValidationError') {
        const mensajes = error.errors.map(err => err.message).join('. ');
        return res.status(400).json({
          success: false,
          message: mensajes,
          error: mensajes,
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        message: 'Error actualizando pizarra',
        error: 'Error actualizando Pizarra'
      });
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbPizarra/:id
   * @access  Public
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const affectedRows = await Pizarra.destroy({
        where: { id_pizarra: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Pizarra no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Pizarra eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en PizarraController.delete:', error);
      res.status(500).json({
        success: false,
        error: 'Error eliminando Pizarra'
      });
    }
  }
};

module.exports = PizarraController;
