const { Senalizacion } = require("../models");
const { Op } = require("sequelize");
const apiErrors = require("../utils/apiErrors");
const { parseListParams } = require("../utils/parseListParams");
const {
  createSenalizacionSchema,
  updateSenalizacionSchema,
  listSenalizacionSchema,
} = require("../validations/senalizacion.schemas");
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

const SenalizacionController = {
  /**
   * @desc    Obtener todos los registros (CON validación Zod en query)
   * @route   GET /api/mp/senalizacion
   * @access  Public
   */
  getAll: [
    validate(listSenalizacionSchema, "query"),
    async (req, res, next) => {
      try {
        const { page, limit, offset, sortBy, sortOrder, search } = parseListParams(req.query, {
          allowedSortFields: ["senalizacion", "createdAt", "updatedAt"],
          defaultSort: "senalizacion",
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
          whereClause[Op.or] = [{ senalizacion: { [Op.iLike]: `%${search}%` } }];
        }

        const data = await Senalizacion.findAndCountAll({
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
        console.error(" Error en getAll Senalizacion:", error);
        return next(error);
      }
    },
  ],

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/mp/senalizacion/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Senalizacion.findByPk(id);

      if (!data) {
        return next(apiErrors.notFound("Senalizacion"));
      }

      // Normalizar timestamps
      const dataNormalizada = normalizeTimestamps(data.toJSON());

      res.json({
        success: true,
        data: dataNormalizada,
      });
    } catch (error) {
      console.error(" Error en getById Senalizacion:", error);
      return next(error);
    }
  },

  /**
   * @desc    Crear nuevo registro (CON validación Zod en body)
   * @route   POST /api/mp/senalizacion
   * @access  Public
   */
  create: [
    validate(createSenalizacionSchema, "body"),
    async (req, res, next) => {
      try {
        // Filtrar campos de timestamps
        const { createdAt, updatedAt, ...cleanData } = req.body;

        const data = await Senalizacion.create(cleanData);

        // Normalizar respuesta
        const dataNormalizada = normalizeTimestamps(data.toJSON());

        res.status(201).json({
          success: true,
          data: dataNormalizada,
          message: "Señalización creada exitosamente",
        });
      } catch (error) {
        console.error(" Error creando Senalizacion:", error);
        if (error.name === "SequelizeValidationError") {
          const mensajes = error.errors?.map((err) => err.message).join(". ") || error.message;
          return next(apiErrors.badRequest(mensajes));
        }
        if (error.name === "SequelizeUniqueConstraintError") {
          return next(apiErrors.conflict("La señalización ya existe"));
        }
        return next(error);
      }
    },
  ],

  /**
   * @desc    Actualizar registro (CON validación Zod parcial)
   * @route   PUT /api/mp/senalizacion/:id
   * @access  Public
   */
  update: [
    validate(updateSenalizacionSchema, "body"),
    async (req, res, next) => {
      try {
        const { id } = req.params;

        // Filtrar campos de timestamps
        const { createdAt, updatedAt, ...cleanData } = req.body;

        const [affectedRows] = await Senalizacion.update(cleanData, {
          where: { id_senalizacion: id },
        });

        if (affectedRows === 0) {
          return next(apiErrors.notFound("Senalizacion"));
        }

        const updatedData = await Senalizacion.findByPk(id);

        // Normalizar respuesta
        const dataNormalizada = normalizeTimestamps(updatedData.toJSON());

        res.json({
          success: true,
          data: dataNormalizada,
          message: "Señalización actualizada exitosamente",
        });
      } catch (error) {
        console.error(" Error actualizando Senalizacion:", error);
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
   * @route   DELETE /api/mp/senalizacion/:id
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
        message: "Señalización eliminada exitosamente",
      });
    } catch (error) {
      console.error(" Error eliminando Senalizacion:", error);
      return next(error);
    }
  },
};

module.exports = SenalizacionController;
