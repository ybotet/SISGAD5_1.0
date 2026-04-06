const { Trabajo, TrabajoTrabajadores, Queja, Trabajador } = require("../models");
const { addFlowEntry, removeFlowEntry } = require("../utils/quejaFlow");
const { Op } = require("sequelize");
const { parseListParams } = require("../utils/parseListParams");
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
        const { page, limit, offset, sortBy, sortOrder, search } = parseListParams(req.query, {
          allowedSortFields: [
            "fecha",
            "probador",
            "estado",
            "observaciones",
            "id_queja",
            "id_trabajo",
            "createdAt",
            "updatedAt",
          ],
          defaultSort: "createdAt",
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
        return next(apiErrors.notFound("Trabajo"));
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
      try {
        const { trabajadores, ...trabajoData } = req.body;

        console.log("📝 Datos recibidos:", { trabajoData, trabajadores });

        // Crear el trabajo
        const data = await Trabajo.create(trabajoData);
        console.log("✅ Trabajo creado:", data.id_trabajo);

        // Si hay trabajadores asociados, crearlos en la tabla intermedia
        if (trabajadores && trabajadores.length > 0) {
          const trabajadoresData = trabajadores.map((trabajador) => ({
            id_trabajo: data.id_trabajo,
            id_trabajador: trabajador.id_trabajador,
          }));
          console.log("📝 Insertando trabajadores:", trabajadoresData);
          await TrabajoTrabajadores.bulkCreate(trabajadoresData);
          console.log("✅ Trabajadores asociados creados");
        }

        await Queja.update(
          { estado: "Resuelta" },
          {
            where: { id_queja: data.id_queja },
            validate: false,
            individualHooks: false,
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
        });

        const trabajoObj = trabajoCompleto.toJSON();
        const trabajadoresAsignados =
          trabajoObj.tb_trabajo_trabajadores?.map((tt) => tt.tb_trabajador) || [];

        res.status(201).json({
          success: true,
          data: {
            ...trabajoObj,
            trabajadores: trabajadoresAsignados,
          },
          message: "Trabajo creado exitosamente",
        });
      } catch (error) {
        console.error("❌ Error en create:", error);
        if (error.name === "SequelizeValidationError") {
          const mensaje = error.errors?.map((err) => err.message).join(". ") || error.message;
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
        const { trabajadores, ...updateData } = req.body;

        const existing = await Trabajo.findByPk(id);
        if (!existing) {
          return next(apiErrors.notFound("Trabajo"));
        }

        // valores antiguos para mantener sincronía del flujo
        const oldQueja = existing.id_queja;
        const oldClave = existing.estado;
        const oldFecha = existing.fecha;

        const [affectedRows] = await Trabajo.update(updateData, {
          where: { id_trabajo: id },
        });

        if (affectedRows === 0 && !trabajadores) {
          return next(apiErrors.notFound("Trabajo"));
        }

        // Actualizar trabajadores si se enviaron
        if (trabajadores && Array.isArray(trabajadores)) {
          // Eliminar los existentes
          await TrabajoTrabajadores.destroy({
            where: { id_trabajo: id },
          });

          // Crear los nuevos
          if (trabajadores.length > 0) {
            const trabajadoresData = trabajadores.map((trabajador) => ({
              id_trabajo: id,
              id_trabajador: trabajador.id_trabajador,
            }));
            await TrabajoTrabajadores.bulkCreate(trabajadoresData);
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

        res.json({
          success: true,
          data: {
            ...trabajoObj,
            trabajadores: trabajadoresAsignados,
          },
          message: "Trabajo actualizado exitosamente",
        });
      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          const mensaje = error.errors?.map((err) => err.message).join(". ") || error.message;
          return next(apiErrors.badRequest(mensaje));
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
    try {
      const { id } = req.params;

      const existing = await Trabajo.findByPk(id);
      if (!existing) {
        return next(apiErrors.notFound("Trabajo"));
      }

      // limpiar flujo asociado antes de eliminar
      if (existing.id_queja && existing.estado) {
        await removeFlowEntry(existing.id_queja, existing.estado, existing.fecha);
      }

      // Los registros en TrabajoTrabajadores se eliminarán automáticamente por CASCADE
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
};

module.exports = TrabajoController;
