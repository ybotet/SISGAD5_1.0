const { Mando } = require("../models");
const { Op } = require("sequelize");
const apiErrors = require("../utils/apiErrors");
const { parseListParams } = require("../utils/parseListParams");
const {
  createMandoSchema,
  updateMandoSchema,
  listMandoSchema,
} = require("../validations/mando.schemas");
const validate = require("../middleware/validate");

const MandoController = {
  /**
   * @desc    Obtener todos los registros (CON validación Zod en query)
   * @route   GET /api/tbMando
   * @access  Public
   */
  getAll: [
    validate(listMandoSchema, "query"),
    async (req, res, next) => {
      try {
        // 🔹 1. Parsear parámetros de forma segura (REEMPLAZA la desestructuración manual)
        const { page, limit, offset, sortBy, sortOrder, search } =
          parseListParams(req.query, {
            allowedSortFields: ["mando", "createdAt", "updatedAt"],
            defaultSort: "createdAt",
            defaultOrder: "DESC",
            maxLimit: 100, // Ajustar según necesites
          });

        // 🔹 2. Construir where clause
        const whereClause = {};
        if (search) {
          whereClause[Op.or] = [{ mando: { [Op.iLike]: `%${search}%` } }];
        }

        // 🔹 3. Consulta con valores 100% seguros
        const data = await Mando.findAndCountAll({
          where: whereClause,
          limit: limit,
          offset: offset,
          order: [[sortBy, sortOrder]],
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
   * @route   GET /api/tbMando/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Mando.findByPk(id);

      if (!data) {
        return next(apiErrors.notFound("Mando"));
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
   * @route   POST /api/tbMando
   * @access  Public
   */
  create: [
    validate(createMandoSchema, "body"),
    async (req, res, next) => {
      try {
        const data = await Mando.create(req.body);

        res.status(201).json({
          success: true,
          data,
          message: "Mando creado exitosamente",
        });
      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          const mensajes =
            error.errors?.map((err) => err.message).join(". ") || error.message;
          return next(apiErrors.badRequest(mensajes));
        }

        if (error.name === "SequelizeUniqueConstraintError") {
          return next(apiErrors.conflict("El mando ya existe"));
        }

        return next(error);
      }
    },
  ],

  /**
   * @desc    Actualizar registro (CON validación Zod parcial)
   * @route   PUT /api/tbMando/:id
   * @access  Public
   */
  update: [
    validate(updateMandoSchema, "body"),
    async (req, res, next) => {
      try {
        const { id } = req.params;

        const [affectedRows] = await Mando.update(req.body, {
          where: { id_mando: id },
        });

        if (affectedRows === 0) {
          return next(apiErrors.notFound("Mando"));
        }

        const updatedData = await Mando.findByPk(id);

        res.json({
          success: true,
          data: updatedData,
          message: "Mando actualizado exitosamente",
        });
      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          const mensajes =
            error.errors?.map((err) => err.message).join(". ") || error.message;
          return next(apiErrors.badRequest(mensajes));
        }

        if (error.name === "SequelizeUniqueConstraintError") {
          return next(apiErrors.conflict("El mando ya existe"));
        }

        return next(error);
      }
    },
  ],

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbMando/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Mando.destroy({
        where: { id_mando: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Mando"));
      }

      res.json({
        success: true,
        message: "Mando eliminado exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = MandoController;
