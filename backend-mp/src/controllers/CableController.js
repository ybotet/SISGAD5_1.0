const apiErrors = require("../utils/apiErrors");
const { Cable } = require("../models");
const { Op } = require("sequelize");
const { parseListParams } = require("../utils/parseListParams");
const {
  createCableSchema,
  updateCableSchema,
  listCableSchema,
} = require("../validations/cable.schemas");
const validate = require("../middleware/validate");

const CableController = {
  /**
   * @desc    Obtener todos los registros (CON validación Zod en query)
   * @route   GET /api/tbCable
   * @access  Public
   */
  getAll: [
    validate(listCableSchema, "query"),
    async (req, res, next) => {
      try {
        const {
          page,
          limit,
          offset,
          sortBy,
          sortOrder,
          search,
          id_propietario,
        } = parseListParams(req.query, {
          allowedSortFields: ["mando", "createdAt", "updatedAt"],
          defaultSort: "createdAt",
          defaultOrder: "DESC",
          maxLimit: 100, // Ajustar según necesites
        });

        // Construir where clause para búsqueda
        const whereClause = {};
        if (search) {
          whereClause[Op.or] = [{ numero: { [Op.iLike]: `%${search}%` } }];
        }
        if (id_propietario) whereClause.id_propietario = id_propietario;

        const data = await Cable.findAndCountAll({
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
   * @route   GET /api/tbCable/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Cable.findByPk(id, {
        include: [
          {
            association: "tb_propietario",
            attributes: ["id_propietario", "nombre"],
          },
        ],
      });

      if (!data) {
        return next(apiErrors.notFound("Cable"));
      }

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * @desc    Crear nuevo registro (CON validación Zod en body)
   * @route   POST /api/tbCable
   * @access  Public
   */
  create: [
    validate(createCableSchema, "body"),
    async (req, res, next) => {
      try {
        const data = await Cable.create(req.body);

        res.status(201).json({
          success: true,
          data,
          message: "Cable creado exitosamente",
        });
      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          return next(apiErrors.badRequest(error.errors[0].message));
        }
        if (error.name === "SequelizeUniqueConstraintError") {
          return next(apiErrors.conflict("Registro duplicado"));
        }

        next(error);
      }
    },
  ],

  /**
   * @desc    Actualizar registro (CON validación Zod parcial)
   * @route   PUT /api/tbCable/:id
   * @access  Public
   */
  update: [
    validate(updateCableSchema, "body"),
    async (req, res, next) => {
      try {
        const { id } = req.params;

        const [affectedRows] = await Cable.update(req.body, {
          where: { id_cable: id },
        });

        if (affectedRows === 0) {
          return next(apiErrors.notFound("Cable"));
        }

        const updatedData = await Cable.findByPk(id, {
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
          message: "Cable actualizado exitosamente",
        });
      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          return next(apiErrors.badRequest(error.errors[0].message));
        }
        if (error.name === "SequelizeUniqueConstraintError") {
          return next(apiErrors.conflict("Registro duplicado"));
        }

        next(error);
      }
    },
  ],

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbCable/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Cable.destroy({
        where: { id_cable: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Cable"));
      }

      res.json({
        success: true,
        message: "Cable eliminado exitosamente",
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = CableController;
