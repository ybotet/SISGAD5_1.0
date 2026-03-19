const { Clasificadorclave } = require('../models');
const { Op } = require('sequelize');
const apiErrors = require('../utils/apiErrors');

const ClasificadorclaveController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbClasificadorclave
   * @access  Public
   */
  async getAll(req, res, next) {
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
      return next(error);
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbClasificadorclave/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Clasificadorclave.findByPk(id);

      if (!data) {
        return next(apiErrors.notFound('Clasificadorclave'));
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
   * @route   POST /api/tbClasificadorclave
   * @access  Public
   */
  async create(req, res, next) {
    try {
      const data = await Clasificadorclave.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'Clasificadorclave creado exitosamente'
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
   * @route   PUT /api/tbClasificadorclave/:id
   * @access  Public
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Clasificadorclave.update(req.body, {
        where: { id_clasificadorclave: id }
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound('Clasificadorclave'));
      }

      const updatedData = await Clasificadorclave.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: 'Clasificadorclave actualizado exitosamente'
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
   * @route   DELETE /api/tbClasificadorclave/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Clasificadorclave.destroy({
        where: { id_clasificadorclave: id }
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound('Clasificadorclave'));
      }

      res.json({
        success: true,
        message: 'Clasificadorclave eliminado exitosamente'
      });
    } catch (error) {
      return next(error);
    }
  }
};

module.exports = ClasificadorclaveController;
