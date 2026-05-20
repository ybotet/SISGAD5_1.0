const {
  Queja,
  Prueba,
  Trabajo,
  Asignacion,
  AsignacionTrabajadores,
  Resultadoprueba,
  Trabajador,
  Cable,
  Clave,
} = require("../models");
const { Op, Sequelize } = require("sequelize");
const {
  createQuejaSchema,
  updateQuejaSchema,
  listQuejaSchema,
  cerrarQuejaSchema,
} = require("../validations/queja.schemas");
const validate = require("../middleware/validate");
const apiErrors = require("../utils/apiErrors");
const {
  normalizeToDbDateTime,
  normalizeDateRange,
  getCurrentDateTime,
} = require("../utils/dateUtils");

// Función auxiliar para normalizar fechas de quejas (texto a timestamp)
const normalizeQuejaDate = (dateStr) => {
  if (!dateStr) return null;
  // Si ya tiene formato 'YYYY-MM-DD HH:MM:SS', devolverlo
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  // Si es solo fecha 'YYYY-MM-DD', añadir hora
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return `${dateStr} 00:00:00`;
  }
  // Si es ISO con T, convertir
  if (dateStr.includes("T")) {
    return dateStr.replace("T", " ").split(".")[0];
  }
  return dateStr;
};

const QuejaController = {
  /**
   * @swagger
   * tags:
   *   name: Quejas
   *   description: Gestión de quejas de telecomunicaciones
   */

  /**
   * @swagger
   * /queja:
   *   get:
   *     summary: Listar quejas con paginación
   *     tags: [Quejas]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema: { type: integer, default: 1, minimum: 1 }
   *         description: Número de página
   *       - in: query
   *         name: limit
   *         schema: { type: integer, default: 10, minimum: 1, maximum: 100 }
   *         description: Registros por página
   *       - in: query
   *         name: sortBy
   *         schema: { type: string, enum: [fecha, num_reporte, prioridad, estado], default: fecha }
   *       - in: query
   *         name: sortOrder
   *         schema: { type: string, enum: [ASC, DESC], default: DESC }
   *       - in: query
   *         name: search
   *         schema: { type: string }
   *         description: Buscar por num_reporte
   *       - in: query
   *         name: estado
   *         schema: { type: string, enum: ["Abierta", "Probada", "Pendiente", "Asignada", "Resuelta", "Cerrada"] }
   *     responses:
   *       200:
   *         description: Lista de quejas
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data: { type: array, items: { $ref: '#/components/schemas/Queja' } }
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     page: { type: integer }
   *                     limit: { type: integer }
   *                     total: { type: integer }
   *                     pages: { type: integer }
   *       401:
   *         description: No autorizado
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Error' }
   *       500:
   *         description: Error interno
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Error' }
   */
  getAll: [
    validate(listQuejaSchema, "query"),
    async (req, res, next) => {
      try {
        const {
          page,
          limit,
          sortBy,
          sortOrder,
          search,
          estado,
          id_tipoqueja,
          fecha_desde,
          fecha_hasta,
        } = req.query;

        const offset = (page - 1) * limit;

        // Configuración de includes
        const includeConfig = [
          {
            association: "tb_telefono",
            attributes: ["id_telefono", "telefono"],
            required: false,
          },
          {
            association: "tb_linea",
            attributes: ["id_linea", "clavelinea"],
            required: false,
          },
          {
            association: "tb_tipoqueja",
            attributes: ["id_tipoqueja", "tipoqueja"],
            required: false,
          },
          {
            association: "tb_pizarra",
            attributes: ["id_pizarra", "nombre"],
            required: false,
          },
          {
            association: "tb_clave",
            attributes: ["id_clave", "clave"],
            required: false,
          },
          {
            association: "tb_trabajador",
            attributes: ["id_trabajador", "clave_trabajador"],
            required: false,
          },
        ];

        // Construir where clause
        const whereClause = {
          [Op.and]: [
            search ? { num_reporte: { [Op.iLike]: `%${search}%` } } : null,
            estado ? { estado } : null,
            id_tipoqueja ? { id_tipoqueja } : null,
            normalizedRange.from ? { fecha: { [Op.gte]: normalizedRange.from } } : null,
            normalizedRange.to ? { fecha: { [Op.lte]: normalizedRange.to } } : null,
          ].filter(Boolean),
        };
        // 🔹 BLINDAJE: Validación defensiva ANTES de usar en Sequelize
        const ALLOWED_SORT = [
          "fecha",
          "num_reporte",
          "prioridad",
          "estado",
          "createdAt",
          "updatedAt",
        ];

        // Forzar valores seguros (nunca undefined/NaN)
        const sortByRaw = req.query.sortBy;
        const sortByValue =
          typeof sortByRaw === "string" && ALLOWED_SORT.includes(sortByRaw) ? sortByRaw : "fecha";

        const sortOrderRaw = req.query.sortOrder;
        const sortOrderValue =
          typeof sortOrderRaw === "string" && ["ASC", "DESC"].includes(sortOrderRaw.toUpperCase())
            ? sortOrderRaw.toUpperCase()
            : "DESC";

        // Debug temporal (puedes quitarlo después)
        console.log("🔍 ORDER DEBUG:", {
          sortByValue,
          sortOrderValue,
          raw: req.query.sortBy,
        });

        const data = await Queja.findAndCountAll({
          where: whereClause,
          include: includeConfig,
          limit: parseInt(limit) || 10,
          offset: parseInt(offset) || 0,
          order: [[sortByValue, sortOrderValue]], // ← Nunca será undefined
          distinct: true,
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
        next(error);
      }
    },
  ],

  /**
   * @swagger
   * /queja/{id}:
   *   get:
   *     summary: Obtener detalles de una queja por ID
   *     tags: [Quejas]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer, example: 20234 }
   *         description: ID único de la queja
   *     responses:
   *       200:
   *         description: Detalles de la queja con historial
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: object
   *                   properties:
   *                     queja: { $ref: '#/components/schemas/Queja' }
   *                     pruebas: { type: array, items: { type: object } }
   *                     trabajos: { type: array, items: { type: object } }
   *       401: { description: 'No autorizado', content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
   *       404: { description: 'Queja no encontrada', content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
   *       500: { description: 'Error interno', content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
   */

  // En QuejaController.js - getById

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const queja = await Queja.findByPk(id, {
        include: [
          {
            association: "tb_telefono",
            attributes: ["id_telefono", "telefono"],
          },
          { association: "tb_linea", attributes: ["id_linea", "clavelinea"] },
          {
            association: "tb_tipoqueja",
            attributes: ["id_tipoqueja", "tipoqueja"],
          },
          { association: "tb_pizarra", attributes: ["id_pizarra", "nombre"] },
          { association: "tb_clave", attributes: ["id_clave", "clave"] },
          {
            association: "tb_trabajador",
            attributes: ["id_trabajador", "clave_trabajador"],
          },
        ],
      });

      if (!queja) {
        return next(apiErrors.notFound("Queja"));
      }

      // Consultar pruebas
      const pruebas = await Prueba.findAll({
        where: { id_queja: id },
        include: [
          {
            association: "tb_resultadoprueba",
            attributes: ["id_resultadoprueba", "resultado"],
          },
          { association: "tb_cable", attributes: ["id_cable", "numero"] },
          { association: "tb_clave", attributes: ["id_clave", "clave"] },
          {
            association: "tb_trabajador",
            attributes: ["id_trabajador", "clave_trabajador"],
          },
        ],
      });

      // ✅ CONSULTAR TRABAJOS CON SUS TRABAJADORES ASOCIADOS
      const trabajosRaw = await Trabajo.findAll({
        where: { id_queja: id },
        include: [
          {
            association: "tb_clave",
            attributes: ["id_clave", "clave"],
          },
          {
            association: "tb_trabajador",
            attributes: ["id_trabajador", "clave_trabajador", "nombre"],
          },
          {
            // ✅ Esta es la asociación clave
            association: "tb_trabajo_trabajadores",
            required: false,
            include: [
              {
                association: "tb_trabajador",
                attributes: ["id_trabajador", "clave_trabajador", "nombre"],
              },
            ],
          },
        ],
      });

      // ✅ Formatear trabajos para incluir el array de trabajadores
      const trabajos = trabajosRaw.map((trabajo) => {
        const trabajoPlain = trabajo.toJSON();
        const trabajadoresAsignados =
          trabajoPlain.tb_trabajo_trabajadores?.map((tt) => tt.tb_trabajador) || [];

        return {
          ...trabajoPlain,
          trabajadores: trabajadoresAsignados,
        };
      });

      // Consultar asignaciones
      const asignacionesRaw = await Asignacion.findAll({
        where: { id_queja: id },
        include: [
          {
            association: "tb_asignacion_trabajadores",
            required: false,
            include: [
              {
                association: "tb_trabajador",
                attributes: ["id_trabajador", "clave_trabajador", "nombre"],
              },
            ],
          },
        ],
        order: [["fechaAsignacion", "DESC"]],
      });

      // Formatear asignaciones
      const asignacion = asignacionesRaw.map((asignacion) => {
        const asignacionPlain = asignacion.toJSON();
        const trabajadoresAsignados =
          asignacionPlain.tb_asignacion_trabajadores?.map((at) => at.tb_trabajador) || [];

        return {
          ...asignacionPlain,
          trabajadores: trabajadoresAsignados,
        };
      });

      res.json({
        success: true,
        data: {
          queja,
          pruebas,
          trabajos, // ✅ Ahora incluye la propiedad 'trabajadores'
          asignacion,
        },
      });
    } catch (error) {
      console.error(" Error en getById:", error);
      next(error);
    }
  },

  // POST /queja - Agregar antes de la función create[]
  /**
   * @swagger
   * /queja:
   *   post:
   *     summary: Crear nueva queja de telecomunicaciones
   *     tags: [Quejas]
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [id_tipoqueja]
   *             properties:
   *               id_telefono: { type: integer, nullable: true, example: 239 }
   *               id_linea: { type: integer, nullable: true, example: 66 }
   *               id_pizarra: { type: integer, nullable: true, example: 12 }
   *               id_tipoqueja: { type: integer, example: 63 }
   *               reportado_por: { type: string, example: "Yaisel Botet" }
   *               prioridad: { type: integer, minimum: 0, maximum: 5, default: 0 }
   *     responses:
   *       201:
   *         description: Queja creada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 message: { type: string, example: "ERROR.QUEJA.CREATED" }
   *                 data: { $ref: '#/components/schemas/Queja' }
   *       400: { description: 'Datos inválidos', content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
   *       401: { description: 'No autorizado', content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
   *       409: { description: 'Reporte duplicado', content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
   */
  create: [
    validate(createQuejaSchema, "body"),
    async (req, res, next) => {
      try {
        const bodyData = { ...req.body };
        console.log("🔍 CREATE DEBUG - Body recibido:", bodyData);

        bodyData.estado = "Abierta";
        bodyData.created_by = req.userId; // ← Del middleware auth
        bodyData.fecha = normalizeToDbDateTime(bodyData.fecha) || getCurrentDateTime();
        if (bodyData.fechaok) {
          bodyData.fechaok = normalizeToDbDateTime(bodyData.fechaok);
        }

        // ✅ num_reporte se genera automáticamente en el hook beforeCreate

        const data = await Queja.create(bodyData);

        res.status(201).json({
          success: true,
          message: "ERROR.QUEJA.CREATED", // ← Clave i18n
          data,
        });
      } catch (error) {
        // 🔹 Manejo de errores específicos de BD
        if (error.name === "SequelizeUniqueConstraintError") {
          return next(apiErrors.conflict("ERROR.REPORTE.DUPLICATED"));
        }
        if (error.name === "SequelizeValidationError") {
          // Segunda capa: validación de modelo falló (ej: alMenosUnIdentificador)
          const mensajes = error.errors.map((err) => err.message).join(". ");
          return next(apiErrors.badRequest(mensajes));
        }
        next(error);
      }
    },
  ],

  /**
   * @swagger
   * /queja/{id}:
   *   put:
   *     summary: Actualizar estado o datos de una queja
   *     tags: [Quejas]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *           example: 20234
   *         description: ID único de la queja a actualizar
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               estado:
   *                 type: string
   *                 enum: ["Abierta", "Probada", "Pendiente", "Asignada", "Resuelta", "Cerrada"]
   *                 example: "Probada"
   *                 description: Nuevo estado de la queja
   *               prioridad:
   *                 type: integer
   *                 minimum: 0
   *                 maximum: 5
   *                 example: 3
   *                 description: Nivel de prioridad actualizado
   *               id_tipoqueja:
   *                 type: integer
   *                 example: 63
   *                 description: ID del tipo de queja actualizado
   *               reportado_por:
   *                 type: string
   *                 example: "Yaisel Botet"
   *                 description: Nombre actualizado de quien reporta
   *               id_clave:
   *                 type: integer
   *                 nullable: true
   *                 description: Clave actual del flujo de trabajo
   *     responses:
   *       200:
   *         description: Queja actualizada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "ERROR.QUEJA.UPDATED"
   *                 data:
   *                   $ref: '#/components/schemas/Queja'
   *       400:
   *         description: Datos inválidos o transición de estado no permitida
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Error' }
   *       401:
   *         description: No autorizado
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Error' }
   *       404:
   *         description: Queja no encontrada con el ID proporcionado
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Error' }
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Error' }
   */

  update: [
    validate(updateQuejaSchema, "body"),
    async (req, res, next) => {
      try {
        const { id } = req.params;
        const updateData = { ...req.body, updated_by: req.userId };
        if (updateData.fecha) {
          updateData.fecha = normalizeToDbDateTime(updateData.fecha);
        }
        if (updateData.fechaok) {
          updateData.fechaok = normalizeToDbDateTime(updateData.fechaok);
        }

        // 🔹 Si se actualiza estado, validar transición
        if (updateData.estado) {
          const validTransitions = {
            Abierta: ["Probada"],
            Probada: ["Asignada", "Pendiente", "Resuelta"],
            Pendiente: ["Resuelta", "Probada", "Asignada"],
            Asignada: ["Resuelta", "Pendiente"],
            Resuelta: ["Cerrada"],
            Cerrada: [], // Terminal - una vez cerrada no puede cambiar
          };

          const current = await Queja.findByPk(id, { attributes: ["estado"] });
          if (current && !validTransitions[current.estado]?.includes(updateData.estado)) {
            return next(apiErrors.badRequest("ERROR.ESTADO.TRANSICION.INVALIDA"));
          }

          // ✅ Si se está cerrando la queja, validar que tenga clave de cierre
          if (updateData.estado === "Cerrada") {
            if (!updateData.id_clavecierre && !req.body.id_clavecierre) {
              return next(apiErrors.badRequest("Debe seleccionar una clave de cierre"));
            }
            if (!updateData.fechaok && !req.body.fechaok) {
              return next(apiErrors.badRequest("Debe seleccionar una fecha de cierre"));
            }
          }
        }

        // ✅ Si se envía id_clavecierre, validar que la clave exista y no sea pendiente
        if (updateData.id_clavecierre) {
          const claveCierre = await Clave.findByPk(updateData.id_clavecierre);
          if (!claveCierre) {
            return next(apiErrors.badRequest("La clave de cierre no existe"));
          }
          if (claveCierre.es_pendiente === true) {
            return next(apiErrors.badRequest("No se puede cerrar con una clave pendiente"));
          }
        }

        const [affectedRows] = await Queja.update(updateData, {
          where: { id_queja: parseInt(id) },
          returning: true,
        });

        if (affectedRows === 0) {
          return next(apiErrors.notFound("Queja"));
        }

        const updatedData = await Queja.findByPk(id, {
          include: [
            { association: "tb_clave", attributes: ["id_clave", "clave"] },
            {
              association: "tb_clave_cierre",
              attributes: ["id_clave", "clave", "es_pendiente"],
              required: false,
            },
          ],
        });

        res.json({
          success: true,
          message: "Queja actualizada exitosamente",
          data: updatedData,
        });
      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          const mensajes = error.errors.map((err) => err.message).join(". ");
          return next(apiErrors.badRequest(mensajes));
        }
        next(error);
      }
    },
  ],

  /**
   * @desc    Eliminar registro (soft delete recomendado)
   * @route   DELETE /api/mp/queja/:id
   * @access  Private (admin only)
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const queja = await Queja.findByPk(id);
      if (!queja) {
        return next(apiErrors.notFound("Queja"));
      }

      //eliminar queja (soft delete recomendado, aquí se muestra hard delete por simplicidad)
      await queja.destroy();

      res.json({
        success: true,
        message: "ERROR.QUEJA.DELETED",
      });
    } catch (error) {
      next(error);
    }
  },

  cerrar: [
    validate(cerrarQuejaSchema, "body"),
    async (req, res, next) => {
      try {
        const { id } = req.params;
        const { id_clavecierre, fechaok } = req.body;
        const fechaokNormalized = normalizeToDbDateTime(fechaok);

        // 1. Verificar que la queja existe
        const queja = await Queja.findByPk(id, {
          attributes: ["id_queja", "estado"],
        });

        if (!queja) {
          return next(apiErrors.notFound("Queja"));
        }

        // 2. Validar que no esté ya cerrada
        if (queja.estado === "Cerrada") {
          return next(apiErrors.badRequest("La queja ya está cerrada"));
        }

        // 3. Validar que la clave de cierre exista y no sea pendiente
        const claveCierre = await Clave.findByPk(id_clavecierre);
        if (!claveCierre) {
          return next(apiErrors.badRequest("La clave de cierre no existe"));
        }
        if (claveCierre.es_pendiente === true) {
          return next(apiErrors.badRequest("No se puede cerrar con una clave pendiente"));
        }

        // 4. Validar transición de estado para cerrar
        const estadosValidosParaCerrar = ["Resuelta", "Probada"];
        if (!estadosValidosParaCerrar.includes(queja.estado)) {
          return next(
            apiErrors.badRequest(
              `No se puede cerrar una queja en estado "${queja.estado}". La queja debe estar en estado Resuelta o Probada.`,
            ),
          );
        }

        // 5. Actualizar la queja
        await Queja.update(
          {
            estado: "Cerrada",
            id_clavecierre: id_clavecierre,
            fechaok: fechaokNormalized,
            updated_by: req.userId,
          },
          {
            where: { id_queja: parseInt(id) },
            validate: false, // Desactivar validación
            individualHooks: false,
          },
        );

        // 6. Obtener la queja actualizada con sus relaciones
        const updatedData = await Queja.findByPk(id, {
          include: [
            { association: "tb_clave", attributes: ["id_clave", "clave"] },
            {
              association: "tb_clave_cierre",
              attributes: ["id_clave", "clave", "es_pendiente"],
              required: false,
            },
          ],
        });

        res.json({
          success: true,
          message: "Queja cerrada exitosamente",
          data: updatedData,
        });
      } catch (error) {
        console.error(" Error cerrando queja:", error);
        next(error);
      }
    },
  ],
};

// ----------------------
// Dashboard endpoints
// ----------------------

// GET /queja/dashboard/summary?fecha_desde=...&fecha_hasta=...
QuejaController.dashboardSummary = async (req, res, next) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;
    const normalizedRange = normalizeDateRange({ from: fecha_desde, to: fecha_hasta });

    // If the client provided a date range, filter by it; otherwise return global totals
    const baseWhere = {};
    if (normalizedRange.from || normalizedRange.to) {
      baseWhere.fecha = {
        [Op.gte]: normalizedRange.from || normalizeToDbDateTime(new Date(0)),
        [Op.lte]: normalizedRange.to || normalizeToDbDateTime(new Date()),
      };
    }

    const total = await Queja.count({ where: baseWhere });
    const telefonos = await Queja.count({
      where: { ...baseWhere, id_telefono: { [Op.ne]: null } },
    });
    const lineas = await Queja.count({ where: { ...baseWhere, id_linea: { [Op.ne]: null } } });
    const pizarras = await Queja.count({ where: { ...baseWhere, id_pizarra: { [Op.ne]: null } } });

    // previous period (same length)
    let prev = { total: 0, telefonos: 0, lineas: 0, pizarras: 0 };
    try {
      if (baseWhere.fecha && (baseWhere.fecha[Op.gte] || baseWhere.fecha[Op.lte])) {
        let fromTime = baseWhere.fecha[Op.gte] ? new Date(baseWhere.fecha[Op.gte]).getTime() : null;
        let toTime = baseWhere.fecha[Op.lte] ? new Date(baseWhere.fecha[Op.lte]).getTime() : null;
        if (fromTime && toTime) {
          const len = toTime - fromTime + 1;
          const pFrom = new Date(fromTime - len);
          const pTo = new Date(fromTime - 1);
          const prevWhere = {
            fecha: {
              [Op.gte]: normalizeToDbDateTime(pFrom),
              [Op.lte]: normalizeToDbDateTime(pTo),
            },
          };
          prev.total = await Queja.count({ where: prevWhere });
          prev.telefonos = await Queja.count({
            where: { ...prevWhere, id_telefono: { [Op.ne]: null } },
          });
          prev.lineas = await Queja.count({ where: { ...prevWhere, id_linea: { [Op.ne]: null } } });
          prev.pizarras = await Queja.count({
            where: { ...prevWhere, id_pizarra: { [Op.ne]: null } },
          });
        }
      }
    } catch (e) {
      // ignore previous period errors
    }

    const pct = (n) => (total === 0 ? 0 : Number(((n / total) * 100).toFixed(2)));

    res.json({
      success: true,
      data: {
        total,
        telefonos: { count: telefonos, pct: pct(telefonos), prev: prev.telefonos },
        lineas: { count: lineas, pct: pct(lineas), prev: prev.lineas },
        pizarras: { count: pizarras, pct: pct(pizarras), prev: prev.pizarras },
        periodo:
          normalizedRange.from || normalizedRange.to
            ? { desde: baseWhere.fecha[Op.gte], hasta: baseWhere.fecha[Op.lte] }
            : null,
        anterior: prev,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /queja/dashboard/sankey
QuejaController.sankey = async (req, res, next) => {
  try {
    const sequelize = Queja.sequelize;
    const { fecha_desde, fecha_hasta } = req.query;
    const normalizedRange = normalizeDateRange({ from: fecha_desde, to: fecha_hasta });

    // Función para filtrar por fecha con CAST a timestamp (solo filas con formato YYYY-MM-DD)
    const dateFilter = (alias = "q") => {
      const parts = [];
      if (normalizedRange.from)
        parts.push(
          `${alias}.fecha ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' AND substring(${alias}.fecha from 1 for 19)::timestamp >= '${normalizedRange.from}'::timestamp`,
        );
      if (normalizedRange.to)
        parts.push(
          `${alias}.fecha ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' AND substring(${alias}.fecha from 1 for 19)::timestamp <= '${normalizedRange.to}'::timestamp`,
        );
      return parts.length ? ` AND ${parts.join(" AND ")}` : "";
    };

    // Calculamos aristas (edges) aproximadas entre etapas usando existencia de eventos y estado actual.
    // Estas consultas usan DISTINCT para contar quejas únicas por flujo.
    const [[{ cnt_abierta_probada }]] = await sequelize.query(
      `SELECT COUNT(DISTINCT q.id_queja) AS cnt_abierta_probada FROM tb_queja q JOIN tb_prueba p ON p.id_queja = q.id_queja WHERE p.id_queja IS NOT NULL${dateFilter("q")};`,
    );

    const [[{ cnt_probada_asignada }]] = await sequelize.query(
      `SELECT COUNT(DISTINCT q.id_queja) AS cnt_probada_asignada FROM tb_queja q JOIN tb_prueba p ON p.id_queja = q.id_queja JOIN tb_asignacion a ON a.id_queja = q.id_queja WHERE 1=1${dateFilter("q")};`,
    );

    const [[{ cnt_abierta_asignada }]] = await sequelize.query(
      `SELECT COUNT(DISTINCT q.id_queja) AS cnt_abierta_asignada FROM tb_queja q JOIN tb_asignacion a ON a.id_queja = q.id_queja LEFT JOIN tb_prueba p ON p.id_queja = q.id_queja WHERE p.id_queja IS NULL${dateFilter("q")};`,
    );

    const [[{ cnt_probada_resuelta }]] = await sequelize.query(
      `SELECT COUNT(DISTINCT q.id_queja) AS cnt_probada_resuelta FROM tb_queja q JOIN tb_prueba p ON p.id_queja = q.id_queja WHERE q.estado IN ('Resuelta','Cerrada')${dateFilter("q")};`,
    );

    const [[{ cnt_asignada_pendiente }]] = await sequelize.query(
      `SELECT COUNT(DISTINCT q.id_queja) AS cnt_asignada_pendiente FROM tb_queja q JOIN tb_asignacion a ON a.id_queja = q.id_queja WHERE q.estado='Pendiente'${dateFilter("q")};`,
    );

    const [[{ cnt_asignada_resuelta }]] = await sequelize.query(
      `SELECT COUNT(DISTINCT q.id_queja) AS cnt_asignada_resuelta FROM tb_queja q JOIN tb_asignacion a ON a.id_queja = q.id_queja WHERE q.estado IN ('Resuelta','Cerrada')${dateFilter("q")};`,
    );

    // Definir colores para cada estado
    const nodeColors = {
      Abierta: "#FF6B6B",
      Probada: "#4ECDC4",
      Asignada: "#45B7D1",
      Pendiente: "#F9CA24",
      Resuelta: "#6AB04C",
      Cerrada: "#95A5A6",
    };

    const allLinks = [
      { source: "Abierta", target: "Probada", value: Number(cnt_abierta_probada || 0) },
      { source: "Probada", target: "Asignada", value: Number(cnt_probada_asignada || 0) },
      { source: "Abierta", target: "Asignada", value: Number(cnt_abierta_asignada || 0) },
      { source: "Probada", target: "Resuelta", value: Number(cnt_probada_resuelta || 0) },
      { source: "Asignada", target: "Pendiente", value: Number(cnt_asignada_pendiente || 0) },
      { source: "Asignada", target: "Resuelta", value: Number(cnt_asignada_resuelta || 0) },
    ];

    const links = allLinks.filter((l) => l.value > 0);

    if (links.length === 0) {
      return res.json({
        success: true,
        data: { nodes: [], links: [], message: "No hay datos de flujo en el período seleccionado" },
      });
    }

    const nodeNames = new Set();
    links.forEach((link) => {
      nodeNames.add(link.source);
      nodeNames.add(link.target);
    });

    const order = ["Abierta", "Probada", "Asignada", "Pendiente", "Resuelta", "Cerrada"];
    const nodes = Array.from(nodeNames)
      .sort((a, b) => {
        const ia = order.indexOf(a) === -1 ? 999 : order.indexOf(a);
        const ib = order.indexOf(b) === -1 ? 999 : order.indexOf(b);
        return ia - ib;
      })
      .map((name) => ({ name, color: nodeColors[name] || "#8884d8" }));

    res.json({ success: true, data: { nodes, links } });
  } catch (error) {
    next(error);
  }
};

// GET /queja/dashboard/funnel
QuejaController.funnel = async (req, res, next) => {
  try {
    const sequelize = Queja.sequelize;
    const { fecha_desde, fecha_hasta } = req.query;
    const normalizedRange = normalizeDateRange({ from: fecha_desde, to: fecha_hasta });
    const dateFilter = (alias = "q") => {
      const parts = [];
      if (normalizedRange.from)
        parts.push(
          `${alias}.fecha ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' AND substring(${alias}.fecha from 1 for 19)::timestamp >= '${normalizedRange.from}'::timestamp`,
        );
      if (normalizedRange.to)
        parts.push(
          `${alias}.fecha ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' AND substring(${alias}.fecha from 1 for 19)::timestamp <= '${normalizedRange.to}'::timestamp`,
        );
      return parts.length ? ` AND ${parts.join(" AND ")}` : "";
    };

    // Counts per stage
    const total = await Queja.count({
      where:
        normalizedRange.from || normalizedRange.to
          ? {
              fecha: {
                [Op.gte]: normalizedRange.from || undefined,
                [Op.lte]: normalizedRange.to || undefined,
              },
            }
          : {},
    });
    const cnt_probada =
      (
        await sequelize.query(
          `SELECT COUNT(DISTINCT p.id_queja) AS c FROM tb_prueba p JOIN tb_queja q ON p.id_queja = q.id_queja WHERE p.id_queja IS NOT NULL${dateFilter("q")};`,
        )
      )[0][0].c || 0;
    const cnt_asignada =
      (
        await sequelize.query(
          `SELECT COUNT(DISTINCT a.id_queja) AS c FROM tb_asignacion a JOIN tb_queja q ON a.id_queja = q.id_queja WHERE a.id_queja IS NOT NULL${dateFilter("q")};`,
        )
      )[0][0].c || 0;
    const cnt_resuelta =
      (
        await sequelize.query(
          `SELECT COUNT(*) AS c FROM tb_queja q WHERE q.estado IN ('Resuelta','Cerrada')${dateFilter("q")};`,
        )
      )[0][0].c || 0;

    // En funnel, las conversiones de fecha
    const avgPruebaQ = await sequelize.query(
      `SELECT AVG(
      CASE
        WHEN q.created_at ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' AND p.min_created ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
          THEN EXTRACT(EPOCH FROM (substring(p.min_created from 1 for 19)::timestamp - substring(q.created_at from 1 for 19)::timestamp)) / 3600.0
        ELSE NULL
      END
    ) AS hours
   FROM tb_queja q
   JOIN (SELECT id_queja, MIN(created_at) AS min_created FROM tb_prueba GROUP BY id_queja) p ON p.id_queja = q.id_queja
   WHERE 1=1${dateFilter("q")};`,
    );
    const avgPrueba = Number((avgPruebaQ[0][0] && avgPruebaQ[0][0].hours) || 0).toFixed(2);

    const avgAsignQ = await sequelize.query(
      `SELECT AVG(
          CASE
            WHEN q.created_at ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' AND a.min_fecha ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
              THEN EXTRACT(EPOCH FROM (substring(a.min_fecha from 1 for 19)::timestamp - substring(q.created_at from 1 for 19)::timestamp)) / 3600.0
            ELSE NULL
          END
        ) AS hours
       FROM tb_queja q
       JOIN (SELECT id_queja, MIN(fecha_asignacion) AS min_fecha FROM tb_asignacion GROUP BY id_queja) a ON a.id_queja = q.id_queja;`,
    );
    const avgAsign = Number((avgAsignQ[0][0] && avgAsignQ[0][0].hours) || 0).toFixed(2);

    const avgResolveQ = await sequelize.query(
      `SELECT AVG(
          CASE
            WHEN q.fechaok IS NOT NULL AND q.created_at ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' AND q.fechaok ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
              THEN EXTRACT(EPOCH FROM (substring(q.fechaok from 1 for 19)::timestamp - substring(q.created_at from 1 for 19)::timestamp)) / 3600.0
            ELSE NULL
          END
        ) AS hours FROM tb_queja q WHERE q.fechaok IS NOT NULL;`,
    );
    const avgResolve = Number((avgResolveQ[0][0] && avgResolveQ[0][0].hours) || 0).toFixed(2);

    res.json({
      success: true,
      data: {
        stages: [
          { name: "Abierta", count: total },
          { name: "Probada", count: Number(cnt_probada) },
          { name: "Asignada", count: Number(cnt_asignada) },
          { name: "Resuelta", count: Number(cnt_resuelta) },
        ],
        averages: { probada_h: avgPrueba, asignada_h: avgAsign, resolucion_h: avgResolve },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /queja/dashboard/close_buckets?days=30
QuejaController.closeBuckets = async (req, res, next) => {
  try {
    let { fecha_desde, fecha_hasta } = req.query;
    const sequelize = Queja.sequelize;

    // Normalizar fechas
    if (fecha_desde) fecha_desde = normalizeQuejaDate(fecha_desde);
    if (fecha_hasta) fecha_hasta = normalizeQuejaDate(fecha_hasta);

    let whereClause = "";
    const replacements = {};

    if (fecha_desde && fecha_hasta) {
      whereClause = `AND q.fecha >= :fecha_desde AND q.fecha <= :fecha_hasta`;
      replacements.fecha_desde = fecha_desde;
      replacements.fecha_hasta = fecha_hasta;
    } else if (fecha_desde) {
      whereClause = `AND q.fecha >= :fecha_desde`;
      replacements.fecha_desde = fecha_desde;
    } else if (fecha_hasta) {
      whereClause = `AND q.fecha <= :fecha_hasta`;
      replacements.fecha_hasta = fecha_hasta;
    }

    const q = `
      SELECT
        SUM(CASE
          WHEN q.fechaok IS NOT NULL AND q.created_at IS NOT NULL
            AND q.fechaok ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' AND q.created_at ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
            AND EXTRACT(EPOCH FROM (substring(q.fechaok from 1 for 19)::timestamp - substring(q.created_at from 1 for 19)::timestamp)) / 86400.0 <= 1
          THEN 1 ELSE 0 END
        ) AS le24,
        SUM(CASE
          WHEN q.fechaok IS NOT NULL AND q.created_at IS NOT NULL
            AND q.fechaok ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' AND q.created_at ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
            AND EXTRACT(EPOCH FROM (substring(q.fechaok from 1 for 19)::timestamp - substring(q.created_at from 1 for 19)::timestamp)) / 86400.0 > 1
            AND EXTRACT(EPOCH FROM (substring(q.fechaok from 1 for 19)::timestamp - substring(q.created_at from 1 for 19)::timestamp)) / 86400.0 <= 3
          THEN 1 ELSE 0 END
        ) AS btw24_72,
        SUM(CASE
          WHEN q.fechaok IS NOT NULL AND q.created_at IS NOT NULL
            AND q.fechaok ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' AND q.created_at ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
            AND EXTRACT(EPOCH FROM (substring(q.fechaok from 1 for 19)::timestamp - substring(q.created_at from 1 for 19)::timestamp)) / 86400.0 > 3
          THEN 1 ELSE 0 END
        ) AS gt72,
        COUNT(*) AS total_closed
      FROM tb_queja q
      WHERE q.fechaok IS NOT NULL
        AND q.created_at IS NOT NULL
        ${whereClause}
    `;

    const [row] = await sequelize.query(q, { replacements });

    // Formatear para el frontend (como buckets)
    const closeData = {
      buckets: [
        { name: "≤ 24h", count: Number(row.le24) || 0 },
        { name: "24h - 72h", count: Number(row.btw24_72) || 0 },
        { name: "> 72h", count: Number(row.gt72) || 0 },
      ],
      total: Number(row.total_closed) || 0,
    };

    res.json({ success: true, data: closeData });
  } catch (error) {
    console.error("Error en closeBuckets:", error);
    res.json({ success: true, data: { buckets: [], total: 0 } });
  }
};

// GET /queja/dashboard/heatmap
QuejaController.heatmap = async (req, res, next) => {
  try {
    let { fecha_desde, fecha_hasta } = req.query;
    const sequelize = Queja.sequelize;

    // Normalizar fechas
    if (fecha_desde) fecha_desde = normalizeQuejaDate(fecha_desde);
    if (fecha_hasta) fecha_hasta = normalizeQuejaDate(fecha_hasta);

    let whereClause = "";
    const replacements = {};

    if (fecha_desde && fecha_hasta) {
      whereClause = `WHERE q.fecha >= :fecha_desde AND q.fecha <= :fecha_hasta`;
      replacements.fecha_desde = fecha_desde;
      replacements.fecha_hasta = fecha_hasta;
    } else if (fecha_desde) {
      whereClause = `WHERE q.fecha >= :fecha_desde`;
      replacements.fecha_desde = fecha_desde;
    } else if (fecha_hasta) {
      whereClause = `WHERE q.fecha <= :fecha_hasta`;
      replacements.fecha_hasta = fecha_hasta;
    }

    const q = `
      SELECT 
        COALESCE(t.tipoqueja, 'Sin clasificar') AS tipo,
        SUM(CASE WHEN q.id_telefono IS NOT NULL THEN 1 ELSE 0 END) AS telefonos,
        SUM(CASE WHEN q.id_linea IS NOT NULL THEN 1 ELSE 0 END) AS lineas,
        SUM(CASE WHEN q.id_pizarra IS NOT NULL THEN 1 ELSE 0 END) AS pizarras,
        COUNT(*) AS total
      FROM tb_queja q
      LEFT JOIN tb_tipoqueja t ON t.id_tipoqueja = q.id_tipoqueja
      ${whereClause}
      GROUP BY t.tipoqueja
      ORDER BY total DESC
    `;

    const [rows] = await sequelize.query(q, { replacements });

    // Asegurar que todos los valores sean números
    const formattedRows = rows.map((row) => ({
      tipo: row.tipo,
      telefonos: Number(row.telefonos) || 0,
      lineas: Number(row.lineas) || 0,
      pizarras: Number(row.pizarras) || 0,
      total: Number(row.total) || 0,
    }));

    res.json({ success: true, data: formattedRows });
  } catch (error) {
    console.error("Error en heatmap:", error);
    res.json({ success: true, data: [] });
  }
};

// GET /queja/dashboard/historic?days=90
QuejaController.historic = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 90;
    let { fecha_desde, fecha_hasta } = req.query;
    const sequelize = Queja.sequelize;

    // Normalizar fechas
    if (fecha_desde) fecha_desde = normalizeQuejaDate(fecha_desde);
    if (fecha_hasta) fecha_hasta = normalizeQuejaDate(fecha_hasta);

    let whereClause = "";
    const replacements = {};

    if (fecha_desde && fecha_hasta) {
      whereClause = `WHERE fecha >= :fecha_desde AND fecha <= :fecha_hasta`;
      replacements.fecha_desde = fecha_desde;
      replacements.fecha_hasta = fecha_hasta;
    } else if (fecha_desde) {
      whereClause = `WHERE fecha >= :fecha_desde`;
      replacements.fecha_desde = fecha_desde;
    } else if (fecha_hasta) {
      whereClause = `WHERE fecha <= :fecha_hasta`;
      replacements.fecha_hasta = fecha_hasta;
    } else {
      // Si no hay filtros, usar últimos N días
      whereClause = `WHERE fecha >= date('now', '-${days} days')`;
    }

    // Consulta para datos por día (para la gráfica de tendencia)
    const q = `
      SELECT 
        strftime('%Y-%m', fecha) as month,
        COUNT(*) as count
      FROM tb_queja
      ${whereClause}
      GROUP BY strftime('%Y-%m', fecha)
      ORDER BY month ASC
      LIMIT 24
    `;

    const [rows] = await sequelize.query(q, { replacements });

    if (!rows || rows.length === 0) {
      return res.json({
        success: true,
        data: { counts: [], moving: [], projection: [] },
      });
    }

    // Formatear nombres de meses
    const monthNames = {
      "01": "Ene",
      "02": "Feb",
      "03": "Mar",
      "04": "Abr",
      "05": "May",
      "06": "Jun",
      "07": "Jul",
      "08": "Ago",
      "09": "Sep",
      10: "Oct",
      11: "Nov",
      12: "Dic",
    };

    const counts = rows.map((r) => {
      const [year, month] = r.month.split("-");
      return {
        month: `${monthNames[month]} ${year}`,
        count: Number(r.count) || 0,
      };
    });

    // Calcular media móvil de 3 meses
    const moving = counts.map((v, i, arr) => {
      const start = Math.max(0, i - 2);
      const slice = arr.slice(start, i + 1).map((s) => s.count);
      const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
      return {
        month: v.month,
        ma: Number(avg.toFixed(2)),
      };
    });

    res.json({
      success: true,
      data: { counts, moving, projection: [] },
    });
  } catch (error) {
    console.error("Error en historic:", error);
    res.json({
      success: true,
      data: { counts: [], moving: [], projection: [] },
    });
  }
};

// GET /queja/dashboard/mttr?dimension=tipo_falla
QuejaController.mttr = async (req, res, next) => {
  try {
    const dim = req.query.dimension || "tipo_falla";
    let { fecha_desde, fecha_hasta } = req.query;
    const sequelize = Queja.sequelize;

    // Normalizar fechas
    if (fecha_desde) fecha_desde = normalizeQuejaDate(fecha_desde);
    if (fecha_hasta) fecha_hasta = normalizeQuejaDate(fecha_hasta);

    if (dim === "tipo_falla") {
      let whereClause = "";
      const replacements = {};

      if (fecha_desde && fecha_hasta) {
        whereClause = `AND q.fecha >= :fecha_desde AND q.fecha <= :fecha_hasta`;
        replacements.fecha_desde = fecha_desde;
        replacements.fecha_hasta = fecha_hasta;
      } else if (fecha_desde) {
        whereClause = `AND q.fecha >= :fecha_desde`;
        replacements.fecha_desde = fecha_desde;
      } else if (fecha_hasta) {
        whereClause = `AND q.fecha <= :fecha_hasta`;
        replacements.fecha_hasta = fecha_hasta;
      }

      const q = `
        SELECT 
          t.tipoqueja AS name,
          ROUND(AVG(
            EXTRACT(EPOCH FROM (substring(q.fechaok from 1 for 19)::timestamp - substring(q.created_at from 1 for 19)::timestamp)) / 3600.0
          ), 2) AS avg_hours
        FROM tb_queja q
        LEFT JOIN tb_tipoqueja t ON t.id_tipoqueja = q.id_tipoqueja
        WHERE q.fechaok IS NOT NULL 
          AND q.created_at IS NOT NULL
          ${whereClause}
        GROUP BY t.tipoqueja
        ORDER BY avg_hours ASC
      `;

      const [rows] = await sequelize.query(q, { replacements });

      // Asegurar que los valores sean números
      const formattedRows = rows.map((row) => ({
        name: row.name || "Sin clasificar",
        avg_hours: Number(row.avg_hours) || 0,
      }));

      return res.json({ success: true, data: formattedRows });
    }
    // ... resto del código
  } catch (error) {
    console.error("Error en mttr:", error);
    res.json({ success: true, data: [] });
  }
};

// GET /queja/dashboard/recurrentes?days=30
QuejaController.recurrentes = async (req, res, next) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;
    const normalizedRange = normalizeDateRange({ from: fecha_desde, to: fecha_hasta });
    const sequelize = Queja.sequelize;
    let whereDate = "";
    if (normalizedRange.from || normalizedRange.to) {
      whereDate = `WHERE q.fecha ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' AND substring(q.fecha from 1 for 19)::timestamp >= '${normalizedRange.from || "1970-01-01 00:00:00"}'::timestamp AND substring(q.fecha from 1 for 19)::timestamp <= '${normalizedRange.to || getCurrentDateTime()}'::timestamp`;
    }
    const q = `
      SELECT COALESCE(qt.telefono::text, ql.clavelinea::text, qp.nombre::text) AS equipo,
        COUNT(*) AS total,
        MIN(CASE WHEN q.fecha ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN substring(q.fecha from 1 for 19)::timestamp ELSE NULL END) AS primera,
        MAX(CASE WHEN q.fecha ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN substring(q.fecha from 1 for 19)::timestamp ELSE NULL END) AS ultima,
        EXTRACT(EPOCH FROM (
          MAX(CASE WHEN q.fecha ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN substring(q.fecha from 1 for 19)::timestamp ELSE NULL END) -
          MIN(CASE WHEN q.fecha ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN substring(q.fecha from 1 for 19)::timestamp ELSE NULL END)
        )) / 86400.0 AS dias_entre
      FROM tb_queja q
      LEFT JOIN tb_telefono qt ON qt.id_telefono = q.id_telefono
      LEFT JOIN tb_linea ql ON ql.id_linea = q.id_linea
      LEFT JOIN tb_pizarra qp ON qp.id_pizarra = q.id_pizarra
      ${whereDate}
      GROUP BY COALESCE(qt.telefono::text, ql.clavelinea::text, qp.nombre::text)
      HAVING COUNT(*) > 1
      ORDER BY total DESC;
    `;
    const [rows] = await sequelize.query(q);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

module.exports = QuejaController;
