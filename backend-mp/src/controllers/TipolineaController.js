const { Tipolinea } = require("../models");
const { Op } = require("sequelize");
const apiErrors = require("../utils/apiErrors");
const { parseListParams } = require("../utils/parseListParams");
const {
  createTipolineaSchema,
  updateTipolineaSchema,
  listTipolineaSchema,
} = require("../validations/tipolinea.schemas");
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

const TipolineaController = {
  /**
   * @desc    Obtener todos los registros (CON validación Zod en query)
   * @route   GET /api/mp/tipolinea
   * @access  Public
   */
  getAll: [
    validate(listTipolineaSchema, "query"),
    async (req, res, next) => {
      try {
        const { page, limit, offset, sortBy, sortOrder, search } = parseListParams(req.query, {
          allowedSortFields: ["tipo", "createdAt", "updatedAt"],
          defaultSort: "tipo",
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
          whereClause[Op.or] = [{ tipo: { [Op.iLike]: `%${search}%` } }];
        }

        const data = await Tipolinea.findAndCountAll({
          where: whereClause,
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [[sortBy, sortOrder]],
          distinct: true,
        });

        const rowsNormalizados = data.rows.map((row) => {
          const plainRow = row.toJSON();
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
        console.error("❌ Error en getAll Tipolinea:", error);
        return next(error);
      }
    },
  ],

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/mp/tipolinea/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Tipolinea.findByPk(id);

      if (!data) {
        return next(apiErrors.notFound("Tipolinea"));
      }

      // Normalizar timestamps
      const dataNormalizada = normalizeTimestamps(data.toJSON());

      res.json({
        success: true,
        data: dataNormalizada,
      });
    } catch (error) {
      console.error("❌ Error en getById Tipolinea:", error);
      return next(error);
    }
  },

  /**
   * @desc    Crear nuevo registro (CON validación Zod en body)
   * @route   POST /api/mp/tipolinea
   * @access  Public
   */
  create: [
    validate(createTipolineaSchema, "body"),
    async (req, res, next) => {
      try {
        // Filtrar campos de timestamps
        const { createdAt, updatedAt, ...cleanData } = req.body;

        const data = await Tipolinea.create(cleanData);

        // Normalizar respuesta
        const dataNormalizada = normalizeTimestamps(data.toJSON());

        res.status(201).json({
          success: true,
          data: dataNormalizada,
          message: "Tipo de línea creado exitosamente",
        });
      } catch (error) {
        console.error("❌ Error creando Tipolinea:", error);
        if (error.name === "SequelizeValidationError") {
          const mensajes = error.errors?.map((err) => err.message).join(". ") || error.message;
          return next(apiErrors.badRequest(mensajes));
        }
        if (error.name === "SequelizeUniqueConstraintError") {
          return next(apiErrors.conflict("El tipo de línea ya existe"));
        }
        return next(error);
      }
    },
  ],

  /**
   * @desc    Actualizar registro (CON validación Zod parcial)
   * @route   PUT /api/mp/tipolinea/:id
   * @access  Public
   */
  update: [
    validate(updateTipolineaSchema, "body"),
    async (req, res, next) => {
      try {
        const { id } = req.params;

        // Filtrar campos de timestamps
        const { createdAt, updatedAt, ...cleanData } = req.body;

        const [affectedRows] = await Tipolinea.update(cleanData, {
          where: { id_tipolinea: id },
        });

        if (affectedRows === 0) {
          return next(apiErrors.notFound("Tipolinea"));
        }

        const updatedData = await Tipolinea.findByPk(id);

        // Normalizar respuesta
        const dataNormalizada = normalizeTimestamps(updatedData.toJSON());

        res.json({
          success: true,
          data: dataNormalizada,
          message: "Tipo de línea actualizado exitosamente",
        });
      } catch (error) {
        console.error("❌ Error actualizando Tipolinea:", error);
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
   * @route   DELETE /api/mp/tipolinea/:id
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
        message: "Tipo de línea eliminado exitosamente",
      });
    } catch (error) {
      console.error("❌ Error eliminando Tipolinea:", error);
      return next(error);
    }
  },
};

module.exports = TipolineaController;
