const { Resultadoprueba } = require("../models");
const { Op } = require("sequelize");
const apiErrors = require("../utils/apiErrors");
const { parseListParams } = require("../utils/parseListParams"); // ← IMPORTAR
const {
  createResultadopruebaSchema,
  updateResultadopruebaSchema,
  listResultadopruebaSchema,
} = require("../validations/resultadoprueba.schemas");
const validate = require("../middleware/validate");

const ResultadopruebaController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbResultadoprueba
   * @access  Public
   */
  getAll: [
    validate(listResultadopruebaSchema, "query"),
    async (req, res, next) => {
      try {
        // 🔹 Parsear parámetros (REEMPLAZA la desestructuración manual)
        const { page, limit, offset, sortBy, sortOrder, search } =
          parseListParams(req.query, {
            allowedSortFields: ["resultado", "createdAt", "updatedAt"],
            defaultSort: "createdAt",
            defaultOrder: "DESC",
            maxLimit: 100,
          });

        // 🔹 Where clause
        const whereClause = {};
        if (search) {
          whereClause[Op.or] = [{ resultado: { [Op.iLike]: `%${search}%` } }];
        }

        // 🔹 Consulta: valores YA son seguros (NO hacer parseInt)
        const data = await Resultadoprueba.findAndCountAll({
          where: whereClause,
          limit: limit, // ← Número válido
          offset: offset, // ← Número válido (NO parseInt)
          order: [[sortBy, sortOrder]], // ← Strings válidos con defaults de Zod
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
   * @route   GET /api/tbResultadoprueba/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Resultadoprueba.findByPk(id);

      if (!data) {
        return next(apiErrors.notFound("Resultadoprueba"));
      }

      res.json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbResultadoprueba
   * @access  Public
   */
  create: [
    validate(createResultadopruebaSchema, "body"),
    async (req, res, next) => {
      try {
        const data = await Resultadoprueba.create(req.body);
        res.status(201).json({
          success: true,
          data,
          message: "Resultadoprueba creado exitosamente",
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
   * @desc    Actualizar registro
   * @route   PUT /api/tbResultadoprueba/:id
   * @access  Public
   */
  update: [
    validate(updateResultadopruebaSchema, "body"),
    async (req, res, next) => {
      try {
        const { id } = req.params;
        const [affectedRows] = await Resultadoprueba.update(req.body, {
          where: { id_resultadoprueba: id },
        });

        if (affectedRows === 0) {
          return next(apiErrors.notFound("Resultadoprueba"));
        }

        const updatedData = await Resultadoprueba.findByPk(id);
        res.json({
          success: true,
          data: updatedData,
          message: "Resultadoprueba actualizado exitosamente",
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
   * @route   DELETE /api/tbResultadoprueba/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const affectedRows = await Resultadoprueba.destroy({
        where: { id_resultadoprueba: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Resultadoprueba"));
      }

      res.json({
        success: true,
        message: "Resultadoprueba eliminado exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = ResultadopruebaController;
