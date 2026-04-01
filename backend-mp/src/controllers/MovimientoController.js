const { Movimiento } = require("../models");
const { Op } = require("sequelize");
const apiErrors = require("../utils/apiErrors");
const { parseListParams } = require("../utils/parseListParams");
const {
  createMovimientoSchema,
  updateMovimientoSchema,
  listMovimientoSchema,
} = require("../validations/movimiento.schemas");
const validate = require("../middleware/validate");

const MovimientoController = {
  /**
   * @desc    Obtener todos los registros (CON validación Zod en query)
   * @route   GET /api/tbMovimiento
   * @access  Public
   */
  getAll: [
    validate(listMovimientoSchema, "query"),
    async (req, res, next) => {
      try {
        const {
          page,
          limit,
          offset,
          sortBy,
          sortOrder,
          search,
          id_telefono,
          id_tipomovimiento,
          id_linea,
        } = parseListParams(req.query, {
          allowedSortFields: ["fecha", "motivo", "createdAt", "updatedAt"],
          defaultSort: "createdAt",
          defaultOrder: "DESC",
          maxLimit: 100,
        });

        // Construir where clause para búsqueda
        const whereClause = {};
        if (search) {
          whereClause[Op.or] = [{ movimiento: { [Op.iLike]: `%${search}%` } }];
        }
        if (id_tipomovimiento)
          whereClause.id_tipomovimiento = id_tipomovimiento;
        if (id_telefono) whereClause.id_telefono = id_telefono;
        if (id_linea) whereClause.id_linea = id_linea;

        const data = await Movimiento.findAndCountAll({
          where: whereClause,
          limit: limit,
          offset: offset,
          order: [[sortBy, sortOrder]],
          distinct: true,
          include: [
            {
              association: "tb_tipomovimiento",
              attributes: ["id_tipomovimiento", "movimiento"],
            },
            {
              association: "tb_telefono",
              attributes: ["id_telefono", "telefono"],
            },
            {
              association: "tb_linea",
              attributes: ["id_linea", "clavelinea"],
            },
          ],
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
   * @route   GET /api/tbMovimiento/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Movimiento.findByPk(id);

      if (!data) {
        return next(apiErrors.notFound("Movimiento"));
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
   * @route   POST /api/tbMovimiento
   * @access  Public
   */
  create: [
    validate(createMovimientoSchema, "body"),
    async (req, res, next) => {
      try {
        const data = await Movimiento.create(req.body);

        res.status(201).json({
          success: true,
          data,
          message: "Movimiento creado exitosamente",
        });
      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          const mensaje =
            error.errors?.map((err) => err.message).join(". ") || error.message;
          return next(apiErrors.badRequest(mensaje));
        }

        return next(error);
      }
    },
  ],

  /**
   * @desc    Actualizar registro (CON validación Zod parcial)
   * @route   PUT /api/tbMovimiento/:id
   * @access  Public
   */
  update: [
    validate(updateMovimientoSchema, "body"),
    async (req, res, next) => {
      try {
        const { id } = req.params;

        const [affectedRows] = await Movimiento.update(req.body, {
          where: { id_movimiento: id },
        });

        if (affectedRows === 0) {
          return next(apiErrors.notFound("Movimiento"));
        }

        const updatedData = await Movimiento.findByPk(id);

        res.json({
          success: true,
          data: updatedData,
          message: "Movimiento actualizado exitosamente",
        });
      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          const mensaje =
            error.errors?.map((err) => err.message).join(". ") || error.message;
          return next(apiErrors.badRequest(mensaje));
        }

        return next(error);
      }
    },
  ],

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbMovimiento/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Movimiento.destroy({
        where: { id_movimiento: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Movimiento"));
      }

      res.json({
        success: true,
        message: "Movimiento eliminado exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  },

  async getMovimientoByTelefono(req, res, next) {
    try {
      const { telefono } = req.params;
      const { page, limit, offset, sortBy, sortOrder } = parseListParams(
        req.query,
        {
          allowedSortFields: ["fecha", "motivo", "createdAt"],
          defaultSort: "fecha",
          maxLimit: 100,
        },
      );

      const data = await Movimiento.findAll({
        where: { id_telefono: telefono },
        limit,
        offset,
        order: [[sortBy, sortOrder]],
        distinct: true,
        include: [
          {
            association: "tb_tipomovimiento",
            attributes: ["id_tipomovimiento", "movimiento"],
          },
        ],
      });

      // if (!data) return next(apiErrors.notFound("Teléfono"));
      // if (!data.length)
      //   return next(apiErrors.notFound("Movimientos de Teléfono"));

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  async getMovimientoByLinea(req, res, next) {
    try {
      const { linea } = req.params;
      const data = await Movimiento.findAll({
        where: { id_linea: linea },
        include: [
          {
            association: "tb_tipomovimiento",
            attributes: ["id_tipomovimiento", "movimiento"],
          },
        ],
      });

      // if (!data) return next(apiErrors.notFound("Línea"));

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      return next(error);
    }
  },
};
module.exports = MovimientoController;
