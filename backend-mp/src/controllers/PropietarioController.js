const { Propietario } = require("../models");
const { Op } = require("sequelize");
const apiErrors = require("../utils/apiErrors");
const {
  createPropietarioSchema,
  updatePropietarioSchema,
  listPropietarioSchema,
} = require("../validations/propietario.schemas");
const validate = require("../middleware/validate");

const PropietarioController = {
  /**
   * @desc    Obtener todos los registros (CON validación Zod en query)
   * @route   GET /api/tbPropietario
   * @access  Public
   */
  getAll: [
    validate(listPropietarioSchema, "query"),
    async (req, res, next) => {
      try {
        // 🔹 1. Extraer valores con fallback explícito (NUNCA confiar en req.query directo)
        const page = typeof req.query.page === "number" ? req.query.page : 1;
        const limit = typeof req.query.limit === "number" ? req.query.limit : 10;
        const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : "createdAt";
        const sortOrder = typeof req.query.sortOrder === "string" ? req.query.sortOrder : "DESC";
        const search = typeof req.query.search === "string" ? req.query.search : "";

        // 🔹 2. Calcular offset de forma segura
        const safePage = Math.max(1, parseInt(page) || 1);
        const safeLimit = Math.min(500, Math.max(1, parseInt(limit) || 10));
        const offset = (safePage - 1) * safeLimit;

        // 🔹 3. Whitelist de ordenamiento + fallback
        const ALLOWED_SORT = ["nombre", "createdAt", "updatedAt"];
        const sortByValue = ALLOWED_SORT.includes(sortBy) ? sortBy : "createdAt";
        const sortOrderRaw = typeof sortOrder === "string" ? sortOrder.toUpperCase() : "DESC";
        const sortOrderValue = ["ASC", "DESC"].includes(sortOrderRaw) ? sortOrderRaw : "DESC";

        // 🔹 4. Debug crítico (puedes quitarlo después)
        console.log("🔍 PROP ORDER DEBUG:", {
          sortByValue,
          sortOrderValue,
          offset,
          safeLimit,
          raw_query: req.query,
        });

        // 🔹 5. Where clause
        const whereClause = {};
        if (search) {
          whereClause[Op.or] = [{ nombre: { [Op.iLike]: `%${search}%` } }];
        }

        // 🔹 6. Consulta con valores 100% seguros
        const data = await Propietario.findAndCountAll({
          where: whereClause,
          limit: safeLimit, // ← Número válido
          offset: offset, // ← Número válido (no NaN)
          order: [[sortByValue, sortOrderValue]], // ← Strings válidos
          distinct: true,
        });

        res.json({
          success: true,
          data: data.rows,
          pagination: {
            page: safePage,
            limit: safeLimit,
            total: data.count,
            pages: Math.ceil(data.count / safeLimit),
          },
        });
      } catch (error) {
        return next(error);
      }
    },
  ],

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbPropietario/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Propietario.findByPk(id);

      if (!data) {
        return next(apiErrors.notFound("Propietario"));
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
   * @route   POST /api/tbPropietario
   * @access  Public
   */
  create: [
    validate(createPropietarioSchema, "body"),
    async (req, res, next) => {
      try {
        const data = await Propietario.create(req.body);

        res.status(201).json({
          success: true,
          data,
          message: "Propietario creado exitosamente",
        });
      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          const mensaje =
            error.errors?.map((err) => err.message).join(". ") || "Error de validación";
          return next(apiErrors.badRequest(mensaje));
        }

        if (error.name === "SequelizeUniqueConstraintError") {
          return next(apiErrors.conflict("El propietario ya existe"));
        }

        return next(error);
      }
    },
  ],

  /**
   * @desc    Actualizar registro (CON validación Zod parcial)
   * @route   PUT /api/tbPropietario/:id
   * @access  Public
   */
  update: [
    validate(updatePropietarioSchema, "body"),
    async (req, res, next) => {
      try {
        const { id } = req.params;

        const [affectedRows] = await Propietario.update(req.body, {
          where: { id_propietario: id },
        });

        if (affectedRows === 0) {
          return next(apiErrors.notFound("Propietario"));
        }

        const updatedData = await Propietario.findByPk(id);

        res.json({
          success: true,
          data: updatedData,
          message: "Propietario actualizado exitosamente",
        });
      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          const mensaje =
            error.errors?.map((err) => err.message).join(". ") || "Error de validación";
          return next(apiErrors.badRequest(mensaje));
        }

        if (error.name === "SequelizeUniqueConstraintError") {
          return next(apiErrors.conflict("El propietario ya existe"));
        }

        return next(error);
      }
    },
  ],

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbPropietario/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Propietario.destroy({
        where: { id_propietario: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Propietario"));
      }

      res.json({
        success: true,
        message: "Propietario eliminado exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = PropietarioController;
