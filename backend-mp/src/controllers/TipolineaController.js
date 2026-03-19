const { Tipolinea } = require('../models');
const { Op } = require('sequelize');
const apiErrors = require('../utils/apiErrors');

const TipolineaController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbTipolinea
   * @access  Public
   */
  async getAll(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'tipo',
        sortOrder = 'ASC',
        search = '',
        ...filters
      } = req.query;

      const offset = (page - 1) * limit;

      // Construir where clause para búsqueda
      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          // Buscar en el campo tipo
          { tipo: { [Op.iLike]: `%${search}%` } }
        ].filter(Boolean);
      }

      // Agregar otros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Tipolinea.findAndCountAll({
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
   * @route   GET /api/tbTipolinea/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Tipolinea.findByPk(id);

      if (!data) {
        return next(apiErrors.notFound('Tipolinea'));
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
   * @route   POST /api/tbTipolinea
   * @access  Public
   */
  async create(req, res, next) {
    try {
      const data = await Tipolinea.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'Tipolinea creado exitosamente'
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
   * @route   PUT /api/tbTipolinea/:id
   * @access  Public
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Tipolinea.update(req.body, {
        where: { id_tipolinea: id }
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound('Tipolinea'));
      }

      const updatedData = await Tipolinea.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: 'Tipolinea actualizado exitosamente'
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
   * @route   DELETE /api/tbTipolinea/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Tipolinea.destroy({
        where: { id_tipolinea: id }
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound('Tipolinea'));
      }

      res.json({
        success: true,
        message: 'Tipolinea eliminado exitosamente'
      });
    } catch (error) {
      return next(error);
    }
  }
};

module.exports = TipolineaController;
