const apiError = require("../../shared/utils/apiErrors");
const {
  Asignacion,
  AsignacionTrabajadores,
  Queja,
  Trabajo,
  TrabajoTrabajadores,
} = require("../../features");
const { parseListParams } = require("../../shared/utils/parseListParams");
const {
  createAsignacionSchema,
  listAsignacionSchema,
} = require("./asignacion.validation");
const validate = require("../../shared/middleware/validate");
const { normalizeToDbDateTime } = require("../../shared/utils/dateUtils");
const { getEstadoClave } = require("../trabajo/trabajoEstados");
const { logAuditoria, getClientIp } = require("../../shared/services/auditService");

const AsignacionController = {
  /**
   * @desc    Crear una asignación y, en la MISMA transacción, generar el trabajo
   *          abierto asociado (flujo Asignada → Trabajo). Devuelve `trabajoId`.
   * @route   POST /api/mp/asignacion
   * @access  Permiso: asignaciones.crear
   */
  create: [
    validate(createAsignacionSchema),
    async (req, res, next) => {
      const t = await Asignacion.sequelize.transaction();
      try {
        const payload = { ...req.body };
        if (payload.fechaAsignacion) {
          payload.fechaAsignacion = normalizeToDbDateTime(payload.fechaAsignacion);
        }

        // 1) Validar la queja y su estado (predecesor correcto).
        const queja = await Queja.findByPk(payload.id_queja, { transaction: t });
        if (!queja) {
          await t.rollback();
          return next(apiError.notFound("Queja"));
        }
        if (queja.estado === "Asignada") {
          await t.rollback();
          return next(
            apiError.conflict(
              "La queja ya está Asignada; use PATCH /api/mp/trabajo/:id/resolver para cerrarla.",
            ),
          );
        }
        if (queja.estado !== "Probada" && queja.estado !== "Pendiente") {
          await t.rollback();
          return next(
            apiError.badRequest(
              "La queja debe estar en estado 'Probada' o 'Pendiente' para asignarla.",
            ),
          );
        }

        const estadoAnteriorQueja = queja.estado;

        // 2) Crear la asignación.
        const data = await Asignacion.create(payload, { transaction: t });

        // 3) Asociar los trabajadores de la asignación.
        const trabajadores = Array.isArray(payload.trabajadores) ? payload.trabajadores : [];
        if (trabajadores.length > 0) {
          const trabajadoresData = trabajadores.map((trabajador) => ({
            id_asignacion: data.id_asignacion,
            id_trabajador: trabajador.id_trabajador,
          }));
          await AsignacionTrabajadores.bulkCreate(trabajadoresData, { transaction: t });
        }

        // 4) Generar automáticamente el trabajo abierto (estado "Abierto").
        const idEstadoAbierto = await getEstadoClave("ABIERTO", t);
        const fechaInicio = payload.fechaAsignacion || normalizeToDbDateTime(new Date());
        const trabajo = await Trabajo.create(
          {
            id_queja: data.id_queja,
            fecha: fechaInicio, // mientras está abierto, `fecha` = fechaInicio; al resolver pasa a fechaFin
            estado: idEstadoAbierto,
            probador: trabajadores.length > 0 ? trabajadores[0].id_trabajador : null,
            observaciones: `Trabajo generado automáticamente al asignar la queja #${data.id_queja}`,
          },
          { transaction: t },
        );

        // 5) Asociar los mismos operarios al trabajo.
        if (trabajadores.length > 0) {
          const trabajoTrabajadoresData = trabajadores.map((trabajador) => ({
            id_trabajo: trabajo.id_trabajo,
            id_trabajador: trabajador.id_trabajador,
          }));
          await TrabajoTrabajadores.bulkCreate(trabajoTrabajadoresData, { transaction: t });
        }

        // 6) Pasar la queja a Asignada.
        await Queja.update(
          { estado: "Asignada" },
          {
            where: { id_queja: data.id_queja },
            validate: false,
            individualHooks: false,
            transaction: t,
          },
        );

        // 7) Auditoría (dentro de la misma transacción).
        await logAuditoria({
          entidad: "Trabajo",
          id_entidad: trabajo.id_trabajo,
          accion: "CREATE",
          hacia_estado: "Abierto",
          usuario_id: req.userId,
          detalle: {
            origen: "asignacion",
            id_asignacion: data.id_asignacion,
            id_queja: data.id_queja,
            trabajadores: trabajadores.map((w) => w.id_trabajador),
          },
          ip: getClientIp(req),
          transaction: t,
        });
        await logAuditoria({
          entidad: "Queja",
          id_entidad: data.id_queja,
          accion: "ESTADO",
          desde_estado: estadoAnteriorQueja,
          hacia_estado: "Asignada",
          usuario_id: req.userId,
          detalle: { id_asignacion: data.id_asignacion, id_trabajo: trabajo.id_trabajo },
          ip: getClientIp(req),
          transaction: t,
        });

        await t.commit();

        res.status(201).json({
          success: true,
          data: { ...data.toJSON(), trabajoId: trabajo.id_trabajo },
          trabajoId: trabajo.id_trabajo,
          message: "Asignacion creada exitosamente",
        });
      } catch (error) {
        await t.rollback();
        if (error.name === "SequelizeValidationError") {
          const mensaje =
            error.errors?.map((err) => err.message).join(". ") || error.message;
          return next(apiError.badRequest(mensaje));
        }
        return next(error);
      }
    },
  ],

  getAll: [
    validate(listAsignacionSchema, "query"),
    async (req, res, next) => {
      try {
        const { limit, offset } = parseListParams(req.query);
        const data = await Asignacion.findAll({ limit, offset });
        if (data.length === 0) {
          return next(apiError.notFound("Asignacion"));
        }
        for (let i = 0; i < data.length; i++) {
          const trabajadores = await AsignacionTrabajadores.findAll({
            where: { id_asignacion: data[i].id_asignacion },
          });
          data[i].dataValues.trabajadores = trabajadores;
        }

        res.json({ success: true, data });
      } catch (error) {
        return next(error);
      }
    },
  ],

  getById: async (req, res, next) => {
    try {
      const data = await Asignacion.findOne({
        where: { id_asignacion: req.params.id },
      });
      if (!data) {
        return next(apiError.notFound("Asignacion"));
      }
      const trabajadores = await AsignacionTrabajadores.findAll({
        where: { id_asignacion: data.id_asignacion },
      });
      data.dataValues.trabajadores = trabajadores;

      res.json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const data = await Asignacion.findOne({
        where: { id_asignacion: req.params.id },
      });
      if (!data) {
        return next(apiError.notFound("Asignacion"));
      }
      await Asignacion.destroy({ where: { id_asignacion: req.params.id } });
      res.json({ success: true, message: "Asignacion eliminada exitosamente" });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = AsignacionController;