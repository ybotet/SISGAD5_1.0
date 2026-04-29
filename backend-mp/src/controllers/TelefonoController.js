const { Telefono } = require("../models");
const { Op } = require("sequelize");
const { Recorrido, Queja, Cable, Planta } = require("../models");
const apiErrors = require("../utils/apiErrors");
const { parseListParams } = require("../utils/parseListParams");
const {
  createTelefonoSchema,
  updateTelefonoSchema,
  listTelefonoSchema,
} = require("../validations/telefono.schemas");
const validate = require("../middleware/validate");

const TelefonoController = {
  /**
   * @desc    Obtener todos los registros (CON validación Zod en query)
   * @route   GET /api/tbTelefono
   * @access  Public
   */
  getAll: [
    validate(listTelefonoSchema, "query"),
    async (req, res, next) => {
      try {
        const { page, limit, sortBy, sortOrder, search, offset } = parseListParams(req.query, {
          allowedSortFields: [
            "telefono",
            "nombre",
            "direccion",
            "lic",
            "zona",
            "esbaja",
            "extensiones",
            "facturado",
            "sector",
            "id_mando",
            "id_clasificacion",
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
          whereClause[Op.or] = [{ telefono: { [Op.iLike]: `%${search}%` } }];
        }

        const data = await Telefono.findAndCountAll({
          where: whereClause,
          include: [
            {
              association: "tb_clasificacion",
              attributes: ["id_clasificacion", "nombre"],
            },
            {
              association: "tb_mando",
              attributes: ["id_mando", "mando"],
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
            page: page,
            limit: limit,
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
   * @route   GET /api/tbTelefono/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const telefono = await Telefono.findByPk(id, {
        include: [
          {
            association: "tb_clasificacion",
            attributes: ["id_clasificacion", "nombre"],
          },
          {
            association: "tb_mando",
            attributes: ["id_mando", "mando"],
          },
        ],
      });

      if (!telefono) {
        return next(apiErrors.notFound("Telefono"));
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
      // data.dataValues.recorridos = recorridos;

      const quejas = await Queja.findAll({
        where: { id_telefono: id },
        include: [
          {
            association: "tb_trabajador",
            attributes: ["id_trabajador", "clave_trabajador"],
          },
        ],
        limit: 100, // o paginación
      });

      res.json({
        success: true,
        data: {
          telefono,
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
   * @route   POST /api/tbTelefono
   * @access  Public
   */
  create: [
    validate(createTelefonoSchema, "body"),
    async (req, res, next) => {
      try {
        const data = await Telefono.create(req.body);

        res.status(201).json({
          success: true,
          data,
          message: "Telefono creado exitosamente",
        });
      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          const mensajes = error.errors.map((err) => err.message).join(". ");
          return next(apiErrors.badRequest(mensajes));
        }

        if (error.name === "SequelizeUniqueConstraintError") {
          return next(apiErrors.conflict("El teléfono ya existe"));
        }

        return next(error);
      }
    },
  ],

  /**
   * @desc    Actualizar registro (CON validación Zod parcial)
   * @route   PUT /api/tbTelefono/:id
   * @access  Public
   */
  update: [
    validate(updateTelefonoSchema, "body"),
    async (req, res, next) => {
      try {
        const { id } = req.params;

        const [affectedRows] = await Telefono.update(req.body, {
          where: { id_telefono: id },
        });

        if (affectedRows === 0) {
          return next(apiErrors.notFound("Telefono"));
        }

        const updatedData = await Telefono.findByPk(id, {
          include: [
            {
              association: "tb_clasificacion",
              attributes: ["id_clasificacion", "nombre"],
            },
            {
              association: "tb_mando",
              attributes: ["id_mando", "mando"],
            },
          ],
        });

        res.json({
          success: true,
          data: updatedData,
          message: "Telefono actualizado exitosamente",
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
   * @route   DELETE /api/tbTelefono/:id
   * @access  Public
   */
  async darBaja(req, res, next) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Telefono.update(
        { esbaja: true },
        {
          where: { id_telefono: id },
        },
      );

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Telefono"));
      }

      const updatedData = await Telefono.findByPk(id, {
        include: [
          {
            association: "tb_clasificacion",
            attributes: ["id_clasificacion", "nombre"],
          },
          {
            association: "tb_mando",
            attributes: ["id_mando", "mando"],
          },
        ],
      });

      res.json({
        success: true,
        data: updatedData,
        message: "Telefono dado de baja exitosamente",
      });
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        const mensajes = error.errors.map((err) => err.message).join(". ");
        return next(apiErrors.badRequest(mensajes));
      }

      return next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Telefono.destroy({
        where: { id_telefono: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Telefono"));
      }

      res.json({
        success: true,
        message: "Telefono eliminado exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = TelefonoController;

TelefonoController.dashboard = async function (req, res, next) {
  try {
    const { fecha_desde, fecha_hasta } = req.query;
    const where = {};
    if (fecha_desde || fecha_hasta) {
      where.createdAt = {};
      if (fecha_desde) where.createdAt[Op.gte] = new Date(fecha_desde);
      if (fecha_hasta) where.createdAt[Op.lte] = new Date(fecha_hasta);
    }

    const total = await Telefono.count({ where });
    const activos = await Telefono.count({ where: { ...where, esbaja: false } });
    const inactivos = await Telefono.count({ where: { ...where, esbaja: true } });

    const byMando = await Telefono.sequelize.query(
      `SELECT m.mando as name, COUNT(1) as value FROM tb_telefono t LEFT JOIN tb_mando m ON t.id_mando = m.id_mando
        WHERE ($1::timestamp IS NULL OR t."createdAt" >= $1::timestamp)
          AND ($2::timestamp IS NULL OR t."createdAt" <= $2::timestamp)
        GROUP BY m.mando ORDER BY value DESC LIMIT 10`,
      {
        bind: [fecha_desde || null, fecha_hasta || null],
        type: Telefono.sequelize.QueryTypes.SELECT,
      },
    );

    const byClasif = await Telefono.sequelize.query(
      `SELECT c.nombre as name, COUNT(1) as value FROM tb_telefono t LEFT JOIN tb_clasificacion c ON t.id_clasificacion = c.id_clasificacion
        WHERE ($1::timestamp IS NULL OR t."createdAt" >= $1::timestamp)
          AND ($2::timestamp IS NULL OR t."createdAt" <= $2::timestamp)
        GROUP BY c.nombre ORDER BY value DESC LIMIT 10`,
      {
        bind: [fecha_desde || null, fecha_hasta || null],
        type: Telefono.sequelize.QueryTypes.SELECT,
      },
    );

    const byYear = await Telefono.sequelize.query(
      `SELECT to_char(t."createdAt", 'YYYY') as year, COUNT(1) as cantidad FROM tb_telefono t
        WHERE ($1::timestamp IS NULL OR t."createdAt" >= $1::timestamp)
          AND ($2::timestamp IS NULL OR t."createdAt" <= $2::timestamp)
        GROUP BY year ORDER BY year ASC`,
      {
        bind: [fecha_desde || null, fecha_hasta || null],
        type: Telefono.sequelize.QueryTypes.SELECT,
      },
    );

    res.json({
      success: true,
      data: {
        total,
        activos,
        inactivos,
        byMando: byMando || [],
        byClasif: byClasif || [],
        byYear: byYear || [],
      },
    });
  } catch (error) {
    return next(error);
  }
};
