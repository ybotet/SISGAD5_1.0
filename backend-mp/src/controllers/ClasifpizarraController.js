// ClasifpizarraController.js
const { Clasifpizarra } = require("../models");
const { Op } = require("sequelize");
const apiErrors = require("../utils/apiErrors");
const {
  createClasifpizarraSchema,
  updateClasifpizarraSchema,
  listClasifpizarraSchema,
} = require("../validations/clasifpizarra.schemas");
const validate = require("../middleware/validate");

// ✅ Debug: Verificar que el modelo existe
console.log("🔍 Modelo Clasifpizarra cargado:", !!Clasifpizarra);

const ClasifpizarraController = {
  /**
   * @desc    Obtener todos los registros (CON validación Zod en query)
   * @route   GET /api/mp/clasifpizarra
   * @access  Public
   */
  getAll: [
    validate(listClasifpizarraSchema, "query"),
    async (req, res, next) => {
      try {
        // ✅ Verificar modelo antes de usar
        if (!Clasifpizarra) {
          console.error("❌ Modelo Clasifpizarra no está disponible");
          return next(apiErrors.internal("Error interno: modelo no disponible"));
        }

        const {
          page = 1,
          limit = 10,
          sortBy = "clasificacion",
          sortOrder = "ASC",
          search,
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Construir where clause para búsqueda
        const whereClause = {};
        if (search && search.trim()) {
          whereClause.clasificacion = { [Op.iLike]: `%${search}%` };
        }

        // ✅ Validar sortBy y sortOrder
        const ALLOWED_SORT = ["clasificacion", "created_at", "updated_at"];
        const sortBySafe = ALLOWED_SORT.includes(sortBy) ? sortBy : "clasificacion";
        const sortOrderSafe = sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC";

        console.log("📝 Query params:", { page, limit, sortBySafe, sortOrderSafe, search });

        const data = await Clasifpizarra.findAndCountAll({
          where: whereClause,
          limit: parseInt(limit),
          offset: offset,
          order: [[sortBySafe, sortOrderSafe]],
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
        console.error("❌ Error en getAll Clasifpizarra:", error);
        return next(error);
      }
    },
  ],

  /**
   * @desc    Obtener todos (sin paginación) para selects
   * @route   GET /api/mp/clasifpizarra/all
   * @access  Public
   */
  async getAllSimple(req, res, next) {
    try {
      if (!Clasifpizarra) {
        console.error("❌ Modelo Clasifpizarra no está disponible");
        return next(apiErrors.internal("Error interno: modelo no disponible"));
      }

      const data = await Clasifpizarra.findAll({
        attributes: ["id_clasifpizarra", "clasificacion"],
        order: [["clasificacion", "ASC"]],
      });

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("❌ Error en getAllSimple Clasifpizarra:", error);
      return next(error);
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/mp/clasifpizarra/:id
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
   * @desc    Crear nuevo registro
   * @route   POST /api/mp/clasifpizarra
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
          const mensajes = error.errors?.map((err) => err.message).join(". ") || error.message;
          return next(apiErrors.badRequest(mensajes));
        }
        return next(error);
      }
    },
  ],

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/mp/clasifpizarra/:id
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
          const mensajes = error.errors?.map((err) => err.message).join(". ") || error.message;
          return next(apiErrors.badRequest(mensajes));
        }
        return next(error);
      }
    },
  ],

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/mp/clasifpizarra/:id
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
