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

const TipomovimientoController = {
  /**
   * @desc    Obtener todos los registros (CON validación Zod en query)
   * @route   GET /api/tbTipomovimiento
   * @access  Public
   */
  getAll: [
    validate(listTipomovimientoSchema, "query"),
    async (req, res, next) => {
      try {
        const { page, limit, sortBy, sortOrder, search, offset } =
          parseListParams(req.query, {
            allowedSortFields: [
              "movimiento",
              "estadobaja",
              "id_tipomovimiento",
              "createdAt",
              "updatedAt",
            ],
            defaultSort: "createdAt",
            defaultOrder: "DESC",
            maxLimit: 100,
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
   * @route   GET /api/tbTipomovimiento/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Tipomovimiento.findByPk(id);

      if (!data) {
        return next(apiErrors.notFound("Tipomovimiento"));
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
   * @route   POST /api/tbTipomovimiento
   * @access  Public
   */
  create: [
    validate(createTipomovimientoSchema, "body"),
    async (req, res, next) => {
      try {
        const data = await Tipomovimiento.create(req.body);

        res.status(201).json({
          success: true,
          data,
          message: "Tipomovimiento creado exitosamente",
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
   * @route   PUT /api/tbTipomovimiento/:id
   * @access  Public
   */
  update: [
    validate(updateTipomovimientoSchema, "body"),
    async (req, res, next) => {
      try {
        const { id } = req.params;

        const [affectedRows] = await Tipomovimiento.update(req.body, {
          where: { id_tipomovimiento: id },
        });

        if (affectedRows === 0) {
          return next(apiErrors.notFound("Tipomovimiento"));
        }

        const updatedData = await Tipomovimiento.findByPk(id);

        res.json({
          success: true,
          data: updatedData,
          message: "Tipomovimiento actualizado exitosamente",
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
   * @route   DELETE /api/tbTipomovimiento/:id
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
        message: "Tipomovimiento eliminado exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = TipomovimientoController;
