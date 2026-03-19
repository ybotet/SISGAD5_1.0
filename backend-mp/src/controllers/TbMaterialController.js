const { TbMaterial } = require('../models');
const { Op } = require('sequelize');
const apiErrors = require('../utils/apiErrors');

const TbMaterialController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbMaterial
   * @access  Public
   */
  async getAll(req, res, next) {
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
      return next(error);
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbMaterial/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await TbMaterial.findByPk(id);

      if (!data) {
        return next(apiErrors.notFound('TbMaterial'));
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbMaterial
   * @access  Public
   */
  async create(req, res, next) {
    try {
      const data = await TbMaterial.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'TbMaterial creado exitosamente'
      });
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const mensajes =
          error.errors?.map(err => err.message).join('. ') || error.message;
        return next(apiErrors.badRequest(mensajes));
      }

      return next(error);
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbMaterial/:id
   * @access  Public
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;

      const [affectedRows] = await TbMaterial.update(req.body, {
        where: { id }
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound('TbMaterial'));
      }

      const updatedData = await TbMaterial.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: 'TbMaterial actualizado exitosamente'
      });
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const mensajes =
          error.errors?.map(err => err.message).join('. ') || error.message;
        return next(apiErrors.badRequest(mensajes));
      }

      return next(error);
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbMaterial/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await TbMaterial.destroy({
        where: { id }
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound('TbMaterial'));
      }

      res.json({
        success: true,
        message: 'TbMaterial eliminado exitosamente'
      });
    } catch (error) {
      return next(error);
    }
  }
};

module.exports = TbMaterialController;
