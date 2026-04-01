const { Clasifpizarra } = require("../models");
const { Op } = require("sequelize");
const apiErrors = require("../utils/apiErrors");
const {
  createClasifpizarraSchema,
  updateClasifpizarraSchema,
  listClasifpizarraSchema,
} = require("../validations/clasifpizarra.schemas");
const validate = require("../middleware/validate");

const ClasifpizarraController = {
  /**
   * @desc    Obtener todos los registros (CON validación Zod en query)
   * @route   GET /api/tbClasifpizarra
   * @access  Public
   */
  getAll: [
    validate(listClasifpizarraSchema, "query"),
    async (req, res, next) => {
      try {
        const { page, limit, sortBy, sortOrder, search } = req.query;

        const offset = (page - 1) * limit;

        // Construir where clause para búsqueda
        const whereClause = {};
        if (search) {
          whereClause[Op.or] = [
            // Buscar en el campo clasificacion
            { clasificacion: { [Op.iLike]: `%${search}%` } },
          ].filter(Boolean);
        }

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

        const data = await Clasifpizarra.findAndCountAll({
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
   * @route   GET /api/tbClasifpizarra/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Clasifpizarra.findByPk(id);

      if (!data) {
        return next(apiErrors.notFound("Clasifpizarra"));
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
   * @route   POST /api/tbClasifpizarra
   * @access  Public
   */
  create: [
    validate(createClasifpizarraSchema, "body"),
    async (req, res, next) => {
      try {
        const data = await Clasifpizarra.create(req.body);

        res.status(201).json({
          success: true,
          data,
          message: "Clasifpizarra creado exitosamente",
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
   * @route   PUT /api/tbClasifpizarra/:id
   * @access  Public
   */
  update: [
    validate(updateClasifpizarraSchema, "body"),
    async (req, res, next) => {
      try {
        const { id } = req.params;

        const [affectedRows] = await Clasifpizarra.update(req.body, {
          where: { id_clasifpizarra: id },
        });

        if (affectedRows === 0) {
          return next(apiErrors.notFound("Clasifpizarra"));
        }

        const updatedData = await Clasifpizarra.findByPk(id);

        res.json({
          success: true,
          data: updatedData,
          message: "Clasifpizarra actualizado exitosamente",
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
   * @route   DELETE /api/tbClasifpizarra/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Clasifpizarra.destroy({
        where: { id_clasifpizarra: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Clasifpizarra"));
      }

      res.json({
        success: true,
        message: "Clasifpizarra eliminado exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = ClasifpizarraController;
