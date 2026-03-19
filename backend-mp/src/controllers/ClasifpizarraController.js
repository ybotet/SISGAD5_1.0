const { Clasifpizarra } = require('../models');
const { Op } = require('sequelize');
const apiErrors = require('../utils/apiErrors');

const ClasifpizarraController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbClasifpizarra
   * @access  Public
   */
  async getAll(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'clasificacion',
        sortOrder = 'ASC',
        search = '',
        ...filters
      } = req.query;

      const offset = (page - 1) * limit;

      // Construir where clause para búsqueda
      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          // Buscar en el campo clasificacion
          { clasificacion: { [Op.iLike]: `%${search}%` } }
        ].filter(Boolean);
      }

      // Agregar otros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Clasifpizarra.findAndCountAll({
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
   * @route   GET /api/tbClasifpizarra/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Clasifpizarra.findByPk(id);

      if (!data) {
        return next(apiErrors.notFound('Clasifpizarra'));
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
   * @route   POST /api/tbClasifpizarra
   * @access  Public
   */
  async create(req, res, next) {
    try {
      const data = await Clasifpizarra.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'Clasifpizarra creado exitosamente'
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
   * @route   PUT /api/tbClasifpizarra/:id
   * @access  Public
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Clasifpizarra.update(req.body, {
        where: { id_clasifpizarra: id }
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound('Clasifpizarra'));
      }

      const updatedData = await Clasifpizarra.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: 'Clasifpizarra actualizado exitosamente'
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
   * @route   DELETE /api/tbClasifpizarra/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Clasifpizarra.destroy({
        where: { id_clasifpizarra: id }
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound('Clasifpizarra'));
      }

      res.json({
        success: true,
        message: 'Clasifpizarra eliminado exitosamente'
      });
    } catch (error) {
      return next(error);
    }
  }
};

module.exports = ClasifpizarraController;
