const { Sequelize } = require("sequelize");
const {
  Trabajo,
  TrabajoTrabajadores,
  Queja,
  Trabajador,
  sequelize,
} = require("../../features");
const { parseListParams } = require("../../shared/utils/parseListParams");
const apiErrors = require("../../shared/utils/apiErrors");

const { fn, col, literal } = Sequelize;

/**
 * Controlador de ESTADÍSTICAS de trabajos (TASK-710-08 — variantes B y E).
 *
 * Decisiones de diseño acordadas:
 *  - No existe trabajo sin queja (id_queja obligatorio a nivel de estadísticas).
 *  - El CRUD contextual de trabajos vive dentro de "Ver quejas"; aquí solo se
 *    exponen lecturas agregadas para la vista global (B) y la ficha individual (E).
 *  - Las duraciones se calculan como diferencia horaria entre created_at y
 *    updated_at del trabajo (aproximación mientras no exista columna de horas).
 */

const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/;

const DURACION_SQL = `EXTRACT(EPOCH FROM (COALESCE(updated_at, NOW()) - created_at)) / 3600.0`;

const TrabajoEstadisticasController = {
  /**
   * @desc    Estadísticas de trabajos agrupadas por trabajador (vista B: filtro por operario)
   * @route   GET /api/trabajo/estadisticas/trabajadores?page=&limit=&sortBy=&sortOrder=
   * @access  Auth
   */
  async porTrabajador(req, res, next) {
    try {
      const { page, limit, offset, sortBy, sortOrder } = parseListParams(req.query, {
        allowedSortFields: [
          "id_trabajador",
          "clave_trabajador",
          "nombre",
          "total_trabajos",
          "horas_totales",
          "primera_fecha",
          "ultima_fecha",
        ],
        defaultSort: "total_trabajos",
        defaultOrder: "DESC",
        maxLimit: 100,
      });

      const sortable = {
        id_trabajador: "tt.id_trabajador",
        clave_trabajador: "tt.clave_trabajador",
        nombre: "tt.nombre",
        total_trabajos: "total_trabajos",
        horas_totales: "horas_totales",
        primera_fecha: "primera_fecha",
        ultima_fecha: "ultima_fecha",
      };

      // 1) Totales globales (sin paginar): nº de trabajadores con trabajos asignados
      // Nota: col() debe referenciar la tabla para que Sequelize genere el alias
      // correcto ("TbTrabajoTrabajadores"."id_trabajador"); sin él emitía
      // "TrabajoTrabajadores"."id_trabajador" → error 42P01/42703.
      const totalRow = await TrabajoTrabajadores.findOne({
        attributes: [
          [fn("COUNT", fn("DISTINCT", col("TbTrabajoTrabajadores.id_trabajador"))), "count"],
        ],
        raw: true,
      });
      const totalTrabajadores = Number(totalRow?.count ?? 0);

      // 2) Filas agrupadas por trabajador (raw query para evitar problemas de Sequelize con includes complejos)
      const rows = await sequelize.query(`
        SELECT
          tt.id_trabajador,
          tt.clave_trabajador,
          tt.nombre,
          COUNT(t.id_trabajo) AS total_trabajos,
          ROUND(SUM(EXTRACT(EPOCH FROM (COALESCE(t.updated_at, NOW()) - t.created_at)) / 3600.0)::numeric, 2) AS horas_totales,
          MIN(t.fecha) AS primera_fecha,
          MAX(t.fecha) AS ultima_fecha
        FROM tb_trabajo t
        INNER JOIN tb_trabajo_trabajadores ttt ON t.id_trabajo = ttt.id_trabajo
        INNER JOIN tb_trabajador tt ON ttt.id_trabajador = tt.id_trabajador
        GROUP BY tt.id_trabajador, tt.clave_trabajador, tt.nombre
        ORDER BY ${sortable[sortBy] || "total_trabajos"} ${sortOrder}
        LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
      `, {
        type: sequelize.QueryTypes.SELECT,
      });

      res.json({
        success: true,
        data: rows.map((r) => ({
          id_trabajador: r.id_trabajador,
          clave_trabajador: r.clave_trabajador,
          nombre: r.nombre,
          total_trabajos: Number(r.total_trabajos),
          horas_totales: Number(r.horas_totales ?? 0),
          primera_fecha: r.primera_fecha,
          ultima_fecha: r.ultima_fecha,
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: Number(totalTrabajadores ?? 0),
          pages: Math.ceil(Number(totalTrabajadores ?? 0) / parseInt(limit)),
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * @desc    Estadísticas de los trabajos de una queja concreta (vista B/E)
   * @route   GET /api/trabajo/estadisticas/queja/:id_queja
   * @access  Auth
   */
  async porQueja(req, res, next) {
    try {
      const idQueja = parseInt(req.params.id_queja, 10);
      if (!Number.isInteger(idQueja) || idQueja <= 0) {
        return next(apiErrors.badRequest("ERROR.TRABAJO.ID_QUEJA.INVALID"));
      }

      const queja = await Queja.findByPk(idQueja, {
        attributes: ["id_queja", "num_reporte", "estado"],
      });
      if (!queja) {
        return next(apiErrors.notFound("Queja"));
      }

      const duracion = literal(DURACION_SQL);

      const [trabajos, totales] = await Promise.all([
        Trabajo.findAll({
          where: { id_queja: idQueja },
          attributes: [
            "id_trabajo",
            "fecha",
            "estado",
            "observaciones",
            "created_at",
            "updated_at",
            [duracion, "horas"],
          ],
          include: [
            {
              association: "tb_trabajo_trabajadores",
              include: [
                {
                  model: Trabajador,
                  as: "tb_trabajador",
                  attributes: ["id_trabajador", "clave_trabajador", "nombre"],
                },
              ],
              required: false,
            },
          ],
          order: [["fecha", "ASC"]],
        }),
        Trabajo.findOne({
          where: { id_queja: idQueja },
          attributes: [
            [fn("COUNT", col("TbTrabajo.id_trabajo")), "total_trabajos"],
            [fn("ROUND", fn("SUM", duracion), 2), "horas_totales"],
            [fn("MIN", col("TbTrabajo.fecha")), "primera_fecha"],
            [fn("MAX", col("TbTrabajo.fecha")), "ultima_fecha"],
          ],
          raw: true,
        }),
      ]);

      const listaTrabajos = trabajos.map((t) => {
        const obj = t.toJSON();
        return {
          id_trabajo: obj.id_trabajo,
          fecha: obj.fecha,
          estado: obj.estado,
          observaciones: obj.observaciones,
          horas: Number(obj.horas ?? 0),
          trabajadores: (obj.tb_trabajo_trabajadores || [])
            .map((tt) => tt.tb_trabajador)
            .filter(Boolean),
        };
      });

      // Desglose por trabajador dentro de esta queja
      const porTrabajadorMap = new Map();
      for (const t of listaTrabajos) {
        for (const trab of t.trabajadores) {
          const key = trab.id_trabajador;
          if (!porTrabajadorMap.has(key)) {
            porTrabajadorMap.set(key, {
              id_trabajador: trab.id_trabajador,
              clave_trabajador: trab.clave_trabajador,
              nombre: trab.nombre,
              total_trabajos: 0,
              horas_totales: 0,
            });
          }
          const entry = porTrabajadorMap.get(key);
          entry.total_trabajos += 1;
          entry.horas_totales += t.horas;
        }
      }

      res.json({
        success: true,
        data: {
          queja: queja.toJSON(),
          resumen: {
            total_trabajos: Number(totales?.total_trabajos ?? 0),
            horas_totales: Number(totales?.horas_totales ?? 0),
            primera_fecha: totales?.primera_fecha ?? null,
            ultima_fecha: totales?.ultima_fecha ?? null,
          },
          trabajos: listaTrabajos,
          por_trabajador: Array.from(porTrabajadorMap.values()).map((e) => ({
            ...e,
            horas_totales: Math.round(e.horas_totales * 100) / 100,
          })),
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * @desc    Ficha estadística individual de un trabajo (vista E: detalle + materiales)
   * @route   GET /api/trabajo/:id/estadisticas
   * @access  Auth
   */
  async trabajoDetalle(req, res, next) {
    try {
      const idTrabajo = parseInt(req.params.id, 10);
      if (!Number.isInteger(idTrabajo) || idTrabajo <= 0) {
        return next(apiErrors.badRequest("ERROR.TRABAJO.ID_INVALID"));
      }

      const duracion = literal(DURACION_SQL);

      const trabajo = await Trabajo.findByPk(idTrabajo, {
        attributes: [
          "id_trabajo",
          "fecha",
          "probador",
          "estado",
          "observaciones",
          "id_queja",
          "created_at",
          "updated_at",
          [duracion, "horas"],
        ],
        include: [
          {
            association: "tb_trabajo_trabajadores",
            include: [
              {
                model: Trabajador,
                as: "tb_trabajador",
                attributes: ["id_trabajador", "clave_trabajador", "nombre"],
              },
            ],
            required: false,
          },
          {
            association: "tb_clave",
            attributes: ["id_clave", "clave"],
          },
          {
            association: "tb_queja",
            attributes: ["id_queja", "num_reporte", "estado"],
          },
          {
            // probador (Trabajador que realizó el trabajo) — reutiliza alias de la N:M
            association: "tb_trabajador",
            attributes: ["id_trabajador", "clave_trabajador", "nombre"],
          },
        ],
      });

      if (!trabajo) {
        return next(apiErrors.notFound("Trabajo"));
      }

      const obj = trabajo.toJSON();

      // Desglose de horas por trabajador (aproximación: reparto equitativo
      // entre los trabajadores asignados al trabajo)
      const trabajadoresArr = (obj.tb_trabajo_trabajadores || [])
        .map((tt) => tt.tb_trabajador)
        .filter(Boolean);
      const horasTotales = Number(obj.horas ?? 0);
      const horasPorTrabajador =
        trabajadoresArr.length > 0
          ? Math.round((horasTotales / trabajadoresArr.length) * 100) / 100
          : 0;

      res.json({
        success: true,
        data: {
          id_trabajo: obj.id_trabajo,
          fecha: obj.fecha,
          estado: obj.estado,
          estado_clave: obj.tb_clave?.clave ?? null,
          observaciones: obj.observaciones,
          horas: horasTotales,
          probador: obj.tb_trabajador ?? null,
          queja: obj.tb_queja ?? null,
          trabajadores: trabajadoresArr.map((t) => ({
            ...t,
            horas_asignadas: horasPorTrabajador,
          })),
          // Los materiales/consumos asociados viven en backend-materiales (Go).
          // El frontend los carga vía consumoService.getConsumosPorTrabajo(id).
          consumos_url: `/materiales/consumos/trabajo/${idTrabajo}`,
        },
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = TrabajoEstadisticasController;
