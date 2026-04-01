const { Senalizacion } = require("../models");
const { Op } = require("sequelize");
const apiErrors = require("../utils/apiErrors");
const {
  createSenalizacionSchema,
  updateSenalizacionSchema,
  listSenalizacionSchema,
} = require("../validations/senalizacion.schemas");
const validate = require("../middleware/validate");

const SenalizacionController = {
  /**
   * @desc    Obtener todos los registros (CON validación Zod en query)
   * @route   GET /api/tbSenalizacion
   * @access  Public
   */
  getAll: [
    validate(listSenalizacionSchema, "query"),
    async (req, res, next) => {
      try {
        const { page, limit, sortBy, sortOrder, search } = req.query;

        const offset = (page - 1) * limit;

        // Construir where clause para búsqueda
        const whereClause = {};
        if (search) {
          whereClause[Op.or] = [
            // Buscar en campos de texto (ajusta según tus campos)
            { senalizacion: { [Op.iLike]: `%${search}%` } },
          ].filter(Boolean);
        }

        // Validación defensiva para orden
        const ALLOWED_SORT = ["senalizacion", "createdAt", "updatedAt"];

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

        const data = await Senalizacion.findAndCountAll({
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
   * @route   GET /api/tbSenalizacion/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Senalizacion.findByPk(id);

      if (!data) {
        return next(apiErrors.notFound("Senalizacion"));
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
   * @route   POST /api/tbSenalizacion
   * @access  Public
   */
  create: [
    validate(createSenalizacionSchema, "body"),
    async (req, res, next) => {
      try {
        const data = await Senalizacion.create(req.body);

        res.status(201).json({
          success: true,
          data,
          message: "Senalizacion creado exitosamente",
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
   * @route   PUT /api/tbSenalizacion/:id
   * @access  Public
   */
  update: [
    validate(updateSenalizacionSchema, "body"),
    async (req, res, next) => {
      try {
        const { id } = req.params;

        const [affectedRows] = await Senalizacion.update(req.body, {
          where: { id_senalizacion: id },
        });

        if (affectedRows === 0) {
          return next(apiErrors.notFound("Senalizacion"));
        }

        const updatedData = await Senalizacion.findByPk(id);

        res.json({
          success: true,
          data: updatedData,
          message: "Senalizacion actualizado exitosamente",
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
   * @route   DELETE /api/tbSenalizacion/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Senalizacion.destroy({
        where: { id_senalizacion: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Senalizacion"));
      }

      res.json({
        success: true,
        message: "Senalizacion eliminado exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = SenalizacionController;
