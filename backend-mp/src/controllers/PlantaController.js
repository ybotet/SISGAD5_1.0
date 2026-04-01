const { Planta } = require("../models");
const { Op } = require("sequelize");
const apiErrors = require("../utils/apiErrors");
const { parseListParams } = require("../utils/parseListParams");
const {
  createPlantaSchema,
  updatePlantaSchema,
  listPlantaSchema,
} = require("../validations/planta.schemas");
const validate = require("../middleware/validate");

const PlantaController = {
  /**
   * @desc    Obtener todos los registros (CON validación Zod en query)
   * @route   GET /api/tbPlanta
   * @access  Public
   */
  getAll: [
    validate(listPlantaSchema, "query"),
    async (req, res, next) => {
      try {
        const { page, limit, offset, sortBy, sortOrder, search } =
          parseListParams(req.query, {
            allowedSortFields: ["planta", "createdAt", "updatedAt"],
            defaultSort: "createdAt",
            defaultOrder: "DESC",
            maxLimit: 100,
          });

        // Construir where clause para búsqueda
        const whereClause = {};
        if (search) {
          whereClause[Op.or] = [{ planta: { [Op.iLike]: `%${search}%` } }];
        }
        const data = await Planta.findAndCountAll({
          where: whereClause,
          limit: limit,
          offset: offset,
          order: [[sortBy, sortOrder]],
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
   * @route   GET /api/tbPlanta/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Planta.findByPk(id);

      if (!data) {
        return next(apiErrors.notFound("Planta"));
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
   * @route   POST /api/tbPlanta
   * @access  Public
   */
  create: [
    validate(createPlantaSchema, "body"),
    async (req, res, next) => {
      try {
        const data = await Planta.create(req.body);

        res.status(201).json({
          success: true,
          data,
          message: "Planta creado exitosamente",
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
   * @route   PUT /api/tbPlanta/:id
   * @access  Public
   */
  update: [
    validate(updatePlantaSchema, "body"),
    async (req, res, next) => {
      try {
        const { id } = req.params;

        const [affectedRows] = await Planta.update(req.body, {
          where: { id_planta: id },
        });

        if (affectedRows === 0) {
          return next(apiErrors.notFound("Planta"));
        }

        const updatedData = await Planta.findByPk(id);

        res.json({
          success: true,
          data: updatedData,
          message: "Planta actualizado exitosamente",
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
   * @route   DELETE /api/tbPlanta/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Planta.destroy({
        where: { id_planta: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Planta"));
      }

      res.json({
        success: true,
        message: "Planta eliminado exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = PlantaController;
