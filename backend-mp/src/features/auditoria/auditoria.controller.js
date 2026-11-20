const { sequelize } = require("../../shared/config/database");
const apiErrors = require("../../shared/utils/apiErrors");
const { parseListParams } = require("../../shared/utils/parseListParams");

const AuditoriaController = {
  /**
   * @swagger
   * /auditoria:
   *   get:
   *     summary: Listar auditoría (admin) con filtros y paginación
   *     tags: [Auditoría]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema: { type: integer, default: 1 }
   *       - in: query
   *         name: limit
   *         schema: { type: integer, default: 20 }
   *       - in: query
   *         name: sortBy
   *         schema: { type: string, enum: [created_at, entidad, accion, usuario_id], default: created_at }
   *       - in: query
   *         name: sortOrder
   *         schema: { type: string, enum: [ASC, DESC], default: DESC }
   *       - in: query
   *         name: entidad
   *         schema: { type: string }
   *         description: Filtrar por entidad (Queja, Trabajo, Linea, Pizarra)
   *       - in: query
   *         name: usuario_id
   *         schema: { type: integer }
   *         description: Filtrar por ID de usuario
   *       - in: query
   *         name: accion
   *         schema: { type: string, enum: [CREATE, UPDATE, DELETE, ESTADO, CERRAR, ASIGNAR] }
   *       - in: query
   *         name: fecha_desde
   *         schema: { type: string, format: date-time }
   *       - in: query
   *         name: fecha_hasta
   *         schema: { type: string, format: date-time }
   *     responses:
   *       200:
   *         description: Lista paginada de auditoría
   *       403:
   *         description: Permiso denegado
   */
  getAll: [
    async (req, res, next) => {
      try {
        const {
          page = 1,
          limit = 20,
          sortBy = "created_at",
          sortOrder = "DESC",
          entidad,
          usuario_id,
          accion,
          fecha_desde,
          fecha_hasta,
        } = req.query;

        const offset = (page - 1) * limit;

        // Validar sortBy contra lista blanca (evita inyección en ORDER BY)
        const allowedSort = ["created_at", "entidad", "accion", "usuario_id"];
        const sortByValue = allowedSort.includes(sortBy) ? sortBy : "created_at";
        const sortOrderValue = ["ASC", "DESC"].includes(sortOrder.toUpperCase())
          ? sortOrder.toUpperCase()
          : "DESC";

        // Construir cláusulas WHERE con placeholders parametrizados (sin interpolación de strings)
        const whereClauses = [];
        const replacements = [];
        let paramIndex = 1;

        if (entidad) {
          whereClauses.push(`entidad = $${paramIndex++}`);
          replacements.push(entidad);
        }
        if (usuario_id) {
          whereClauses.push(`usuario_id = $${paramIndex++}`);
          replacements.push(parseInt(usuario_id));
        }
        if (accion) {
          whereClauses.push(`accion = $${paramIndex++}`);
          replacements.push(accion);
        }
        if (fecha_desde) {
          whereClauses.push(`created_at >= $${paramIndex++}`);
          replacements.push(new Date(fecha_desde));
        }
        if (fecha_hasta) {
          whereClauses.push(`created_at <= $${paramIndex++}`);
          replacements.push(new Date(fecha_hasta));
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

        const query = `
          SELECT id_auditoria, entidad, id_entidad, accion, desde_estado, hacia_estado,
                 usuario_id, detalle, ip, created_at
          FROM tb_auditoria
          ${whereSql}
          ORDER BY ${sortByValue} ${sortOrderValue}
          LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `;
        replacements.push(parseInt(limit), parseInt(offset));

        const countQuery = `
          SELECT COUNT(*) as total
          FROM tb_auditoria
          ${whereSql}
        `;

        const [rows, countResult] = await Promise.all([
          sequelize.query(query, { replacements, type: sequelize.QueryTypes.SELECT }),
          sequelize.query(countQuery, { replacements, type: sequelize.QueryTypes.SELECT }),
        ]);

        const total = parseInt(countResult[0]?.total || "0");

        res.json({
          success: true,
          data: rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        });
      } catch (error) {
        next(error);
      }
    },
  ],

  /**
   * @swagger
   * /quejas/{id}/historial:
   *   get:
   *     summary: Historial de cambios de una queja (auditoría filtrada por entidad Queja)
   *     tags: [Quejas, Auditoría]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *       - in: query
   *         name: page
   *         schema: { type: integer, default: 1 }
   *       - in: query
   *         name: limit
   *         schema: { type: integer, default: 20 }
   *     responses:
   *       200:
   *         description: Historial ordenado cronológicamente
   *       404:
   *         description: Queja no encontrada
   */
  getHistorialQueja: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const query = `
        SELECT id_auditoria, entidad, id_entidad, accion, desde_estado, hacia_estado,
               usuario_id, detalle, ip, created_at
        FROM tb_auditoria
        WHERE entidad = 'Queja' AND id_entidad = $1
        ORDER BY created_at ASC
        LIMIT $2 OFFSET $3
      `;

      const countQuery = `
        SELECT COUNT(*) as total
        FROM tb_auditoria
        WHERE entidad = 'Queja' AND id_entidad = $1
      `;

      const [rows, countResult] = await Promise.all([
        sequelize.query(query, {
          bind: [parseInt(id), parseInt(limit), parseInt(offset)],
          type: sequelize.QueryTypes.SELECT,
        }),
        sequelize.query(countQuery, {
          bind: [parseInt(id)],
          type: sequelize.QueryTypes.SELECT,
        }),
      ]);

      const total = parseInt(countResult[0]?.total || "0");

      res.json({
        success: true,
        data: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = AuditoriaController;