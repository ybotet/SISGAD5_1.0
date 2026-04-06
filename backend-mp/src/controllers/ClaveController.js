const { Clave } = require("../models");
const { Op } = require("sequelize");
const apiErrors = require("../utils/apiErrors");
const { parseListParams } = require("../utils/parseListParams");
const {
  createClaveSchema,
  updateClaveSchema,
  listClaveSchema,
} = require("../validations/clave.schemas");
const validate = require("../middleware/validate");

const ClaveController = {
  /**
   * @desc    Obtener todos los registros (CON validación Zod en query)
   * @route   GET /api/tbClave
   * @access  Public
   */
  getAll: [
    validate(listClaveSchema, "query"),
    async (req, res, next) => {
      try {
        // 🔹 1. Parsear parámetros CON parseListParams (REEMPLAZA desestructuración manual)
        const { page, limit, offset, sortBy, sortOrder, search } = parseListParams(req.query, {
          allowedSortFields: ["clave", "descripcion", "createdAt", "updatedAt"],
          defaultSort: "clave", // ← Ajustar al campo principal de Clave
          defaultOrder: "ASC",
          maxLimit: 1000,
        });

        // 🔹 2. BLINDAJE EXTRA: Fallback explícito por seguridad
        const ALLOWED_SORT = ["clave", "descripcion", "createdAt", "updatedAt"];
        const sortBySafe = ALLOWED_SORT.includes(sortBy) ? sortBy : "clave";
        const sortOrderSafe = ["ASC", "DESC"].includes(sortOrder?.toUpperCase())
          ? sortOrder.toUpperCase()
          : "ASC";

        // 🔹 3. Debug temporal (puedes quitarlo después)
        console.log("🔍 CLAVE ORDER:", {
          sortBySafe,
          sortOrderSafe,
          offset,
          limit,
        });

        // 🔹 4. Where clause
        const whereClause = {};
        if (search) {
          whereClause[Op.or] = [{ clave: { [Op.iLike]: `%${search}%` } }];
        }

        // 🔹 5. Consulta con valores 100% seguros
        const data = await Clave.findAndCountAll({
          where: whereClause,
          limit: limit, // ← Ya es número válido
          offset: offset, // ← Ya es número válido (NO parseInt)
          order: [[sortBySafe, sortOrderSafe]], // ← Strings válidos, NUNCA undefined
          distinct: true,
        });

        res.json({
          success: true,
          data: data.rows,
          pagination: {
            page,
            limit,
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
   * @route   GET /api/tbClave/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Clave.findByPk(id);

      if (!data) {
        return next(apiErrors.notFound("Clave"));
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
   * @route   POST /api/tbClave
   * @access  Public
   */
  create: [
    validate(createClaveSchema, "body"),
    async (req, res, next) => {
      try {
        const data = await Clave.create(req.body);

        res.status(201).json({
          success: true,
          data,
          message: "Clave creado exitosamente",
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
   * @desc    Actualizar registro (CON validación Zod parcial)
   * @route   PUT /api/tbClave/:id
   * @access  Public
   */
  update: [
    validate(updateClaveSchema, "body"),
    async (req, res, next) => {
      try {
        const { id } = req.params;

        const [affectedRows] = await Clave.update(req.body, {
          where: { id_clave: id },
        });

        if (affectedRows === 0) {
          return next(apiErrors.notFound("Clave"));
        }

        const updatedData = await Clave.findByPk(id);

        res.json({
          success: true,
          data: updatedData,
          message: "Clave actualizado exitosamente",
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
   * @route   DELETE /api/tbClave/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Clave.destroy({
        where: { id_clave: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Clave"));
      }

      res.json({
        success: true,
        message: "Clave eliminado exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = ClaveController;
