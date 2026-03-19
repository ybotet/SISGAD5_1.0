const { TrabajoTrabajadores } = require('../models');
const { Op } = require('sequelize');
const apiErrors = require('../utils/apiErrors');

const TrabajoTrabajadoresController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbTrabajoTrabajadores
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
        // Solo tiene IDs
        if (!isNaN(search)) {
          const searchNum = parseInt(search);
          whereClause[Op.or] = [
            { id_trabajo: searchNum },
            { id_trabajador: searchNum }
          ];
        }
      }

      // Agregar otros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await TrabajoTrabajadores.findAndCountAll({
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
   * @route   GET /api/tbTrabajoTrabajadores/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await TrabajoTrabajadores.findByPk(id);

      if (!data) {
        return next(apiErrors.notFound('TrabajoTrabajadores'));
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
   * @route   POST /api/tbTrabajoTrabajadores
   * @access  Public
   */
  async create(req, res, next) {
    try {
      const data = await TrabajoTrabajadores.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'TrabajoTrabajadores creado exitosamente'
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
   * @route   PUT /api/tbTrabajoTrabajadores/:id
   * @access  Public
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;

      const [affectedRows] = await TrabajoTrabajadores.update(req.body, {
        where: { id_trabajo_trabajadores: id }
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound('TrabajoTrabajadores'));
      }

      const updatedData = await TrabajoTrabajadores.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: 'TrabajoTrabajadores actualizado exitosamente'
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
   * @route   DELETE /api/tbTrabajoTrabajadores/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await TrabajoTrabajadores.destroy({
        where: { id_trabajo_trabajadores: id }
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound('TrabajoTrabajadores'));
      }

      res.json({
        success: true,
        message: 'TrabajoTrabajadores eliminado exitosamente'
      });
    } catch (error) {
      return next(error);
    }
  }
};

module.exports = TrabajoTrabajadoresController;
