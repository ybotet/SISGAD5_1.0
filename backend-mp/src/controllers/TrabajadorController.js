const { Trabajador, Grupow } = require("../models");
const { Op } = require("sequelize");
const apiErrors = require("../utils/apiErrors");
const { parseListParams } = require("../utils/parseListParams");
const {
  createTrabajadorSchema,
  updateTrabajadorSchema,
  listTrabajadorSchema,
} = require("../validations/trabajador.schemas");
const validate = require("../middleware/validate");

const TrabajadorController = {
  /**
   * @swagger
   * tags:
   *   name: Trabajadores
   *   description: Gestión de trabajadores
   */

  /**
   * @swagger
   * /tbTrabajador:
   *   get:
   *     summary: Listar trabajadores con paginación
   *     tags: [Trabajadores]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema: { type: integer, default: 1 }
   *       - in: query
   *         name: limit
   *         schema: { type: integer, default: 10 }
   *     responses:
   *       200:
   *         description: Lista de trabajadores
   */
  /**
   * @desc    Obtener todos los registros (CON validación Zod en query)
   * @route   GET /api/tbTrabajador
   * @access  Public
   */
  getAll: [
    validate(listTrabajadorSchema, "query", {
      allowedSortFields: ["clave_trabajador", "nombre", "cargo", "createdAt", "updatedAt"],
      defaultSort: "createdAt",
      defaultOrder: "DESC",
      maxLimit: 100,
      columnMapping: {
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    }),
    async (req, res, next) => {
      try {
        const { page, limit, sortBy, sortOrder, search, offset } = parseListParams(req.query, {
          allowedSortFields: ["clave_trabajador", "nombre", "cargo", "createdAt", "updatedAt"],
          defaultSort: "createdAt",
          defaultOrder: "DESC",
          maxLimit: 100,
          columnMapping: {
            createdAt: "created_at",
            updatedAt: "updated_at",
          },
        });

        // Construir where clause para búsqueda
        const whereClause = {};
        if (search) {
          whereClause[Op.or] = [
            { nombre: { [Op.iLike]: `%${search}%` } },
            { cargo: { [Op.iLike]: `%${search}%` } },
            { clave_trabajador: { [Op.iLike]: `%${search}%` } },
          ];
        }

        const data = await Trabajador.findAndCountAll({
          where: whereClause,
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [[sortBy, sortOrder]],
          include: [
            {
              model: Grupow,
              as: "tb_grupow",
              // maxLimit: 100,
              attributes: ["id_grupow", "grupo"],
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
   * @route   GET /api/tbTrabajador/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Trabajador.findByPk(id, {
        include: [
          {
            model: Grupow,
            as: "tb_grupow",
            attributes: ["id_grupow", "grupo"],
          },
        ],
      });

      if (!data) {
        return next(apiErrors.notFound("Trabajador"));
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
   * @route   POST /api/tbTrabajador
   * @access  Public
   */
  create: [
    validate(createTrabajadorSchema, "body"),
    async (req, res, next) => {
      try {
        const data = await Trabajador.create(req.body);

        res.status(201).json({
          success: true,
          data,
          message: "Trabajador creado exitosamente",
        });
      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          const mensajes = error.errors?.map((err) => err.message).join(". ") || error.message;
          return next(apiErrors.badRequest(mensajes));
        }

        return next(error);
      }
    },
  ],

  /**
   * @desc    Actualizar registro (CON validación Zod parcial)
   * @route   PUT /api/tbTrabajador/:id
   * @access  Public
   */
  update: [
    validate(updateTrabajadorSchema, "body"),
    async (req, res, next) => {
      try {
        const { id } = req.params;

        const [affectedRows] = await Trabajador.update(req.body, {
          where: { id_trabajador: id },
        });

        if (affectedRows === 0) {
          return next(apiErrors.notFound("Trabajador"));
        }

        const updatedData = await Trabajador.findByPk(id);

        res.json({
          success: true,
          data: updatedData,
          message: "Trabajador actualizado exitosamente",
        });
      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          const mensajes = error.errors?.map((err) => err.message).join(". ") || error.message;
          return next(apiErrors.badRequest(mensajes));
        }

        return next(error);
      }
    },
  ],

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbTrabajador/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Trabajador.destroy({
        where: { id_trabajador: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Trabajador"));
      }

      res.json({
        success: true,
        message: "Trabajador eliminado exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  },

  async getProbadores(req, res, next) {
    try {
      const data = await Trabajador.findAll({
        include: [
          {
            model: Grupow, // Asegúrate de importar el modelo Grupow
            as: "tb_grupow", // Usa el alias que hayas definido en la asociación
            required: true, // Hace un INNER JOIN
            where: {
              grupo: "Probadores",
            },
          },
        ],
      });
      if (!data || data.length === 0) {
        return res.json({
          success: true,
          data: [],
          message: "No se encontraron probadores",
        });
      }
      // console.log(data)
      res.json({
        success: true,
        data: data,
      });
    } catch (error) {
      return next(error);
    }
  },
};

// Dashboard for trabajadores
TrabajadorController.dashboard = async function (req, res, next) {
  try {
    const { fecha_desde, fecha_hasta } = req.query;
    const where = {};
    if (fecha_desde || fecha_hasta) {
      where.created_at = {};
      if (fecha_desde) where.created_at[Op.gte] = new Date(fecha_desde);
      if (fecha_hasta) where.created_at[Op.lte] = new Date(fecha_hasta);
    }

    const total = await Trabajador.count({ where });
    const activos = await Trabajador.count({ where: { ...where, activo: true } });
    const inactivos = await Trabajador.count({ where: { ...where, activo: false } });

    // by group
    const byGroup = await Trabajador.sequelize.query(
      `SELECT g.grupo as name, COUNT(1) as value FROM tb_trabajador t LEFT JOIN tb_grupow g ON t.id_grupow = g.id_grupow
        WHERE ($1::timestamp IS NULL OR t."created_at" >= $1::timestamp)
          AND ($2::timestamp IS NULL OR t."created_at" <= $2::timestamp)
        GROUP BY g.grupo ORDER BY value DESC LIMIT 10`,
      {
        bind: [fecha_desde || null, fecha_hasta || null],
        type: Trabajador.sequelize.QueryTypes.SELECT,
      },
    );

    const byYear = await Trabajador.sequelize.query(
      `SELECT to_char(t."created_at", 'YYYY') as year, COUNT(1) as cantidad FROM tb_trabajador t
        WHERE ($1::timestamp IS NULL OR t."created_at" >= $1::timestamp)
          AND ($2::timestamp IS NULL OR t."created_at" <= $2::timestamp)
        GROUP BY year ORDER BY year ASC`,
      {
        bind: [fecha_desde || null, fecha_hasta || null],
        type: Trabajador.sequelize.QueryTypes.SELECT,
      },
    );

    // Top trabajadores by number of asignaciones
    const topTrabajadores = await Trabajador.sequelize.query(
      `SELECT COALESCE(t.clave_trabajador || ' ' || t.nombre, 'Sin nombre') as name, COUNT(a.id_asignacion) as value
          FROM tb_asignacion a
          LEFT JOIN tb_asignacion_trabajadores at ON a.id_asignacion = at.id_asignacion
          LEFT JOIN tb_trabajador t ON at.id_trabajador = t.id_trabajador
          WHERE ($1::timestamp IS NULL OR a."created_at" >= $1::timestamp)
            AND ($2::timestamp IS NULL OR a."created_at" <= $2::timestamp)
          GROUP BY name ORDER BY value DESC LIMIT 10`,
      {
        bind: [fecha_desde || null, fecha_hasta || null],
        type: Trabajador.sequelize.QueryTypes.SELECT,
      },
    );

    // total asignaciones in period
    const totalAsignacionesRes = await Trabajador.sequelize.query(
      `SELECT COUNT(1) as total FROM tb_asignacion a
          WHERE ($1::timestamp IS NULL OR a."created_at" >= $1::timestamp)
            AND ($2::timestamp IS NULL OR a."created_at" <= $2::timestamp)`,
      {
        bind: [fecha_desde || null, fecha_hasta || null],
        type: Trabajador.sequelize.QueryTypes.SELECT,
      },
    );
    const totalAsignaciones =
      (totalAsignacionesRes && totalAsignacionesRes[0] && totalAsignacionesRes[0].total) || 0;

    res.json({
      success: true,
      data: {
        total,
        activos,
        inactivos,
        byGroup: byGroup || [],
        byYear: byYear || [],
        topTrabajadores: topTrabajadores || [],
        totalAsignaciones,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = TrabajadorController;
