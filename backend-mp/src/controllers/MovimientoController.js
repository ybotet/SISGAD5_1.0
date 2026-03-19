const { Movimiento } = require("../models");
const { Op } = require("sequelize");
const apiErrors = require("../utils/apiErrors");

const MovimientoController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbMovimiento
   * @access  Public
   */
  async getAll(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "DESC",
        search = "",
        ...filters
      } = req.query;

      const offset = (page - 1) * limit;

      // Construir where clause para búsqueda
      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [{ movimiento: { [Op.iLike]: `%${search}%` } }];
      }

      // Agregar otros filtros
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Movimiento.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: offset,
        order: [[sortBy, sortOrder.toUpperCase()]],
        include: [
          {
            association: "tb_tipomovimiento",
            attributes: ["id_tipomovimiento", "movimiento"],
          },
          {
            association: "tb_telefono",
            attributes: ["id_telefono", "telefono"],
          },
          {
            association: "tb_linea",
            attributes: ["id_linea", "clavelinea"],
          },
        ],
      });

      res.json({
        success: true,
        data: data.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: data.count,
          pages: Math.ceil(data.count / limit),
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbMovimiento/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Movimiento.findByPk(id);

      if (!data) {
        return next(apiErrors.notFound("Movimiento"));
      }

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbMovimiento
   * @access  Public
   */
  async create(req, res, next) {
    try {
      const data = await Movimiento.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: "Movimiento creado exitosamente",
      });
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        const mensaje =
          error.errors?.map((err) => err.message).join(". ") || error.message;
        return next(apiErrors.badRequest(mensaje));
      }

      return next(error);
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbMovimiento/:id
   * @access  Public
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Movimiento.update(req.body, {
        where: { id_movimiento: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Movimiento"));
      }

      const updatedData = await Movimiento.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: "Movimiento actualizado exitosamente",
      });
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        const mensaje =
          error.errors?.map((err) => err.message).join(". ") || error.message;
        return next(apiErrors.badRequest(mensaje));
      }

      return next(error);
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbMovimiento/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Movimiento.destroy({
        where: { id_movimiento: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Movimiento"));
      }

      res.json({
        success: true,
        message: "Movimiento eliminado exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  },

  async getMovimientoByTelefono(req, res, next) {
    try {
      const { telefono } = req.params;
      const data = await Movimiento.findAll({
        where: { id_telefono: telefono },
        include: [
          {
            association: "tb_tipomovimiento",
            attributes: ["id_tipomovimiento", "movimiento"],
          },
        ],
      });

      if (!data) return next(apiErrors.notFound("Teléfono"));
      if (!data.length) return next(apiErrors.notFound("Movimientos de Teléfono"));

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  async getMovimientoByLinea(req, res, next) {
    try {
      const { linea } = req.params;
      const data = await Movimiento.findAll({
        where: { id_linea: linea },
        include: [
          {
            association: "tb_tipomovimiento",
            attributes: ["id_tipomovimiento", "movimiento"],
          },
        ],
      });

      if (!data) return next(apiErrors.notFound("Línea"));
      if (!data.length) return next(apiErrors.notFound("Movimientos de Línea"));

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      return next(error);
    }
  },
};
module.exports = MovimientoController;
