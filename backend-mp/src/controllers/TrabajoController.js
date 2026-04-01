const { Trabajo } = require("../models");
const { addFlowEntry, removeFlowEntry } = require("../utils/quejaFlow");
const { Op } = require("sequelize");
const apiErrors = require("../utils/apiErrors");
const {
  createTrabajoSchema,
  updateTrabajoSchema,
  listTrabajoSchema,
} = require("../validations/trabajo.schemas");
const validate = require("../middleware/validate");

const TrabajoController = {
  /**
   * @desc    Obtener todos los registros (CON validación Zod en query)
   * @route   GET /api/tbTrabajo
   * @access  Public
   */
  getAll: [
    validate(listTrabajoSchema, "query"),
    async (req, res, next) => {
      try {
        const { page, limit, sortBy, sortOrder, search } = req.query;

        const offset = (page - 1) * limit;

        // Construir where clause para búsqueda
        const whereClause = {};
        if (search) {
          // Solo tiene IDs
          if (!isNaN(search)) {
            const searchNum = parseInt(search);
            whereClause[Op.or] = [
              { id_trabajo: searchNum },
              { id_os: searchNum },
              { id_queja: searchNum },
              { id_operario: searchNum },
            ];
          }
        }

        // Validación defensiva para orden
        const ALLOWED_SORT = [
          "fecha",
          "probador",
          "estado",
          "observaciones",
          "id_queja",
          "id_trabajo",
          "createdAt",
          "updatedAt",
        ];

        // Forzar valores seguros (nunca undefined/NaN)
        const sortByRaw = req.query.sortBy;
        const sortByValue =
          typeof sortByRaw === "string" && ALLOWED_SORT.includes(sortByRaw)
            ? sortByRaw
            : "createdAt";

        const sortOrderRaw = req.query.sortOrder;
        const sortOrderValue =
          typeof sortOrderRaw === "string" &&
          ["ASC", "DESC"].includes(sortOrderRaw.toUpperCase())
            ? sortOrderRaw.toUpperCase()
            : "DESC";

        const data = await Trabajo.findAndCountAll({
          where: whereClause,
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [[sortByValue, sortOrderValue]],
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
   * @route   GET /api/tbTrabajo/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Trabajo.findByPk(id);

      if (!data) {
        return next(apiErrors.notFound("Trabajo"));
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
   * @route   POST /api/tbTrabajo
   * @access  Public
   */
  create: [
    validate(createTrabajoSchema, "body"),
    async (req, res, next) => {
      try {
        const data = await Trabajo.create(req.body);

        // actualizar flujo de la queja asociada (estado actúa como id_clave)
        if (data.id_queja) {
          await addFlowEntry(data.id_queja, data.estado, data.fecha);
        }

        res.status(201).json({
          success: true,
          data,
          message: "Trabajo creado exitosamente",
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
   * @route   PUT /api/tbTrabajo/:id
   * @access  Public
   */
  update: [
    validate(updateTrabajoSchema, "body"),
    async (req, res, next) => {
      try {
        const { id } = req.params;

        const existing = await Trabajo.findByPk(id);
        if (!existing) {
          return next(apiErrors.notFound("Trabajo"));
        }

        // valores antiguos para mantener sincronía del flujo
        const oldQueja = existing.id_queja;
        const oldClave = existing.estado;
        const oldFecha = existing.fecha;

        const [affectedRows] = await Trabajo.update(req.body, {
          where: { id_trabajo: id },
        });

        if (affectedRows === 0) {
          return next(apiErrors.notFound("Trabajo"));
        }

        const updatedData = await Trabajo.findByPk(id);

        // si cambió la queja/clave/fecha, ajustar arrays en la queja
        if (
          oldQueja &&
          (oldQueja !== updatedData.id_queja ||
            oldClave !== updatedData.estado ||
            oldFecha !== updatedData.fecha)
        ) {
          await removeFlowEntry(oldQueja, oldClave, oldFecha);
        }
        if (updatedData.id_queja) {
          await addFlowEntry(
            updatedData.id_queja,
            updatedData.estado,
            updatedData.fecha,
          );
        }

        res.json({
          success: true,
          data: updatedData,
          message: "Trabajo actualizado exitosamente",
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
   * @desc    Eliminar registro (CON validación Zod parcial)
   * @route   DELETE /api/tbTrabajo/:id
   * @access  Public
   */
  delete: [
    validate(updateTrabajoSchema, "body"),
    async (req, res, next) => {
      try {
        const { id } = req.params;

        const existing = await Trabajo.findByPk(id);
        if (!existing) {
          return next(apiErrors.notFound("Trabajo"));
        }

        // limpiar flujo asociado antes de eliminar
        await removeFlowEntry(
          existing.id_queja,
          existing.estado,
          existing.fecha,
        );

        const affectedRows = await Trabajo.destroy({
          where: { id_trabajo: id },
        });

        res.json({
          success: true,
          message: "Trabajo eliminado exitosamente",
        });
      } catch (error) {
        return next(error);
      }
    },
  ],
};

module.exports = TrabajoController;
