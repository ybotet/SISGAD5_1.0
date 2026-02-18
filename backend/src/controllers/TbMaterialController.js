const { TbMaterial } = require('../models');
const { Op } = require('sequelize');

const TbMaterialController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbMaterial
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
          { material: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Agregar otros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await TbMaterial.findAndCountAll({
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
      console.error('Error en TbMaterialController.getAll:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbMaterial/:id
   * @access  Public
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await TbMaterial.findByPk(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'TbMaterial no encontrado'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error en TbMaterialController.getById:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbMaterial
   * @access  Public
   */
  async create(req, res) {
    try {
      const data = await TbMaterial.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'TbMaterial creado exitosamente'
      });
    } catch (error) {
      console.error('Error en TbMaterialController.create:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error creando TbMaterial',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbMaterial/:id
   * @access  Public
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const [affectedRows] = await TbMaterial.update(req.body, {
        where: { id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'TbMaterial no encontrado'
        });
      }

      const updatedData = await TbMaterial.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: 'TbMaterial actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en TbMaterialController.update:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error actualizando TbMaterial'
      });
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbMaterial/:id
   * @access  Public
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const affectedRows = await TbMaterial.destroy({
        where: { id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'TbMaterial no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'TbMaterial eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en TbMaterialController.delete:', error);
      res.status(500).json({
        success: false,
        error: 'Error eliminando TbMaterial'
      });
    }
  }
};

module.exports = TbMaterialController;
