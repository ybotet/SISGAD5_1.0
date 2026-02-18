const { Sistema } = require('../models');
const { Op } = require('sequelize');

const SistemaController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbSistema
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
          // Buscar en campos de texto del modelo Sistema
          { sistema: { [Op.iLike]: `%${search}%` } },
          { direccion: { [Op.iLike]: `%${search}%` } }
        ].filter(Boolean);
      }

      // Agregar otros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Sistema.findAndCountAll({
        where: whereClause,
        include: [{
          association: 'tb_propietario',
          attributes: ['id_propietario', 'nombre']
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
      console.error('Error en SistemaController.getAll:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbSistema/:id
   * @access  Public
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await Sistema.findByPk(id, {
        include: [{
          association: 'tb_propietario',
          attributes: ['id_propietario', 'nombre']
        }]
      });

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Sistema no encontrado'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error en SistemaController.getById:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbSistema
   * @access  Public
   */
  async create(req, res) {
    try {
      const data = await Sistema.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'Sistema creado exitosamente'
      });
    } catch (error) {
      console.error('Error en SistemaController.create:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error creando Sistema',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbSistema/:id
   * @access  Public
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Sistema.update(req.body, {
        where: { id_sistema: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Sistema no encontrado'
        });
      }

      const updatedData = await Sistema.findByPk(id, {
        include: [{
          association: 'tb_propietario',
          attributes: ['id_propietario', 'nombre']
        }]
      });

      res.json({
        success: true,
        data: updatedData,
        message: 'Sistema actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en SistemaController.update:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error actualizando Sistema'
      });
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbSistema/:id
   * @access  Public
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const affectedRows = await Sistema.destroy({
        where: { id_sistema: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Sistema no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Sistema eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en SistemaController.delete:', error);
      res.status(500).json({
        success: false,
        error: 'Error eliminando Sistema'
      });
    }
  }
};

module.exports = SistemaController;