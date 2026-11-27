const { Trabajo, TrabajoTrabajadores, Queja, Trabajador, Clave } = require("../../features");
const { addFlowEntry, removeFlowEntry } = require("../../utils/quejaFlow");
const { Op } = require("sequelize");
const { parseListParams } = require("../../shared/utils/parseListParams");
const apiError = require("../../shared/utils/apiErrors");
const {
  createTrabajoSchema,
  updateTrabajoSchema,
  listTrabajoSchema,
  resolverTrabajoSchema,
} = require("./trabajo.validation");
const validate = require("../../shared/middleware/validate");
const { normalizeToDbDateTime } = require("../../shared/utils/dateUtils");
const { logAuditoria, getClientIp } = require("../../shared/services/auditService");
const { getEstadoClave } = require("./trabajoEstados");

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
        const { page, limit, offset, sortBy, sortOrder, search } = parseListParams(req.query, {
          allowedSortFields: [
            "fecha",
            "probador",
            "estado",
            "observaciones",
            "id_queja",
            "id_trabajo",
            "created_at",
            "updated_at",
          ],
          defaultSort: "created_at",
          defaultOrder: "DESC",
          maxLimit: 100,
        });

        const whereClause = {};
        if (search) {
          if (!isNaN(search)) {
            const searchNum = parseInt(search);
            whereClause[Op.or] = [{ id_trabajo: searchNum }, { id_queja: searchNum }];
          }
        }

        const data = await Trabajo.findAndCountAll({
          where: whereClause,
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [[sortBy, sortOrder]],
          include: [
            {
              association: "tb_trabajo_trabajadores",
              include: ["tb_trabajador"],
              required: false,
            },
            { association: "tb_clave", attributes: ["id_clave", "clave"] },
            { association: "tb_trabajador", attributes: ["id_trabajador", "clave_trabajador"] },
          ],
        });

        // Formatear respuesta para incluir trabajadores
        const formattedRows = data.rows.map((trabajo) => {
          const trabajoObj = trabajo.toJSON();
          const trabajadoresAsignados =
            trabajoObj.tb_trabajo_trabajadores?.map((tt) => tt.tb_trabajador) || [];
          return {
            ...trabajoObj,
            trabajadores: trabajadoresAsignados,
          };
        });

        res.json({
          success: true,
          data: formattedRows,
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
      const data = await Trabajo.findByPk(id, {
        include: [
          {
            association: "tb_trabajo_trabajadores",
            include: ["tb_trabajador"],
            required: false,
          },
          { association: "tb_clave", attributes: ["id_clave", "clave"] },
          { association: "tb_trabajador", attributes: ["id_trabajador", "clave_trabajador"] },
        ],
      });

      if (!data) {
        return next(apiError.notFound("Trabajo"));
      }

      const trabajoObj = data.toJSON();
      const trabajadoresAsignados =
        trabajoObj.tb_trabajo_trabajadores?.map((tt) => tt.tb_trabajador) || [];

      res.json({
        success: true,
        data: {
          ...trabajoObj,
          trabajadores: trabajadoresAsignados,
        },
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
      const t = await Trabajo.sequelize.transaction();
      try {
        const { trabajadores, ...trabajoData } = req.body;
        //Comprobar que la queja esta en estado "Asignada"
        const queja = await Queja.findOne({
          where: { id_queja: trabajoData.id_queja },
          transaction: t,
        });
        //la queja solo pouede estar en estado "Asignada" o "Pendiente" para crear un trabajo
        if (queja.estado !== "Asignada" && queja.estado !== "Pendiente") {
          await t.rollback();
          return next(
            apiError.badRequest(
              "La queja debe estar en estado 'Asignada' o 'Pendiente' para crear un trabajo",
            ),
          );
        }

        if (trabajoData.fecha) {
          trabajoData.fecha = normalizeToDbDateTime(trabajoData.fecha);
        }

        console.log("📝 Datos recibidos:", { trabajoData, trabajadores });

        // Crear el trabajo
        const data = await Trabajo.create(trabajoData, { transaction: t });
        console.log("✅ Trabajo creado:", data.id_trabajo);

        // Si hay trabajadores asociados, crearlos en la tabla intermedia
        if (trabajadores && trabajadores.length > 0) {
          const trabajadoresData = trabajadores.map((trabajador) => ({
            id_trabajo: data.id_trabajo,
            id_trabajador: trabajador.id_trabajador,
          }));
          console.log("📝 Insertando trabajadores:", trabajadoresData);
          await TrabajoTrabajadores.bulkCreate(trabajadoresData, { transaction: t });
          console.log("✅ Trabajadores asociados creados");
        }

        let clave = await Clave.findByPk(trabajoData.estado, { transaction: t });
        console.log("🔍 Clave encontrada:", clave ? clave.clave : "No encontrada");

        await Queja.update(
          { estado: clave && clave.es_pendiente === false ? "Resuelta" : "Pendiente" },
          {
            where: { id_queja: data.id_queja },
            validate: false,
            individualHooks: false,
            transaction: t,
          },
        );

        // ✅ CORREGIDO: usar el alias correcto "tb_trabajo_trabajadores"
        const trabajoCompleto = await Trabajo.findByPk(data.id_trabajo, {
          include: [
            {
              association: "tb_trabajo_trabajadores", // ✅ Este es el alias correcto
              include: ["tb_trabajador"],
              required: false,
            },
            { association: "tb_clave", attributes: ["id_clave", "clave"] },
            { association: "tb_trabajador", attributes: ["id_trabajador", "clave_trabajador"] },
          ],
          transaction: t,
        });

        const trabajoObj = trabajoCompleto.toJSON();
        const trabajadoresAsignados =
          trabajoObj.tb_trabajo_trabajadores?.map((tt) => tt.tb_trabajador) || [];

        // Audit log
        await logAuditoria({
          entidad: "Trabajo",
          id_entidad: data.id_trabajo,
          accion: "CREATE",
          hacia_estado: trabajoData.estado,
          usuario_id: req.userId,
          detalle: { id_queja: data.id_queja, trabajadores: trabajadores?.map((w) => w.id_trabajador) },
          ip: getClientIp(req),
          transaction: t,
        });

        await t.commit();

        res.status(201).json({
          success: true,
          data: {
            ...trabajoObj,
            trabajadores: trabajadoresAsignados,
          },
          message: "Trabajo creado exitosamente",
        });
      } catch (error) {
        await t.rollback();
        console.error(" Error en create:", error);
        if (error.name === "SequelizeValidationError") {
          const mensaje = error.errors?.map((err) => err.message).join(". ") || error.message;
          return next(apiError.badRequest(mensaje));
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
      const t = await Trabajo.sequelize.transaction();
      try {
        const { id } = req.params;
        const { trabajadores, ...updateData } = req.body;
        if (updateData.fecha) {
          updateData.fecha = normalizeToDbDateTime(updateData.fecha);
        }

        const existing = await Trabajo.findByPk(id, { transaction: t });
        if (!existing) {
          await t.rollback();
          return next(apiError.notFound("Trabajo"));
        }

        const estadoAnterior = existing.estado;

        // valores antiguos para mantener sincronía del flujo
        const oldQueja = existing.id_queja;
        const oldClave = existing.estado;
        const oldFecha = existing.fecha;

        const [affectedRows, updatedRows] = await Trabajo.update(updateData, {
          where: { id_trabajo: id },
          returning: true,
          transaction: t,
        });

        if (affectedRows === 0 && !trabajadores) {
          await t.rollback();
          return next(apiError.notFound("Trabajo"));
        }

        // Actualizar trabajadores si se enviaron
        if (trabajadores && Array.isArray(trabajadores)) {
          // Eliminar los existentes
          await TrabajoTrabajadores.destroy({
            where: { id_trabajo: id },
            transaction: t,
          });

          // Crear los nuevos
          if (trabajadores.length > 0) {
            const trabajadoresData = trabajadores.map((trabajador) => ({
              id_trabajo: id,
              id_trabajador: trabajador.id_trabajador,
            }));
            await TrabajoTrabajadores.bulkCreate(trabajadoresData, { transaction: t });
          }
        }

        const updatedData = await Trabajo.findByPk(id, {
          include: [
            {
              association: "tb_trabajo_trabajadores",
              include: ["tb_trabajador"],
              required: false,
            },
            { association: "tb_clave", attributes: ["id_clave", "clave"] },
            { association: "tb_trabajador", attributes: ["id_trabajador", "clave_trabajador"] },
          ],
          transaction: t,
        });

        // si cambió la queja/clave/fecha, ajustar arrays en la queja
        if (oldQueja && updatedData) {
          if (
            oldQueja !== updatedData.id_queja ||
            oldClave !== updatedData.estado ||
            oldFecha !== updatedData.fecha
          ) {
            await removeFlowEntry(oldQueja, oldClave, oldFecha);
          }
        }
        if (updatedData.id_queja && updatedData.estado) {
          await addFlowEntry(updatedData.id_queja, updatedData.estado, updatedData.fecha);
        }

        const trabajoObj = updatedData.toJSON();
        const trabajadoresAsignados =
          trabajoObj.tb_trabajo_trabajadores?.map((tt) => tt.tb_trabajador) || [];

        // Audit log
        const accion = updateData.estado && updateData.estado !== estadoAnterior ? "ESTADO" : "UPDATE";
        await logAuditoria({
          entidad: "Trabajo",
          id_entidad: parseInt(id),
          accion,
          desde_estado: estadoAnterior,
          hacia_estado: updateData.estado || estadoAnterior,
          usuario_id: req.userId,
          detalle: { cambios: Object.keys(updateData).filter((k) => k !== "updated_by") },
          ip: getClientIp(req),
          transaction: t,
        });

        await t.commit();

        res.json({
          success: true,
          data: {
            ...trabajoObj,
            trabajadores: trabajadoresAsignados,
          },
          message: "Trabajo actualizado exitosamente",
        });
      } catch (error) {
        await t.rollback();
        if (error.name === "SequelizeValidationError") {
          const mensaje = error.errors?.map((err) => err.message).join(". ") || error.message;
          return next(apiError.badRequest(mensaje));
        }
        return next(error);
      }
    },
  ],

  /**
   * @desc    Resolver un trabajo abierto (flujo Asignada → Resuelta|Pendiente).
   *          Reemplaza el paso manual "crear trabajo desde la queja".
   * @route   PATCH /api/mp/trabajo/:id/resolver
   * @access  Permiso: trabajos.actualizar
   */
  resolver: [
    validate(resolverTrabajoSchema, "body"),
    async (req, res, next) => {
      const t = await Trabajo.sequelize.transaction();
      try {
        const { id } = req.params;
        const { resultado, fechaFin, observaciones } = req.body;

        const trabajo = await Trabajo.findByPk(id, { transaction: t });
        if (!trabajo) {
          await t.rollback();
          return next(apiError.notFound("Trabajo"));
        }

        // El trabajo debe estar abierto (estado "Abierto").
        const idAbierto = await getEstadoClave("ABIERTO", t);
        if (trabajo.estado !== idAbierto) {
          await t.rollback();
          return next(
            apiError.conflict("El trabajo no está abierto; ya fue resuelto o no existe."),
          );
        }

        // La queja asociada debe estar Asignada.
        const queja = await Queja.findByPk(trabajo.id_queja, { transaction: t });
        if (!queja) {
          await t.rollback();
          return next(apiError.notFound("Queja"));
        }
        if (queja.estado !== "Asignada") {
          await t.rollback();
          return next(
            apiError.conflict(
              `La queja no está Asignada (estado actual: ${queja.estado}).`,
            ),
          );
        }

        const esCompletado = resultado === "completado";
        const idEstadoObjetivo = await getEstadoClave(esCompletado ? "RESUELTO" : "PEND", t);
        const estadoQuejaObjetivo = esCompletado ? "Resuelta" : "Pendiente";
        const fechaFinNormalizada = fechaFin
          ? normalizeToDbDateTime(fechaFin)
          : normalizeToDbDateTime(new Date());

        // Duración real (h) calculada a partir de la fecha de inicio del trabajo
        // (`trabajo.fecha`, que mientras está abierto = fechaInicio) y la fechaFin.
        // No se admite como entrada del cliente: se deriva siempre aquí.
        let duracionRealCalculada = null;
        if (trabajo.fecha) {
          const inicioMs = new Date(trabajo.fecha).getTime();
          const finMs = new Date(fechaFinNormalizada).getTime();
          if (!isNaN(inicioMs) && !isNaN(finMs) && finMs >= inicioMs) {
            duracionRealCalculada = Math.round(((finMs - inicioMs) / 3600000) * 10) / 10;
          }
        }

        // Actualizar el trabajo: `fecha` pasa a ser la fechaFin.
        await trabajo.update(
          {
            estado: idEstadoObjetivo,
            fecha: fechaFinNormalizada,
            observaciones: observaciones != null ? observaciones : trabajo.observaciones,
          },
          { transaction: t },
        );

        // Transicionar la queja (Asignada → Resuelta|Pendiente).
        await queja.update({ estado: estadoQuejaObjetivo }, { transaction: t });

        // Auditoría (misma transacción).
        await logAuditoria({
          entidad: "Trabajo",
          id_entidad: trabajo.id_trabajo,
          accion: "ESTADO",
          desde_estado: "Abierto",
          hacia_estado: esCompletado ? "Resuelto" : "Pendiente",
          usuario_id: req.userId,
          detalle: { id_queja: trabajo.id_queja, resultado, duracionReal: duracionRealCalculada },
          ip: getClientIp(req),
          transaction: t,
        });
        await logAuditoria({
          entidad: "Queja",
          id_entidad: queja.id_queja,
          accion: "ESTADO",
          desde_estado: "Asignada",
          hacia_estado: estadoQuejaObjetivo,
          usuario_id: req.userId,
          detalle: { id_trabajo: trabajo.id_trabajo, resultado },
          ip: getClientIp(req),
          transaction: t,
        });

        await t.commit();

        const actualizado = await Trabajo.findByPk(id, {
          include: [
            {
              association: "tb_trabajo_trabajadores",
              include: ["tb_trabajador"],
              required: false,
            },
            { association: "tb_clave", attributes: ["id_clave", "clave"] },
          ],
        });
        const trabajoObj = actualizado.toJSON();
        const trabajadoresAsignados =
          trabajoObj.tb_trabajo_trabajadores?.map((tt) => tt.tb_trabajador) || [];

        res.json({
          success: true,
          data: { ...trabajoObj, trabajadores: trabajadoresAsignados },
          message: esCompletado
            ? "Trabajo completado; queja Resuelta"
            : "Trabajo pendiente; queja Pendiente",
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

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbTrabajo/:id
   * @access  Public
   */
  async delete(req, res, next) {
    const t = await Trabajo.sequelize.transaction();
    try {
      const { id } = req.params;

      const existing = await Trabajo.findByPk(id, { transaction: t });
      if (!existing) {
        await t.rollback();
        return next(apiError.notFound("Trabajo"));
      }

      const estadoEliminado = existing.estado;
      const idQueja = existing.id_queja;

      // limpiar flujo asociado antes de eliminar
      if (existing.id_queja && existing.estado) {
        await removeFlowEntry(existing.id_queja, existing.estado, existing.fecha);
      }

      // Los registros en TrabajoTrabajadores se eliminarán automáticamente por CASCADE
      await Trabajo.destroy({
        where: { id_trabajo: id },
        transaction: t,
      });

      // Audit log
      await logAuditoria({
        entidad: "Trabajo",
        id_entidad: parseInt(id),
        accion: "DELETE",
        desde_estado: estadoEliminado,
        hacia_estado: null,
        usuario_id: req.userId,
        detalle: { id_queja: idQueja },
        ip: getClientIp(req),
        transaction: t,
      });

      await t.commit();

      res.json({
        success: true,
        message: "Trabajo eliminado exitosamente",
      });
    } catch (error) {
      await t.rollback();
      return next(error);
    }
  },
};

module.exports = TrabajoController;
