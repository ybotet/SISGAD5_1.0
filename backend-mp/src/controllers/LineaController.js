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
const { normalizeDateRange } = require("../utils/dateUtils");

// Helper para normalizar timestamps en respuesta
const normalizeTimestamps = (data) => {
  if (!data) return data;
  if (Array.isArray(data)) {
    return data.map((item) => normalizeTimestamps(item));
  }
  if (typeof data === "object" && data !== null) {
    const result = { ...data };
    if (result.created_at !== undefined) {
      result.createdAt = result.created_at;
      delete result.created_at;
    }
    if (result.updated_at !== undefined) {
      result.updatedAt = result.updated_at;
      delete result.updated_at;
    }
    return result;
  }
  return data;
};

const LineaController = {
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
          // ✅ Mapeo de camelCase a snake_case para la BD
          columnMapping: {
            createdAt: "created_at",
            updatedAt: "updated_at",
          },
        });

        // ✅ Ya no necesitas mapear manualmente, parseListParams lo hace por ti

        console.log("📊 sortBy (ya mapeado):", sortBy);
        console.log("📊 sortOrder:", sortOrder);

        // Construir where clause
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
            { association: "tb_tipolinea", attributes: ["id_tipolinea", "tipo"] },
            { association: "tb_propietario", attributes: ["id_propietario", "nombre"] },
            { association: "tb_senalizacion", attributes: ["id_senalizacion", "senalizacion"] },
          ],
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [[sortBy, sortOrder]], // ✅ sortBy ya es 'created_at' o 'updated_at'
          distinct: true,
        });

        // Normalizar timestamps (solo lo necesario, sin circular references)
        const rowsNormalizados = data.rows.map((row) => {
          const json = row.toJSON();
          if (json.created_at !== undefined) {
            json.createdAt = json.created_at;
            delete json.created_at;
          }
          if (json.updated_at !== undefined) {
            json.updatedAt = json.updated_at;
            delete json.updated_at;
          }
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
        console.error(" Error en getAll Linea:", error);
        return next(error);
      }
    },
  ],

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const linea = await Linea.findByPk(id, {
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
      });

      if (!linea) {
        return next(apiErrors.notFound("Linea"));
      }

      const recorridos = await Recorrido.findAll({
        where: { id_linea: id }, // ✅ Corregido: usar id_linea, no id_telefono
        include: [
          { association: "tb_cable", attributes: ["id_cable", "numero"] },
          { association: "tb_planta", attributes: ["id_planta", "planta"] },
          { association: "tb_sistema", attributes: ["id_sistema", "sistema"] },
          { association: "tb_propietario", attributes: ["id_propietario", "nombre"] },
        ],
        limit: 100,
      });

      const quejas = await Queja.findAll({
        where: { id_linea: id },
        include: [
          { association: "tb_trabajador", attributes: ["id_trabajador", "clave_trabajador"] },
        ],
        limit: 100,
      });

      // ✅ Normalizar timestamps en toda la respuesta
      const lineaNormalizada = normalizeTimestamps(linea.toJSON());
      const recorridosNormalizados = normalizeTimestamps(recorridos);
      const quejasNormalizadas = normalizeTimestamps(quejas);

      res.json({
        success: true,
        data: {
          linea: lineaNormalizada,
          recorridos: recorridosNormalizados,
          quejas: quejasNormalizadas,
        },
      });
    } catch (error) {
      console.error(" Error en getById Linea:", error);
      return next(error);
    }
  },

  create: [
    validate(createLineaSchema, "body"),
    async (req, res, next) => {
      try {
        // ✅ Filtrar campos de timestamps
        const { createdAt, updatedAt, ...cleanData } = req.body;

        console.log("📝 Creando línea con datos:", cleanData);

        const data = await Linea.create(cleanData);

        // ✅ Normalizar respuesta
        const dataNormalizada = normalizeTimestamps(data.toJSON());

        res.status(201).json({
          success: true,
          data: dataNormalizada,
          message: "Línea creada exitosamente",
        });
      } catch (error) {
        console.error(" Error creando línea:", error);
        if (error.name === "SequelizeValidationError") {
          const mensajes = error.errors.map((err) => err.message).join(". ");
          return next(apiErrors.badRequest(mensajes));
        }
        if (error.name === "SequelizeUniqueConstraintError") {
          return next(apiErrors.conflict("La clave de línea ya existe"));
        }
        return next(error);
      }
    },
  ],

  update: [
    validate(updateLineaSchema, "body"),
    async (req, res, next) => {
      try {
        const { id } = req.params;

        // ✅ Filtrar campos de timestamps
        const { createdAt, updatedAt, ...cleanData } = req.body;

        const [affectedRows] = await Linea.update(cleanData, {
          where: { id_linea: id },
        });

        if (affectedRows === 0) {
          return next(apiErrors.notFound("Linea"));
        }

        const updatedData = await Linea.findByPk(id);

        // ✅ Normalizar respuesta
        const dataNormalizada = normalizeTimestamps(updatedData.toJSON());

        res.json({
          success: true,
          data: dataNormalizada,
          message: "Línea actualizada exitosamente",
        });
      } catch (error) {
        console.error(" Error actualizando línea:", error);
        if (error.name === "SequelizeValidationError") {
          const mensajes = error.errors.map((err) => err.message).join(". ");
          return next(apiErrors.badRequest(mensajes));
        }
        return next(error);
      }
    },
  ],

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
        message: "Línea eliminada exitosamente",
      });
    } catch (error) {
      console.error(" Error eliminando línea:", error);
      return next(error);
    }
  },
};

// Dashboard stats for frontend
LineaController.dashboard = async function (req, res, next) {
  try {
    const { fecha_desde, fecha_hasta } = req.query;
    const normalizedRange = normalizeDateRange({ from: fecha_desde, to: fecha_hasta });
    const where = {};
    if (normalizedRange.from || normalizedRange.to) {
      where.created_at = {}; // ✅ Usar created_at (nombre en BD)
      if (normalizedRange.from) where.created_at[Op.gte] = normalizedRange.from;
      if (normalizedRange.to) where.created_at[Op.lte] = normalizedRange.to;
    }

    const total = await Linea.count({ where });
    const activas = await Linea.count({ where: { ...where, esbaja: false } });
    const inactivas = await Linea.count({ where: { ...where, esbaja: true } });

    // ✅ Usar created_at en las consultas SQL
    const byProp = await Linea.sequelize.query(
      `SELECT p.nombre as name, COUNT(1) as value FROM tb_linea l 
       LEFT JOIN tb_propietario p ON l.id_propietario = p.id_propietario
       WHERE ($1::timestamp IS NULL OR l."created_at" >= $1::timestamp)
         AND ($2::timestamp IS NULL OR l."created_at" <= $2::timestamp)
       GROUP BY p.nombre ORDER BY value DESC LIMIT 10`,
      {
        bind: [normalizedRange.from || null, normalizedRange.to || null],
        type: Linea.sequelize.QueryTypes.SELECT,
      },
    );

    const bySenal = await Linea.sequelize.query(
      `SELECT s.senalizacion as name, COUNT(1) as value FROM tb_linea l 
       LEFT JOIN tb_senalizacion s ON l.id_senalizacion = s.id_senalizacion
       WHERE ($1::timestamp IS NULL OR l."created_at" >= $1::timestamp)
         AND ($2::timestamp IS NULL OR l."created_at" <= $2::timestamp)
       GROUP BY s.senalizacion ORDER BY value DESC LIMIT 10`,
      {
        bind: [normalizedRange.from || null, normalizedRange.to || null],
        type: Linea.sequelize.QueryTypes.SELECT,
      },
    );

    const byYear = await Linea.sequelize.query(
      `SELECT to_char(l."created_at", 'YYYY') as year, COUNT(1) as cantidad 
       FROM tb_linea l
       WHERE ($1::timestamp IS NULL OR l."created_at" >= $1::timestamp)
         AND ($2::timestamp IS NULL OR l."created_at" <= $2::timestamp)
       GROUP BY year ORDER BY year ASC`,
      {
        bind: [normalizedRange.from || null, normalizedRange.to || null],
        type: Linea.sequelize.QueryTypes.SELECT,
      },
    );

    const topLineasQuejas = await Linea.sequelize.query(
      `SELECT COALESCE(l.clavelinea, CONCAT('Línea ', l.id_linea)) as name, COUNT(q.id_queja) as value
       FROM tb_linea l 
       LEFT JOIN tb_queja q ON q.id_linea = l.id_linea
       WHERE ($1::timestamp IS NULL OR q."created_at" >= $1::timestamp)
         AND ($2::timestamp IS NULL OR q."created_at" <= $2::timestamp)
       GROUP BY name ORDER BY value DESC LIMIT 10`,
      {
        bind: [normalizedRange.from || null, normalizedRange.to || null],
        type: Linea.sequelize.QueryTypes.SELECT,
      },
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
    console.error(" Error en dashboard Linea:", error);
    return next(error);
  }
};

module.exports = LineaController;
