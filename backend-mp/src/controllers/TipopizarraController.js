const { Tipopizarra } = require('../models');
const { Op } = require('sequelize');
const apiErrors = require('../utils/apiErrors');

const TipopizarraController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbTipopizarra
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
      return next(error);
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbTipopizarra/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Tipopizarra.findByPk(id, {
        include: [{
          association: 'tb_clasifpizarra',
          attributes: ['id_clasifpizarra', 'clasificacion']
        }]
      });

      if (!data) {
        return next(apiErrors.notFound('Tipopizarra'));
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
   * @route   POST /api/tbTipopizarra
   * @access  Public
   */
  async create(req, res, next) {
    try {
      const data = await Tipopizarra.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'Tipopizarra creado exitosamente'
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
   * @route   PUT /api/tbTipopizarra/:id
   * @access  Public
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Tipopizarra.update(req.body, {
        where: { id_tipopizarra: id }
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound('Tipopizarra'));
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
   * @route   DELETE /api/tbTipopizarra/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Tipopizarra.destroy({
        where: { id_tipopizarra: id }
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound('Tipopizarra'));
      }

      res.json({
        success: true,
        message: 'Tipopizarra eliminado exitosamente'
      });
    } catch (error) {
      return next(error);
    }
  }
};

module.exports = TipopizarraController;
