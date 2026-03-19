const { Clave } = require('../models');
const { Op } = require('sequelize');
const apiErrors = require('../utils/apiErrors');

const ClaveController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbClave
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
          { clave: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Agregar otros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Clave.findAndCountAll({
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
   * @route   GET /api/tbClave/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Clave.findByPk(id);

      if (!data) {
        return next(apiErrors.notFound('Clave'));
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
   * @route   POST /api/tbClave
   * @access  Public
   */
  async create(req, res, next) {
    try {
      const data = await Clave.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'Clave creado exitosamente'
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
   * @route   PUT /api/tbClave/:id
   * @access  Public
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Clave.update(req.body, {
        where: { id_clave: id }
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound('Clave'));
      }

      const updatedData = await Clave.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: 'Clave actualizado exitosamente'
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
   * @route   DELETE /api/tbClave/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Clave.destroy({
        where: { id_clave: id }
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound('Clave'));
      }

      res.json({
        success: true,
        message: 'Clave eliminado exitosamente'
      });
    } catch (error) {
      return next(error);
    }
  }
};

module.exports = ClaveController;
