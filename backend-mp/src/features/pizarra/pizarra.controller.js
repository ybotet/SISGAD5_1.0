const { Pizarra } = require("../../features");
const { Op } = require("sequelize");
const apiErrors = require("../../shared/utils/apiErrors");
const { parseListParams } = require("../../shared/utils/parseListParams");
const {
  createPizarraSchema,
  updatePizarraSchema,
  listPizarraSchema,
} = require("./pizarra.validation");
const validate = require("../../shared/middleware/validate");
const { logAuditoria, getClientIp } = require("../../shared/services/auditService");

const PizarraController = {
  /**
   * @swagger
   * tags:
   *   name: Pizarras
   *   description: Gestión de pizarras
   */

  /**
   * @swagger
   * /tbPizarra:
   *   get:
   *     summary: Listar pizarras con paginación
   *     tags: [Pizarras]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema: { type: integer, default: 1 }
   *       - in: query
   *         name: limit
   *         schema: { type: integer, default: 10 }
   *     responses:
   *       200:
   *         description: Lista de pizarras
   */
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
      const t = await Pizarra.sequelize.transaction();
      try {
        const pizarra = await Pizarra.create(req.body, { transaction: t });

        // Audit log
        await logAuditoria({
          entidad: "Pizarra",
          id_entidad: pizarra.id_pizarra,
          accion: "CREATE",
          usuario_id: req.userId,
          detalle: { nombre: pizarra.nombre, id_tipopizarra: pizarra.id_tipopizarra },
          ip: getClientIp(req),
          transaction: t,
        });

        await t.commit();

        res.status(201).json({
          success: true,
          data: pizarra,
          message: "Pizarra creado exitosamente",
        });
      } catch (error) {
        await t.rollback();
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
      const t = await Pizarra.sequelize.transaction();
      try {
        const { id } = req.params;

        const [affectedRows, updatedRows] = await Pizarra.update(req.body, {
          where: { id_pizarra: id },
          returning: true,
          transaction: t,
        });

        if (affectedRows === 0) {
          await t.rollback();
          return next(apiErrors.notFound("Pizarra"));
        }

        const updatedData = updatedRows[0];

        // Audit log
        await logAuditoria({
          entidad: "Pizarra",
          id_entidad: parseInt(id),
          accion: "UPDATE",
          usuario_id: req.userId,
          detalle: { cambios: Object.keys(req.body) },
          ip: getClientIp(req),
          transaction: t,
        });

        await t.commit();

        res.json({
          success: true,
          data: updatedData,
          message: "Pizarra actualizado exitosamente",
        });
      } catch (error) {
        await t.rollback();
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
    const t = await Pizarra.sequelize.transaction();
    try {
      const { id } = req.params;

      const existing = await Pizarra.findByPk(id, { transaction: t });
      if (!existing) {
        await t.rollback();
        return next(apiErrors.notFound("Pizarra"));
      }

      const nombre = existing.nombre;

      await Pizarra.destroy({
        where: { id_pizarra: id },
        transaction: t,
      });

      // Audit log
      await logAuditoria({
        entidad: "Pizarra",
        id_entidad: parseInt(id),
        accion: "DELETE",
        usuario_id: req.userId,
        detalle: { nombre },
        ip: getClientIp(req),
        transaction: t,
      });

      await t.commit();

      res.json({
        success: true,
        message: "Pizarra eliminado exitosamente",
      });
    } catch (error) {
      await t.rollback();
      return next(error);
    }
  },
};

module.exports = PizarraController;

