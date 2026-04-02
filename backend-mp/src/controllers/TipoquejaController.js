const { Tipoqueja } = require("../models");
const { Op } = require("sequelize");
const apiErrors = require("../utils/apiErrors");
const {
  createTipoquejaSchema,
  updateTipoquejaSchema,
  listTipoquejaSchema,
} = require("../validations/tipoqueja.schemas");
const validate = require("../middleware/validate");
const { parseListParams } = require("../utils/parseListParams");

const TipoquejaController = {
  /**
   * @desc    Obtener todos los registros (CON validación Zod en query)
   * @route   GET /api/tbTipoqueja
   * @access  Public
   */
  getAll: [
    validate(listTipoquejaSchema, "query"),
    async (req, res, next) => {
      try {
        const { page, limit, offset, sortBy, sortOrder, search } =
          parseListParams(req.query, {
            allowedSortFields: ["tipoqueja", "createdAt", "updatedAt"],
            defaultSort: "tipo",
            defaultOrder: "ASC",
            maxLimit: 500, // ← Permitir hasta 500 para este endpoint
          });

        // Construir where clause para búsqueda
        const whereClause = {};
        if (search) {
          whereClause[Op.or] = [{ tipoqueja: { [Op.iLike]: `%${search}%` } }];
        }

        // Validación defensiva para orden
        const ALLOWED_SORT = [
          "tipoqueja",
          "servicio",
          "id_tipoqueja",
          "createdAt",
          "updatedAt",
        ];

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

        const data = await Tipoqueja.findAndCountAll({
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
   * @route   GET /api/tbTipoqueja/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Tipoqueja.findByPk(id);

      if (!data) {
        return next(apiErrors.notFound("Tipoqueja"));
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
   * @route   POST /api/tbTipoqueja
   * @access  Public
   */
  create: [
    validate(createTipoquejaSchema, "body"),
    async (req, res, next) => {
      try {
        const data = await Tipoqueja.create(req.body);

        res.status(201).json({
          success: true,
          data,
          message: "Tipoqueja creado exitosamente",
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
   * @route   PUT /api/tbTipoqueja/:id
   * @access  Public
   */
  update: [
    validate(updateTipoquejaSchema, "body"),
    async (req, res, next) => {
      try {
        const { id } = req.params;

        const [affectedRows] = await Tipoqueja.update(req.body, {
          where: { id_tipoqueja: id },
        });

        if (affectedRows === 0) {
          return next(apiErrors.notFound("Tipoqueja"));
        }

        const updatedData = await Tipoqueja.findByPk(id);

        res.json({
          success: true,
          data: updatedData,
          message: "Tipoqueja actualizado exitosamente",
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
   * @route   DELETE /api/tbTipoqueja/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Tipoqueja.destroy({
        where: { id_tipoqueja: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Tipoqueja"));
      }

      res.json({
        success: true,
        message: "Tipoqueja eliminado exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = TipoquejaController;
