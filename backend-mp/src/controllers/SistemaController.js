const { Sistema } = require("../models");
const { Op } = require("sequelize");
const apiErrors = require("../utils/apiErrors");
const { parseListParams } = require("../utils/parseListParams");
const {
  createSistemaSchema,
  updateSistemaSchema,
  listSistemaSchema,
} = require("../validations/sistema.schemas");
const validate = require("../middleware/validate");

const SistemaController = {
  /**
   * @desc    Obtener todos los registros (CON validación Zod en query)
   * @route   GET /api/tbSistema
   * @access  Public
   */
  getAll: [
    validate(listSistemaSchema, "query"),
    async (req, res, next) => {
      try {
        const { page, limit, sortBy, sortOrder, search, offset } =
          parseListParams(req.query, {
            allowedSortFields: [
              "sistema",
              "direccion",
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
          whereClause[Op.or] = [
            // Buscar en campos de texto del modelo Sistema
            { sistema: { [Op.iLike]: `%${search}%` } },
            { direccion: { [Op.iLike]: `%${search}%` } },
          ].filter(Boolean);
        }

        const data = await Sistema.findAndCountAll({
          where: whereClause,
          include: [
            {
              association: "tb_propietario",
              attributes: ["id_propietario", "nombre"],
            },
          ],
          limit: limit,
          offset: offset,
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
   * @route   GET /api/tbSistema/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Sistema.findByPk(id, {
        include: [
          {
            association: "tb_propietario",
            attributes: ["id_propietario", "nombre"],
          },
        ],
      });

      if (!data) {
        return next(apiErrors.notFound("Sistema"));
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
   * @route   POST /api/tbSistema
   * @access  Public
   */
  create: [
    validate(createSistemaSchema, "body"),
    async (req, res, next) => {
      try {
        const data = await Sistema.create(req.body);

        res.status(201).json({
          success: true,
          data,
          message: "Sistema creado exitosamente",
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
   * @route   PUT /api/tbSistema/:id
   * @access  Public
   */
  update: [
    validate(updateSistemaSchema, "body"),
    async (req, res, next) => {
      try {
        const { id } = req.params;

        const [affectedRows] = await Sistema.update(req.body, {
          where: { id_sistema: id },
        });

        if (affectedRows === 0) {
          return next(apiErrors.notFound("Sistema"));
        }

        const updatedData = await Sistema.findByPk(id, {
          include: [
            {
              association: "tb_propietario",
              attributes: ["id_propietario", "nombre"],
            },
          ],
        });

        res.json({
          success: true,
          data: updatedData,
          message: "Sistema actualizado exitosamente",
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
   * @route   DELETE /api/tbSistema/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Sistema.destroy({
        where: { id_sistema: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Sistema"));
      }

      res.json({
        success: true,
        message: "Sistema eliminado exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = SistemaController;
