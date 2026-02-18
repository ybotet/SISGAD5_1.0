const { Tipopizarra } = require('../models');
const { Op } = require('sequelize');

const TipopizarraController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbTipopizarra
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
          { tipo: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Agregar otros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Tipopizarra.findAndCountAll({
        where: whereClause,
        include: [{
          association: 'tb_clasifpizarra',
          attributes: ['id_clasifpizarra', 'clasificacion']
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
      console.error('Error en TipopizarraController.getAll:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbTipopizarra/:id
   * @access  Public
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await Tipopizarra.findByPk(id, {
        include: [{
          association: 'tb_clasifpizarra',
          attributes: ['id_clasifpizarra', 'clasificacion']
        }]
      });

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Tipopizarra no encontrado'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error en TipopizarraController.getById:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbTipopizarra
   * @access  Public
   */
  async create(req, res) {
    try {
      const data = await Tipopizarra.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'Tipopizarra creado exitosamente'
      });
    } catch (error) {
      console.error('Error en TipopizarraController.create:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error creando Tipopizarra',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbTipopizarra/:id
   * @access  Public
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Tipopizarra.update(req.body, {
        where: { id_tipopizarra: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Tipopizarra no encontrado'
        });
      }

      const updatedData = await Tipopizarra.findByPk(id, {
        include: [{
          association: 'tb_clasifpizarra',
          attributes: ['id_clasifpizarra', 'clasificacion']
        }]
      });

      res.json({
        success: true,
        data: updatedData,
        message: 'Tipopizarra actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en TipopizarraController.update:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error actualizando Tipopizarra'
      });
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbTipopizarra/:id
   * @access  Public
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const affectedRows = await Tipopizarra.destroy({
        where: { id_tipopizarra: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Tipopizarra no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Tipopizarra eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en TipopizarraController.delete:', error);
      res.status(500).json({
        success: false,
        error: 'Error eliminando Tipopizarra'
      });
    }
  }
};

module.exports = TipopizarraController;
