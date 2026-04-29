const { Linea } = require("../models");
const { Op } = require("sequelize");
const { Recorrido, Queja } = require("../models");
const apiErrors = require("../utils/apiErrors");
const { parseListParams } = require("../utils/parseListParams");
const {
  createLineaSchema,
  updateLineaSchema,
  listLineaSchema,
} = require("../validations/linea.schemas");
const validate = require("../middleware/validate");

const LineaController = {
  /**
   * @desc    Obtener todos los registros (CON validación Zod en query)
   * @route   GET /api/tbLinea
   * @access  Public
   */
  getAll: [
    validate(listLineaSchema, "query"),
    async (req, res, next) => {
      try {
        const {
          page,
          limit,
          sortBy,
          sortOrder,
          search,
          offset,
          id_senalizacion,
          id_tipolinea,
          id_propietario,
        } = parseListParams(req.query, {
          allowedSortFields: ["clavelinea", "clave_n", "codificacion", "createdAt", "updatedAt"],
          defaultSort: "createdAt",
          defaultOrder: "DESC",
          maxLimit: 100,
        });

        // Construir where clause para búsqueda
        const whereClause = {};
        if (search) {
          whereClause[Op.or] = [{ clavelinea: { [Op.iLike]: `%${search}%` } }];
        }
        if (id_senalizacion) whereClause.id_senalizacion = id_senalizacion;
        if (id_tipolinea) whereClause.id_tipolinea = id_tipolinea;
        if (id_propietario) whereClause.id_propietario = id_propietario;

        const data = await Linea.findAndCountAll({
          where: whereClause,
          include: [
            {
              association: "tb_tipolinea",
              attributes: ["id_tipolinea", "tipo"],
            },
            {
              association: "tb_propietario",
              attributes: ["id_propietario", "nombre"],
            },
            {
              association: "tb_senalizacion",
              attributes: ["id_senalizacion", "senalizacion"],
            },
          ],
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
   * @route   GET /api/tbLinea/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const linea = await Linea.findByPk(id, {
        include: [
          {
            association: "tb_tipolinea",
            attributes: ["id_tipolinea", "tipo"],
          },
        ],
      });

      if (!linea) {
        return next(apiErrors.notFound("Linea"));
      }

      const recorridos = await Recorrido.findAll({
        where: { id_telefono: id },
        include: [
          {
            association: "tb_cable",
            attributes: ["id_cable", "numero"],
          },
          {
            association: "tb_planta",
            attributes: ["id_planta", "planta"],
          },
          {
            association: "tb_sistema",
            attributes: ["id_sistema", "sistema"],
          },
          {
            association: "tb_propietario",
            attributes: ["id_propietario", "nombre"],
          },
        ],
        limit: 100, // o paginación
      });

      const quejas = await Queja.findAll({
        where: { id_telefono: id },
        // include: [
        //   { model: Cable, attributes: ['id_cable', 'numero'] },
        //   { model: Planta, attributes: ['id_planta', 'planta'] }
        // ],
        limit: 100, // o paginación
      });

      res.json({
        success: true,
        data: {
          linea,
          recorridos,
          quejas,
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * @desc    Crear nuevo registro (CON validación Zod en body)
   * @route   POST /api/tbLinea
   * @access  Public
   */
  create: [
    validate(createLineaSchema, "body"),
    async (req, res, next) => {
      try {
        const data = await Linea.create(req.body);

        res.status(201).json({
          success: true,
          data,
          message: "Linea creado exitosamente",
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
   * @route   PUT /api/tbLinea/:id
   * @access  Public
   */
  update: [
    validate(updateLineaSchema, "body"),
    async (req, res, next) => {
      try {
        const { id } = req.params;

        const [affectedRows] = await Linea.update(req.body, {
          where: { id_linea: id },
        });

        if (affectedRows === 0) {
          return next(apiErrors.notFound("Linea"));
        }

        const updatedData = await Linea.findByPk(id);

        res.json({
          success: true,
          data: updatedData,
          message: "Linea actualizado exitosamente",
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
   * @route   DELETE /api/tbLinea/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Linea.destroy({
        where: { id_linea: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Linea"));
      }

      res.json({
        success: true,
        message: "Linea eliminado exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  },
};

// Dashboard stats for frontend
LineaController.dashboard = async function (req, res, next) {
  try {
    const { fecha_desde, fecha_hasta } = req.query;
    const where = {};
    if (fecha_desde || fecha_hasta) {
      where.createdAt = {};
      if (fecha_desde) where.createdAt[Op.gte] = new Date(fecha_desde);
      if (fecha_hasta) where.createdAt[Op.lte] = new Date(fecha_hasta);
    }

    const total = await Linea.count({ where });
    const activas = await Linea.count({ where: { ...where, esbaja: false } });
    const inactivas = await Linea.count({ where: { ...where, esbaja: true } });

    // Top propietarios
    const propietarios = await Linea.findAll({
      where,
      attributes: [["id_propietario", "id_propietario"]],
      include: [{ association: "tb_propietario", attributes: ["nombre"] }],
      limit: 0,
    });

    // For lightweight response, compute some aggregates via raw queries
    const byProp = await Linea.sequelize.query(
      `SELECT p.nombre as name, COUNT(1) as value FROM tb_linea l LEFT JOIN tb_propietario p ON l.id_propietario = p.id_propietario
        WHERE ($1::timestamp IS NULL OR l."createdAt" >= $1::timestamp)
          AND ($2::timestamp IS NULL OR l."createdAt" <= $2::timestamp)
        GROUP BY p.nombre ORDER BY value DESC LIMIT 10`,
      { bind: [fecha_desde || null, fecha_hasta || null], type: Linea.sequelize.QueryTypes.SELECT },
    );

    const bySenal = await Linea.sequelize.query(
      `SELECT s.senalizacion as name, COUNT(1) as value FROM tb_linea l LEFT JOIN tb_senalizacion s ON l.id_senalizacion = s.id_senalizacion
        WHERE ($1::timestamp IS NULL OR l."createdAt" >= $1::timestamp)
          AND ($2::timestamp IS NULL OR l."createdAt" <= $2::timestamp)
        GROUP BY s.senalizacion ORDER BY value DESC LIMIT 10`,
      { bind: [fecha_desde || null, fecha_hasta || null], type: Linea.sequelize.QueryTypes.SELECT },
    );

    const byYear = await Linea.sequelize.query(
      `SELECT to_char(l."createdAt", 'YYYY') as year, COUNT(1) as cantidad FROM tb_linea l
        WHERE ($1::timestamp IS NULL OR l."createdAt" >= $1::timestamp)
          AND ($2::timestamp IS NULL OR l."createdAt" <= $2::timestamp)
        GROUP BY year ORDER BY year ASC`,
      { bind: [fecha_desde || null, fecha_hasta || null], type: Linea.sequelize.QueryTypes.SELECT },
    );

    const topLineasQuejas = await Linea.sequelize.query(
      `SELECT COALESCE(l.clavelinea, CONCAT('Línea ', l.id_linea)) as name, COUNT(q.id_queja) as value
        FROM tb_linea l LEFT JOIN tb_queja q ON q.id_linea = l.id_linea
        WHERE ($1::timestamp IS NULL OR q."createdAt" >= $1::timestamp)
          AND ($2::timestamp IS NULL OR q."createdAt" <= $2::timestamp)
        GROUP BY name ORDER BY value DESC LIMIT 10`,
      { bind: [fecha_desde || null, fecha_hasta || null], type: Linea.sequelize.QueryTypes.SELECT },
    );

    res.json({
      success: true,
      data: {
        total,
        activas,
        inactivas,
        byProp: byProp || [],
        bySenal: bySenal || [],
        byYear: byYear || [],
        topLineasQuejas: topLineasQuejas || [],
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = LineaController;
