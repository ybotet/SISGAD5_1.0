const { Clasificadorclave } = require('../models');
const { Op } = require('sequelize');

const ClasificadorclaveController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbClasificadorclave
   * @access  Public
   */
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'clasificador',
        sortOrder = 'ASC',
        search = '',
        ...filters
      } = req.query;

      const offset = (page - 1) * limit;

      // Construir where clause para búsqueda
      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          // Buscar en el campo clasificador
          { clasificador: { [Op.iLike]: `%${search}%` } }
        ].filter(Boolean);
      }

      // Agregar otros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Clasificadorclave.findAndCountAll({
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
      console.error('Error en ClasificadorclaveController.getAll:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbClasificadorclave/:id
   * @access  Public
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await Clasificadorclave.findByPk(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Clasificadorclave no encontrado'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error en ClasificadorclaveController.getById:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbClasificadorclave
   * @access  Public
   */
  async create(req, res) {
    try {
      const data = await Clasificadorclave.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'Clasificadorclave creado exitosamente'
      });
    } catch (error) {
      console.error('Error en ClasificadorclaveController.create:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error creando Clasificadorclave',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbClasificadorclave/:id
   * @access  Public
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Clasificadorclave.update(req.body, {
        where: { id_clasificadorclave: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Clasificadorclave no encontrado'
        });
      }

      const updatedData = await Clasificadorclave.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: 'Clasificadorclave actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en ClasificadorclaveController.update:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error actualizando Clasificadorclave'
      });
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbClasificadorclave/:id
   * @access  Public
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const affectedRows = await Clasificadorclave.destroy({
        where: { id_clasificadorclave: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Clasificadorclave no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Clasificadorclave eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en ClasificadorclaveController.delete:', error);
      res.status(500).json({
        success: false,
        error: 'Error eliminando Clasificadorclave'
      });
    }
  }
};

module.exports = ClasificadorclaveController;
