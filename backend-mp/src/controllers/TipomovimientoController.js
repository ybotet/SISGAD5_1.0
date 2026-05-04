const { Tipomovimiento } = require("../models");
const { Op } = require("sequelize");
const apiErrors = require("../utils/apiErrors");
const { parseListParams } = require("../utils/parseListParams");
const {
  createTipomovimientoSchema,
  updateTipomovimientoSchema,
  listTipomovimientoSchema,
} = require("../validations/tipomovimiento.schemas");
const validate = require("../middleware/validate");

// Helper para normalizar timestamps
const normalizeTimestamps = (data) => {
  if (!data) return data;
  if (Array.isArray(data)) {
    return data.map((item) => normalizeTimestamps(item));
  }
  if (typeof data === "object" && data !== null) {
    const result = { ...data };
    if (result.created_at !== undefined) {
      result.createdAt = result.created_at;
      delete result.created_at;
    }
    if (result.updated_at !== undefined) {
      result.updatedAt = result.updated_at;
      delete result.updated_at;
    }
    return result;
  }
  return data;
};

const TipomovimientoController = {
  /**
   * @desc    Obtener todos los registros (CON validación Zod en query)
   * @route   GET /api/mp/tipomovimiento
   * @access  Public
   */
  getAll: [
    validate(listTipomovimientoSchema, "query"),
    async (req, res, next) => {
      try {
        const { page, limit, offset, sortBy, sortOrder, search } = parseListParams(req.query, {
          allowedSortFields: ["movimiento", "estadobaja", "createdAt", "updatedAt"],
          defaultSort: "movimiento",
          defaultOrder: "ASC",
          maxLimit: 100,
          columnMapping: {
            createdAt: "created_at",
            updatedAt: "updated_at",
          },
        });

        // Construir where clause para búsqueda
        const whereClause = {};
        if (search) {
          whereClause[Op.or] = [{ movimiento: { [Op.iLike]: `%${search}%` } }];
        }

        const data = await Tipomovimiento.findAndCountAll({
          where: whereClause,
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [[sortBy, sortOrder]],
          distinct: true,
        });

        const rowsNormalizados = data.rows.map((row) => {
          const plainRow = row.toJSON(); // 🔑 CLAVE: convertir a objeto plano
          return normalizeTimestamps(plainRow);
        });

        res.json({
          success: true,
          data: rowsNormalizados,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: data.count,
            pages: Math.ceil(data.count / limit),
          },
        });
      } catch (error) {
        console.error("❌ Error en getAll Tipomovimiento:", error);
        return next(error);
      }
    },
  ],

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/mp/tipomovimiento/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Tipomovimiento.findByPk(id);

      if (!data) {
        return next(apiErrors.notFound("Tipomovimiento"));
      }

      // Normalizar timestamps
      const dataNormalizada = normalizeTimestamps(data.toJSON());

      res.json({
        success: true,
        data: dataNormalizada,
      });
    } catch (error) {
      console.error("❌ Error en getById Tipomovimiento:", error);
      return next(error);
    }
  },

  /**
   * @desc    Crear nuevo registro (CON validación Zod en body)
   * @route   POST /api/mp/tipomovimiento
   * @access  Public
   */
  create: [
    validate(createTipomovimientoSchema, "body"),
    async (req, res, next) => {
      try {
        // Filtrar campos de timestamps
        const { createdAt, updatedAt, ...cleanData } = req.body;

        const data = await Tipomovimiento.create(cleanData);

        // Normalizar respuesta
        const dataNormalizada = normalizeTimestamps(data.toJSON());

        res.status(201).json({
          success: true,
          data: dataNormalizada,
          message: "Tipo de movimiento creado exitosamente",
        });
      } catch (error) {
        console.error("❌ Error creando Tipomovimiento:", error);
        if (error.name === "SequelizeValidationError") {
          const mensajes = error.errors?.map((err) => err.message).join(". ") || error.message;
          return next(apiErrors.badRequest(mensajes));
        }
        if (error.name === "SequelizeUniqueConstraintError") {
          return next(apiErrors.conflict("El tipo de movimiento ya existe"));
        }
        return next(error);
      }
    },
  ],

  /**
   * @desc    Actualizar registro (CON validación Zod parcial)
   * @route   PUT /api/mp/tipomovimiento/:id
   * @access  Public
   */
  update: [
    validate(updateTipomovimientoSchema, "body"),
    async (req, res, next) => {
      try {
        const { id } = req.params;

        // Filtrar campos de timestamps
        const { createdAt, updatedAt, ...cleanData } = req.body;

        const [affectedRows] = await Tipomovimiento.update(cleanData, {
          where: { id_tipomovimiento: id },
        });

        if (affectedRows === 0) {
          return next(apiErrors.notFound("Tipomovimiento"));
        }

        const updatedData = await Tipomovimiento.findByPk(id);

        // Normalizar respuesta
        const dataNormalizada = normalizeTimestamps(updatedData.toJSON());

        res.json({
          success: true,
          data: dataNormalizada,
          message: "Tipo de movimiento actualizado exitosamente",
        });
      } catch (error) {
        console.error("❌ Error actualizando Tipomovimiento:", error);
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
   * @route   DELETE /api/mp/tipomovimiento/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Tipomovimiento.destroy({
        where: { id_tipomovimiento: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Tipomovimiento"));
      }

      res.json({
        success: true,
        message: "Tipo de movimiento eliminado exitosamente",
      });
    } catch (error) {
      console.error("❌ Error eliminando Tipomovimiento:", error);
      return next(error);
    }
  },
};

module.exports = TipomovimientoController;
