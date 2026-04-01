const { Clasificadorclave } = require("../models");
const { Op } = require("sequelize");
const apiErrors = require("../utils/apiErrors");
const {
  createClasificadorclaveSchema,
  updateClasificadorclaveSchema,
  listClasificadorclaveSchema,
} = require("../validations/clasificadorclave.schemas");
const validate = require("../middleware/validate");

const ClasificadorclaveController = {
  /**
   * @desc    Obtener todos los registros (CON validación Zod en query)
   * @route   GET /api/tbClasificadorclave
   * @access  Public
   */
  getAll: [
    validate(listClasificadorclaveSchema, "query"),
    async (req, res, next) => {
      try {
        const { page, limit, sortBy, sortOrder, search } = req.query;

        const offset = (page - 1) * limit;

        // Construir where clause para búsqueda
        const whereClause = {};
        if (search) {
          whereClause[Op.or] = [
            // Buscar en el campo clasificador
            { clasificador: { [Op.iLike]: `%${search}%` } },
          ].filter(Boolean);
        }

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

        const data = await Clasificadorclave.findAndCountAll({
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
   * @route   GET /api/tbClasificadorclave/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Clasificadorclave.findByPk(id);

      if (!data) {
        return next(apiErrors.notFound("Clasificadorclave"));
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
   * @route   POST /api/tbClasificadorclave
   * @access  Public
   */
  create: [
    validate(createClasificadorclaveSchema, "body"),
    async (req, res, next) => {
      try {
        const data = await Clasificadorclave.create(req.body);

        res.status(201).json({
          success: true,
          data,
          message: "Clasificadorclave creado exitosamente",
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
   * @route   PUT /api/tbClasificadorclave/:id
   * @access  Public
   */
  update: [
    validate(updateClasificadorclaveSchema, "body"),
    async (req, res, next) => {
      try {
        const { id } = req.params;

        const [affectedRows] = await Clasificadorclave.update(req.body, {
          where: { id_clasificadorclave: id },
        });

        if (affectedRows === 0) {
          return next(apiErrors.notFound("Clasificadorclave"));
        }

        const updatedData = await Clasificadorclave.findByPk(id);

        res.json({
          success: true,
          data: updatedData,
          message: "Clasificadorclave actualizado exitosamente",
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
   * @route   DELETE /api/tbClasificadorclave/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Clasificadorclave.destroy({
        where: { id_clasificadorclave: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Clasificadorclave"));
      }

      res.json({
        success: true,
        message: "Clasificadorclave eliminado exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = ClasificadorclaveController;
