const { Recorrido } = require("../models");
const { Op } = require("sequelize");
const apiErrors = require("../utils/apiErrors");
const {
  createRecorridoSchema,
  updateRecorridoSchema,
  listRecorridoSchema,
} = require("../validations/recorrido.schemas");
const validate = require("../middleware/validate");

const RecorridoController = {
  /**
   * @desc    Obtener todos los registros (CON validación Zod en query)
   * @route   GET /api/tbRecorrido
   * @access  Public
   */
  getAll: [
    validate(listRecorridoSchema, "query"),
    async (req, res, next) => {
      try {
        const { page, limit, sortBy, sortOrder, search } = req.query;

        const offset = (page - 1) * limit;

        // Construir where clause para búsqueda
        const whereClause = {};
        if (search) {
          whereClause[Op.or] = [{ recorrido: { [Op.iLike]: `%${search}%` } }];
        }

        // Validación defensiva para orden
        const ALLOWED_SORT = [
          "numero",
          "par",
          "terminal",
          "de",
          "a",
          "dirter",
          "soporte",
          "canal",
          "createdAt",
          "updatedAt",
        ];
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

        const data = await Recorrido.findAndCountAll({
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
   * @route   GET /api/tbRecorrido/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Recorrido.findByPk(id);

      if (!data) {
        return next(apiErrors.notFound("Recorrido"));
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
   * @route   POST /api/tbRecorrido
   * @access  Public
   */
  create: [
    validate(createRecorridoSchema, "body"),
    async (req, res, next) => {
      try {
        const data = await Recorrido.create(req.body);

        res.status(201).json({
          success: true,
          data,
          message: "Recorrido creado exitosamente",
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
   * @route   PUT /api/tbRecorrido/:id
   * @access  Public
   */
  update: [
    validate(updateRecorridoSchema, "body"),
    async (req, res, next) => {
      try {
        const { id } = req.params;

        const [affectedRows] = await Recorrido.update(req.body, {
          where: { id_recorrido: id },
        });

        if (affectedRows === 0) {
          return next(apiErrors.notFound("Recorrido"));
        }

        const updatedData = await Recorrido.findByPk(id);

        res.json({
          success: true,
          data: updatedData,
          message: "Recorrido actualizado exitosamente",
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
   * @route   DELETE /api/tbRecorrido/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Recorrido.destroy({
        where: { id_recorrido: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Recorrido"));
      }

      res.json({
        success: true,
        message: "Recorrido eliminado exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = RecorridoController;
