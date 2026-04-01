const { Tipolinea } = require("../models");
const { Op } = require("sequelize");
const apiErrors = require("../utils/apiErrors");
const {
  createTipolineaSchema,
  updateTipolineaSchema,
  listTipolineaSchema,
} = require("../validations/tipolinea.schemas");
const validate = require("../middleware/validate");

const TipolineaController = {
  /**
   * @desc    Obtener todos los registros (CON validación Zod en query)
   * @route   GET /api/tbTipolinea
   * @access  Public
   */
  getAll: [
    validate(listTipolineaSchema, "query"),
    async (req, res, next) => {
      try {
        const { page, limit, sortBy, sortOrder, search } = req.query;

        const offset = (page - 1) * limit;

        // Construir where clause para búsqueda
        const whereClause = {};
        if (search) {
          whereClause[Op.or] = [{ tipo: { [Op.iLike]: `%${search}%` } }];
        }

        // Validación defensiva para orden
        const ALLOWED_SORT = ["tipo", "id_tipolinea", "createdAt", "updatedAt"];

        // Forzar valores seguros (nunca undefined/NaN)
        const sortByRaw = req.query.sortBy;
        const sortByValue =
          typeof sortByRaw === "string" && ALLOWED_SORT.includes(sortByRaw)
            ? sortByRaw
            : "createdAt";

        const sortOrderRaw = req.query.sortOrder;
        const sortOrderValue =
          typeof sortOrderRaw === "string" &&
          ["ASC", "DESC"].includes(sortOrderRaw.toUpperCase())
            ? sortOrderRaw.toUpperCase()
            : "DESC";

        const data = await Tipolinea.findAndCountAll({
          where: whereClause,
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [[sortByValue, sortOrderValue]],
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
  ],

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
        return next(apiErrors.notFound("Tipolinea"));
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
   * @desc    Crear nuevo registro (CON validación Zod en body)
   * @route   POST /api/tbTipolinea
   * @access  Public
   */
  create: [
    validate(createTipolineaSchema, "body"),
    async (req, res, next) => {
      try {
        const data = await Tipolinea.create(req.body);

        res.status(201).json({
          success: true,
          data,
          message: "Tipolinea creado exitosamente",
        });
      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          const mensajes =
            error.errors?.map((err) => err.message).join(". ") || error.message;
          return next(apiErrors.badRequest(mensajes));
        }

        return next(error);
      }
    },
  ],

  /**
   * @desc    Actualizar registro (CON validación Zod parcial)
   * @route   PUT /api/tbTipolinea/:id
   * @access  Public
   */
  update: [
    validate(updateTipolineaSchema, "body"),
    async (req, res, next) => {
      try {
        const { id } = req.params;

        const [affectedRows] = await Tipolinea.update(req.body, {
          where: { id_tipolinea: id },
        });

        if (affectedRows === 0) {
          return next(apiErrors.notFound("Tipolinea"));
        }

        const updatedData = await Tipolinea.findByPk(id);

        res.json({
          success: true,
          data: updatedData,
          message: "Tipolinea actualizado exitosamente",
        });
      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          const mensajes =
            error.errors?.map((err) => err.message).join(". ") || error.message;
          return next(apiErrors.badRequest(mensajes));
        }

        return next(error);
      }
    },
  ],

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbTipolinea/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Tipolinea.destroy({
        where: { id_tipolinea: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Tipolinea"));
      }

      res.json({
        success: true,
        message: "Tipolinea eliminado exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = TipolineaController;
