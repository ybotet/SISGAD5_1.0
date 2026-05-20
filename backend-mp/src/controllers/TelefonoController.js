const { Telefono } = require("../models");
const { Op, Sequelize } = require("sequelize");
const { Recorrido, Queja, Cable, Planta } = require("../models");
const apiErrors = require("../utils/apiErrors");
const { parseListParams } = require("../utils/parseListParams");
const {
  createTelefonoSchema,
  updateTelefonoSchema,
  listTelefonoSchema,
} = require("../validations/telefono.schemas");
const validate = require("../middleware/validate");
const { normalizeDateRange } = require("../utils/dateUtils");

const TelefonoController = {
  /**
   * @swagger
   * tags:
   *   name: Telefonos
   *   description: Gestión de teléfonos
   */

  /**
   * @swagger
   * /tbTelefono:
   *   get:
   *     summary: Listar teléfonos con paginación
   *     tags: [Telefonos]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema: { type: integer, default: 1 }
   *       - in: query
   *         name: limit
   *         schema: { type: integer, default: 10 }
   *       - in: query
   *         name: search
   *         schema: { type: string }
   *     responses:
   *       200:
   *         description: Lista de teléfonos
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean }
   *                 data: { type: array, items: { type: object } }
   */
  /**
   * @desc    Obtener todos los registros (CON validación Zod en query)
   * @route   GET /api/tbTelefono
   * @access  Public
   */

  // TelefonoController.js - getAll corregido
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
          columnMapping: {
            createdAt: "created_at",
            updatedAt: "updated_at",
          },
        });

        // ✅ Mapear sortBy al nombre de la columna en la BD
        const columnMapping = {
          createdAt: "created_at",
          updatedAt: "updated_at",
        };

        const sortColumn = columnMapping[sortBy] || sortBy;

        console.log("📝 Original sortBy:", sortBy);
        console.log("📝 Mapeado a columna:", sortColumn);

        // Construir where clause para búsqueda
        const whereClause = {};
        if (search) {
          whereClause[Op.or] = [{ telefono: { [Op.iLike]: `%${search}%` } }];
        }

        // TelefonoController.js - getAll (después de obtener los datos)
        const data = await Telefono.findAndCountAll({
          where: whereClause,
          include: [
            { association: "tb_clasificacion", attributes: ["id_clasificacion", "nombre"] },
            { association: "tb_mando", attributes: ["id_mando", "mando"] },
          ],
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [[sortColumn, sortOrder]],
          distinct: true,
        });

        // ✅ Normalizar los timestamps en cada fila
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
            page: page,
            limit: limit,
            total: data.count,
            pages: Math.ceil(data.count / limit),
          },
        });
      } catch (error) {
        console.error(" Error en getAll:", error);
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

      // ✅ Normalizar la respuesta: convertir created_at → createdAt
      const telefonoNormalizado = telefono.toJSON();
      telefonoNormalizado.createdAt = telefonoNormalizado.created_at;
      telefonoNormalizado.updatedAt = telefonoNormalizado.updated_at;
      delete telefonoNormalizado.created_at;
      delete telefonoNormalizado.updated_at;

      const recorridosNormalizados = recorridos.map((r) => {
        const json = r.toJSON();
        json.createdAt = json.created_at;
        json.updatedAt = json.updated_at;
        delete json.created_at;
        delete json.updated_at;
        return json;
      });

      const quejasNormalizadas = quejas.map((q) => {
        const json = q.toJSON();
        json.createdAt = json.created_at;
        json.updatedAt = json.updated_at;
        delete json.created_at;
        delete json.updated_at;
        return json;
      });

      res.json({
        success: true,
        data: {
          telefono: telefonoNormalizado,
          recorridos: recorridosNormalizados,
          quejas: quejasNormalizadas,
        },
      });
    } catch (error) {
      console.error(" Error en getById:", error);
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
    const normalizedRange = normalizeDateRange({ from: fecha_desde, to: fecha_hasta });
    const where = {};

    if (normalizedRange.from || normalizedRange.to) {
      const and = [];
      if (normalizedRange.from) {
        and.push(
          Sequelize.where(Sequelize.cast(Sequelize.col("created_at"), "timestamp"), {
            [Op.gte]: normalizedRange.from,
          }),
        );
      }
      if (normalizedRange.to) {
        and.push(
          Sequelize.where(Sequelize.cast(Sequelize.col("created_at"), "timestamp"), {
            [Op.lte]: normalizedRange.to,
          }),
        );
      }
      where[Op.and] = and;
    }

    const total = await Telefono.count({ where });
    const activos = await Telefono.count({
      where: { [Op.and]: [...(where[Op.and] || []), { esbaja: false }] },
    });
    const inactivos = await Telefono.count({
      where: { [Op.and]: [...(where[Op.and] || []), { esbaja: true }] },
    });

    const byMando = await Telefono.sequelize.query(
      `SELECT m.mando as name, COUNT(1) as value FROM tb_telefono t LEFT JOIN tb_mando m ON t.id_mando = m.id_mando
        WHERE t."created_at" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
          AND ($1::timestamp IS NULL OR t."created_at"::timestamp >= $1::timestamp)
          AND ($2::timestamp IS NULL OR t."created_at"::timestamp <= $2::timestamp)
        GROUP BY m.mando ORDER BY value DESC LIMIT 10`,
      {
        bind: [normalizedRange.from || null, normalizedRange.to || null],
        type: Telefono.sequelize.QueryTypes.SELECT,
      },
    );

    const byClasif = await Telefono.sequelize.query(
      `SELECT c.nombre as name, COUNT(1) as value FROM tb_telefono t LEFT JOIN tb_clasificacion c ON t.id_clasificacion = c.id_clasificacion
        WHERE t."created_at" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
          AND ($1::timestamp IS NULL OR t."created_at"::timestamp >= $1::timestamp)
          AND ($2::timestamp IS NULL OR t."created_at"::timestamp <= $2::timestamp)
        GROUP BY c.nombre ORDER BY value DESC LIMIT 10`,
      {
        bind: [normalizedRange.from || null, normalizedRange.to || null],
        type: Telefono.sequelize.QueryTypes.SELECT,
      },
    );

    const byYear = await Telefono.sequelize.query(
      `SELECT to_char(t."created_at"::timestamp, 'YYYY') as year, COUNT(1) as cantidad FROM tb_telefono t
        WHERE t."created_at" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
          AND ($1::timestamp IS NULL OR t."created_at"::timestamp >= $1::timestamp)
          AND ($2::timestamp IS NULL OR t."created_at"::timestamp <= $2::timestamp)
        GROUP BY year ORDER BY year ASC`,
      {
        bind: [normalizedRange.from || null, normalizedRange.to || null],
        type: Telefono.sequelize.QueryTypes.SELECT,
      },
    );

    //telefonos con mas quejas en el periodo
    const byMasQuejas = await Telefono.sequelize.query(
      `SELECT t.telefono, COUNT(q.id_queja) as cantidad FROM tb_telefono t
        LEFT JOIN tb_queja q ON t.id_telefono = q.id_telefono
        WHERE t."created_at" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
          AND ($1::timestamp IS NULL OR t."created_at"::timestamp >= $1::timestamp)
          AND ($2::timestamp IS NULL OR t."created_at"::timestamp <= $2::timestamp)
        GROUP BY t.telefono ORDER BY cantidad DESC LIMIT 10`,
      {
        bind: [normalizedRange.from || null, normalizedRange.to || null],
        type: Telefono.sequelize.QueryTypes.SELECT,
      },
    );

    // Distribución por extensiones (inventario total)
    const byExtensiones = await Telefono.sequelize.query(
      `SELECT COALESCE(t.extensiones::text, 'Sin extensión') as name, COUNT(1) as value FROM tb_telefono t
        GROUP BY name ORDER BY value DESC LIMIT 20`,
      {
        type: Telefono.sequelize.QueryTypes.SELECT,
      },
    );

    // Conteo de teléfonos que tienen al menos una queja en algunos estados
    const quejaStates = await Telefono.sequelize.query(
      `SELECT q.estado, COUNT(DISTINCT t.id_telefono) as cnt FROM tb_telefono t
        JOIN tb_queja q ON t.id_telefono = q.id_telefono
        WHERE q.estado IN ('Pendiente','Asignada','Probada','Resuelta')
        GROUP BY q.estado`,
      {
        type: Telefono.sequelize.QueryTypes.SELECT,
      },
    );

    // Tendencias por mes y por trimestre (basadas en created_at si es válida)
    const byMonth = await Telefono.sequelize.query(
      `SELECT to_char(t."created_at"::timestamp, 'MM') as month, COUNT(1) as cantidad FROM tb_telefono t
        WHERE t."created_at" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
          AND date_part('year', t."created_at"::timestamp) = date_part('year', now())
        GROUP BY month ORDER BY month ASC`,
      { type: Telefono.sequelize.QueryTypes.SELECT },
    );

    const byQuarter = await Telefono.sequelize.query(
      `SELECT date_part('quarter', t."created_at"::timestamp) as quarter, COUNT(1) as cantidad FROM tb_telefono t
        WHERE t."created_at" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
        GROUP BY quarter ORDER BY quarter ASC`,
      { type: Telefono.sequelize.QueryTypes.SELECT },
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
        byMasQuejas: byMasQuejas || [],
        byExtensiones: byExtensiones || [],
        quejasPendientes:
          (quejaStates.find((s) => s.estado === "Pendiente") || { cnt: 0 }).cnt || 0,
        quejasAsignadas: (quejaStates.find((s) => s.estado === "Asignada") || { cnt: 0 }).cnt || 0,
        quejasProbadas: (quejaStates.find((s) => s.estado === "Probada") || { cnt: 0 }).cnt || 0,
        quejasResueltas: (quejaStates.find((s) => s.estado === "Resuelta") || { cnt: 0 }).cnt || 0,
        byMonth: byMonth || [],
        byQuarter: byQuarter || [],
      },
    });
  } catch (error) {
    return next(error);
  }
};
