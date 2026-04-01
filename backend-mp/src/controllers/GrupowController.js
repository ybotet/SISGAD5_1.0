const { Grupow } = require("../models");
const { Op } = require("sequelize");
const apiErrors = require("../utils/apiErrors");
const {
  createGrupowSchema,
  updateGrupowSchema,
  listGrupowSchema,
} = require("../validations/grupow.schemas");
const validate = require("../middleware/validate");

const GrupowController = {
  /**
   * @desc    Obtener todos los registros (CON validación Zod en query)
   * @route   GET /api/grupow
   * @access  Public
   */
  getAll: [
    validate(listGrupowSchema, "query"),
    async (req, res, next) => {
      try {
        const { page, limit, sortBy, sortOrder, search } = req.query;

        const offset = (page - 1) * limit;

        // Construir where clause para búsqueda
        const whereClause = {};
        if (search) {
          whereClause[Op.or] = [
            // Buscar en el campo grupo
            { grupo: { [Op.iLike]: `%${search}%` } },
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

        const data = await Grupow.findAndCountAll({
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
   * @route   GET /api/grupow/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Grupow.findByPk(id);

      if (!data) {
        return next(apiErrors.notFound("Grupo de trabajo"));
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
   * @route   POST /api/grupow
   * @access  Public
   */
  create: [
    validate(createGrupowSchema, "body"),
    async (req, res, next) => {
      try {
        const data = await Grupow.create(req.body);

        res.status(201).json({
          success: true,
          data,
          message: "Grupo de trabajo creado exitosamente",
        });
      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          const mensaje =
            error.errors?.map((err) => err.message).join(". ") ||
            "Error de validación";
          return next(apiErrors.badRequest(mensaje));
        }

        // Manejar error de unicidad (violación de constraint unique)
        if (error.name === "SequelizeUniqueConstraintError") {
          return next(apiErrors.conflict("El grupo ya existe"));
        }

        return next(error);
      }
    },
  ],

  /**
   * @desc    Actualizar registro (CON validación Zod parcial)
   * @route   PUT /api/grupow/:id
   * @access  Public
   */
  update: [
    validate(updateGrupowSchema, "body"),
    async (req, res, next) => {
      try {
        const { id } = req.params;

        const [affectedRows] = await Grupow.update(req.body, {
          where: { id_grupow: id },
        });

        if (affectedRows === 0) {
          return next(apiErrors.notFound("Grupo de trabajo"));
        }

        const updatedData = await Grupow.findByPk(id);

        res.json({
          success: true,
          data: updatedData,
          message: "Grupo de trabajo actualizado exitosamente",
        });
      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          const mensaje =
            error.errors?.map((err) => err.message).join(". ") ||
            "Error de validación";
          return next(apiErrors.badRequest(mensaje));
        }

        if (error.name === "SequelizeUniqueConstraintError") {
          return next(apiErrors.conflict("El grupo ya existe"));
        }

        return next(error);
      }
    },
  ],

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/grupow/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Grupow.destroy({
        where: { id_grupow: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Grupo de trabajo"));
      }

      res.json({
        success: true,
        message: "Grupo de trabajo eliminado exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = GrupowController;
