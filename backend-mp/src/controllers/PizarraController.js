const { Pizarra } = require("../models");
const { Op } = require("sequelize");
const apiErrors = require("../utils/apiErrors");
const { parseListParams } = require("../utils/parseListParams");
const {
  createPizarraSchema,
  updatePizarraSchema,
  listPizarraSchema,
} = require("../validations/pizarra.schemas");
const validate = require("../middleware/validate");

const PizarraController = {
  /**
   * @desc    Obtener todos los registros (CON validación Zod en query)
   * @route   GET /api/tbPizarra
   * @access  Public
   */
  getAll: [
    validate(listPizarraSchema, "query"),
    async (req, res, next) => {
      try {
        const { page, limit, sortBy, sortOrder, offset, search, id_tipopizarra } = parseListParams(
          req.query,
          {
            allowedSortFields: ["nombre", "createdAt", "updatedAt"],
            defaultSort: "createdAt",
            defaultOrder: "DESC",
            maxLimit: 100,
            columnMapping: {
              createdAt: "created_at",
              updatedAt: "updated_at",
            },
          },
        );

        const columnMapping = {
          createdAt: "created_at",
          updatedAt: "updated_at",
        };
        const sortColumn = columnMapping[sortBy] || sortBy;

        // Construir where clause para búsqueda
        const whereClause = {};
        if (search) {
          whereClause[Op.or] = [{ nombre: { [Op.iLike]: `%${search}%` } }];
        }
        if (id_tipopizarra) whereClause.id_tipopizarra = id_tipopizarra;

        const data = await Pizarra.findAndCountAll({
          where: whereClause,
          include: [
            {
              association: "tb_tipopizarra",
              attributes: ["id_tipopizarra", "tipo"],
            },
          ],
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [[sortBy, sortOrder]],
          distinct: true,
        });

        const rowsNormalizados = data.rows.map((row) => {
          const json = row.toJSON();
          json.createdAt = json.created_at;
          json.updatedAt = json.updated_at;
          delete json.created_at;
          delete json.updated_at;
          return json;
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
        return next(error);
      }
    },
  ],

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbPizarra/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const pizarra = await Pizarra.findByPk(id);

      if (!pizarra) {
        return next(apiErrors.notFound("Pizarra"));
      }

      const pizarraNormalizada = pizarra.toJSON();
      pizarraNormalizada.createdAt = pizarraNormalizada.created_at;
      pizarraNormalizada.updatedAt = pizarraNormalizada.updated_at;
      delete pizarraNormalizada.created_at;
      delete pizarraNormalizada.updated_at;

      res.json({
        success: true,
        data: pizarraNormalizada,
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * @desc    Crear nuevo registro (CON validación Zod en body)
   * @route   POST /api/tbPizarra
   * @access  Public
   */
  create: [
    validate(createPizarraSchema, "body"),
    async (req, res, next) => {
      try {
        const pizarra = await Pizarra.create(req.body);

        res.status(201).json({
          success: true,
          data: pizarra,
          message: "Pizarra creado exitosamente",
        });
      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          const mensajes = error.errors.map((err) => err.message).join(". ");
          return next(apiErrors.badRequest(mensajes));
        }

        return next(error);
      }
    },
  ],

  /**
   * @desc    Actualizar registro (CON validación Zod parcial)
   * @route   PUT /api/tbPizarra/:id
   * @access  Public
   */
  update: [
    validate(updatePizarraSchema, "body"),
    async (req, res, next) => {
      try {
        const { id } = req.params;

        const [affectedRows] = await Pizarra.update(req.body, {
          where: { id_pizarra: id },
        });

        if (affectedRows === 0) {
          return next(apiErrors.notFound("Pizarra"));
        }

        const updatedData = await Pizarra.findByPk(id);

        res.json({
          success: true,
          data: updatedData,
          message: "Pizarra actualizado exitosamente",
        });
      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          const mensajes = error.errors.map((err) => err.message).join(". ");
          return next(apiErrors.badRequest(mensajes));
        }

        return next(error);
      }
    },
  ],

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbPizarra/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Pizarra.destroy({
        where: { id_pizarra: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Pizarra"));
      }

      res.json({
        success: true,
        message: "Pizarra eliminado exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = PizarraController;
