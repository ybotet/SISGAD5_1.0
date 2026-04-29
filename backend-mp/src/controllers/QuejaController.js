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
        const whereClause = {};
        if (search) {
          whereClause[Op.or] = [{ num_reporte: { [Op.iLike]: `%${search}%` } }];
        }
        if (estado) whereClause.estado = estado;
        if (id_tipoqueja) whereClause.id_tipoqueja = id_tipoqueja;
        if (fecha_desde || fecha_hasta) {
          whereClause.fecha = {};
          if (fecha_desde) whereClause.fecha[Op.gte] = fecha_desde;
          if (fecha_hasta) whereClause.fecha[Op.lte] = fecha_hasta;
        }
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
      console.error("❌ Error en getById:", error);
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

        // 4. Validar transición de estado (opcional)
        const estadosValidosParaCerrar = ["Resuelta", "Asignada", "Probada"];
        if (!estadosValidosParaCerrar.includes(queja.estado)) {
          return next(
            apiErrors.badRequest(
              `No se puede cerrar una queja en estado "${queja.estado}". La queja debe estar en estado Resuelta, Asignada o Probada.`,
            ),
          );
        }

        // 5. Actualizar la queja
        await Queja.update(
          {
            estado: "Cerrada",
            id_clavecierre: id_clavecierre,
            fechaok: fechaok,
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
        console.error("❌ Error cerrando queja:", error);
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

    const baseWhere = {};
    if (fecha_desde || fecha_hasta) {
      baseWhere.fecha = {};
      if (fecha_desde) baseWhere.fecha[Op.gte] = fecha_desde;
      if (fecha_hasta) baseWhere.fecha[Op.lte] = fecha_hasta;
    } else {
      // default last 7 days
      const to = new Date();
      const from = new Date(to.getTime() - 6 * 24 * 60 * 60 * 1000);
      baseWhere.fecha = { [Op.gte]: from.toISOString(), [Op.lte]: to.toISOString() };
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
      let fromTime = baseWhere.fecha[Op.gte] ? new Date(baseWhere.fecha[Op.gte]).getTime() : null;
      let toTime = baseWhere.fecha[Op.lte] ? new Date(baseWhere.fecha[Op.lte]).getTime() : null;
      if (fromTime && toTime) {
        const len = toTime - fromTime + 1;
        const pFrom = new Date(fromTime - len);
        const pTo = new Date(fromTime - 1);
        const prevWhere = { fecha: { [Op.gte]: pFrom.toISOString(), [Op.lte]: pTo.toISOString() } };
        prev.total = await Queja.count({ where: prevWhere });
        prev.telefonos = await Queja.count({
          where: { ...prevWhere, id_telefono: { [Op.ne]: null } },
        });
        prev.lineas = await Queja.count({ where: { ...prevWhere, id_linea: { [Op.ne]: null } } });
        prev.pizarras = await Queja.count({
          where: { ...prevWhere, id_pizarra: { [Op.ne]: null } },
        });
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
        periodo: { desde: baseWhere.fecha[Op.gte], hasta: baseWhere.fecha[Op.lte] },
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
    // Approximate flows using presence of Prueba and Asignacion and estados
    const sequelize = Queja.sequelize;
    const { fecha_desde, fecha_hasta } = req.query;
    const dateFilter = (alias = "q") => {
      const parts = [];
      if (fecha_desde) parts.push(`${alias}.fecha >= '${fecha_desde}'`);
      if (fecha_hasta) parts.push(`${alias}.fecha <= '${fecha_hasta}'`);
      return parts.length ? ` AND ${parts.join(" AND ")}` : "";
    };

    // Count quejas that had any prueba (Probada) - join to queja to filter by fecha
    const [[{ cnt_probada }]] = await sequelize.query(
      `SELECT COUNT(DISTINCT p.id_queja) AS cnt_probada FROM tb_prueba p JOIN tb_queja q ON p.id_queja = q.id_queja WHERE p.id_queja IS NOT NULL${dateFilter("q")};`,
    );

    // Count quejas that had asignacion (Asignada)
    const [[{ cnt_asignada }]] = await sequelize.query(
      `SELECT COUNT(DISTINCT a.id_queja) AS cnt_asignada FROM tb_asignacion a JOIN tb_queja q ON a.id_queja = q.id_queja WHERE a.id_queja IS NOT NULL${dateFilter("q")};`,
    );

    // Count pendientes (current state Pendiente)
    const [[{ cnt_pendiente }]] = await sequelize.query(
      `SELECT COUNT(*) AS cnt_pendiente FROM tb_queja q WHERE q.estado='Pendiente'${dateFilter("q")};`,
    );

    // Count resueltas/cerradas
    const [[{ cnt_resuelta }]] = await sequelize.query(
      `SELECT COUNT(*) AS cnt_resuelta FROM tb_queja q WHERE q.estado IN ('Resuelta','Cerrada')${dateFilter("q")};`,
    );
    const [[{ cnt_cerrada }]] = await sequelize.query(
      `SELECT COUNT(*) AS cnt_cerrada FROM tb_queja q WHERE q.estado='Cerrada'${dateFilter("q")};`,
    );

    // Build simple sankey representation (source, target, value)
    const links = [
      { source: "Abierta", target: "Probada", value: Number(cnt_probada || 0) },
      { source: "Probada", target: "Asignada", value: Number(cnt_asignada || 0) },
      { source: "Asignada", target: "Pendiente", value: Number(cnt_pendiente || 0) },
      { source: "Probada", target: "Resuelta", value: Number(cnt_resuelta || 0) },
      { source: "Resuelta", target: "Cerrada", value: Number(cnt_cerrada || 0) },
    ];

    res.json({
      success: true,
      data: {
        nodes: ["Abierta", "Probada", "Asignada", "Pendiente", "Resuelta", "Cerrada"],
        links,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /queja/dashboard/funnel
QuejaController.funnel = async (req, res, next) => {
  try {
    const sequelize = Queja.sequelize;
    const { fecha_desde, fecha_hasta } = req.query;
    const dateFilter = (alias = "q") => {
      const parts = [];
      if (fecha_desde) parts.push(`${alias}.fecha >= '${fecha_desde}'`);
      if (fecha_hasta) parts.push(`${alias}.fecha <= '${fecha_hasta}'`);
      return parts.length ? ` AND ${parts.join(" AND ")}` : "";
    };

    // Counts per stage
    const total = await Queja.count({
      where:
        fecha_desde || fecha_hasta
          ? { fecha: { [Op.gte]: fecha_desde || undefined, [Op.lte]: fecha_hasta || undefined } }
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

    // Average times (hours): created -> first prueba, created -> first asignacion, created -> fechaok
    const avgPruebaQ = await sequelize.query(
      `SELECT AVG(EXTRACT(EPOCH FROM (p.min_created - q.created_at)) / 3600.0) AS hours
       FROM tb_queja q
       JOIN (SELECT id_queja, MIN(created_at) AS min_created FROM tb_prueba GROUP BY id_queja) p ON p.id_queja = q.id_queja
       WHERE 1=1${dateFilter("q")};`,
    );
    const avgPrueba = Number((avgPruebaQ[0][0] && avgPruebaQ[0][0].hours) || 0).toFixed(2);

    const avgAsignQ = await sequelize.query(
      `SELECT AVG(EXTRACT(EPOCH FROM (a.min_fecha - q.created_at)) / 3600.0) AS hours
       FROM tb_queja q
       JOIN (SELECT id_queja, MIN(fecha_asignacion) AS min_fecha FROM tb_asignacion GROUP BY id_queja) a ON a.id_queja = q.id_queja;`,
    );
    const avgAsign = Number((avgAsignQ[0][0] && avgAsignQ[0][0].hours) || 0).toFixed(2);

    const avgResolveQ = await sequelize.query(
      `SELECT AVG(EXTRACT(EPOCH FROM (q.fechaok - q.created_at)) / 3600.0) AS hours FROM tb_queja q WHERE q.fechaok IS NOT NULL;`,
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
    const days = parseInt(req.query.days, 10) || 30;
    const { fecha_desde, fecha_hasta } = req.query;
    const sequelize = Queja.sequelize;
    const whereDate =
      fecha_desde || fecha_hasta
        ? `WHERE q.fecha >= '${fecha_desde || "1970-01-01"}' AND q.fecha <= '${fecha_hasta || new Date().toISOString()}'`
        : `WHERE q.fecha >= now() - interval '${days} days'`;
    const q = `
      SELECT
        SUM(CASE WHEN q.fechaok IS NOT NULL AND EXTRACT(EPOCH FROM (q.fechaok - q.created_at)) <= 86400 THEN 1 ELSE 0 END) AS le24,
        SUM(CASE WHEN q.fechaok IS NOT NULL AND EXTRACT(EPOCH FROM (q.fechaok - q.created_at)) > 86400 AND EXTRACT(EPOCH FROM (q.fechaok - q.created_at)) <= 259200 THEN 1 ELSE 0 END) AS btw24_72,
        SUM(CASE WHEN q.fechaok IS NOT NULL AND EXTRACT(EPOCH FROM (q.fechaok - q.created_at)) > 259200 THEN 1 ELSE 0 END) AS gt72,
        COUNT(*) FILTER (WHERE q.fechaok IS NOT NULL) AS total_closed
      FROM tb_queja q
      ${whereDate};
    `;
    const [[row]] = await sequelize.query(q);
    res.json({
      success: true,
      data: {
        le24: Number(row.le24 || 0),
        btw24_72: Number(row.btw24_72 || 0),
        gt72: Number(row.gt72 || 0),
        total: Number(row.total_closed || 0),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /queja/dashboard/heatmap
QuejaController.heatmap = async (req, res, next) => {
  try {
    const sequelize = Queja.sequelize;
    const { fecha_desde, fecha_hasta } = req.query;
    const whereDate =
      fecha_desde || fecha_hasta
        ? `WHERE q.fecha >= '${fecha_desde || "1970-01-01"}' AND q.fecha <= '${fecha_hasta || new Date().toISOString()}'`
        : "";
    // Group by tipoqueja and service (telefono/linea/pizarra)
    const q = `
      SELECT t.tipoqueja AS tipo, 
        SUM(CASE WHEN q.id_telefono IS NOT NULL THEN 1 ELSE 0 END) AS telefonos,
        SUM(CASE WHEN q.id_linea IS NOT NULL THEN 1 ELSE 0 END) AS lineas,
        SUM(CASE WHEN q.id_pizarra IS NOT NULL THEN 1 ELSE 0 END) AS pizarras,
        COUNT(*) AS total
      FROM tb_queja q
      LEFT JOIN tb_tipoqueja t ON t.id_tipoqueja = q.id_tipoqueja
      ${whereDate}
      GROUP BY t.tipoqueja
      ORDER BY total DESC;
    `;
    const [rows] = await sequelize.query(q);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

// GET /queja/dashboard/historic?days=90
QuejaController.historic = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 90;
    const { fecha_desde, fecha_hasta } = req.query;
    const sequelize = Queja.sequelize;
    let q;
    if (fecha_desde || fecha_hasta) {
      const desde = fecha_desde || "1970-01-01";
      const hasta = fecha_hasta || new Date().toISOString();
      q = `
        SELECT date_trunc('day', fecha)::date AS day, COUNT(*) AS cnt
        FROM tb_queja
        WHERE fecha >= '${desde}' AND fecha <= '${hasta}'
        GROUP BY day
        ORDER BY day ASC;
      `;
    } else {
      q = `
        SELECT date_trunc('day', fecha)::date AS day, COUNT(*) AS cnt
        FROM tb_queja
        WHERE fecha >= now() - interval '${days} days'
        GROUP BY day
        ORDER BY day ASC;
      `;
    }
    const [rows] = await sequelize.query(q);

    // compute simple 7-day moving average and stddev
    const counts = rows.map((r) => ({ day: r.day, cnt: Number(r.cnt) }));
    const window = 7;
    const ma = counts.map((v, i, arr) => {
      const start = Math.max(0, i - (window - 1));
      const slice = arr.slice(start, i + 1).map((s) => s.cnt);
      const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
      const variance = slice.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / slice.length;
      return {
        day: v.day,
        ma: Number(avg.toFixed(2)),
        std: Number(Math.sqrt(variance).toFixed(2)),
      };
    });

    // simple exponential smoothing projection for next 7 days
    const alpha = 0.3;
    let lastForecast = counts.length ? counts[counts.length - 1].cnt : 0;
    for (let i = Math.max(0, counts.length - 14); i < counts.length; i++) {
      lastForecast = alpha * counts[i].cnt + (1 - alpha) * lastForecast;
    }
    const projection = [];
    for (let i = 1; i <= 7; i++) {
      lastForecast = alpha * lastForecast + (1 - alpha) * lastForecast; // simple growth
      projection.push({ day: i, forecast: Number(lastForecast.toFixed(2)) });
    }

    res.json({ success: true, data: { counts, moving: ma, projection } });
  } catch (error) {
    next(error);
  }
};

// GET /queja/dashboard/mttr?dimension=tipo_falla
QuejaController.mttr = async (req, res, next) => {
  try {
    const dim = req.query.dimension || "tipo_falla";
    const { fecha_desde, fecha_hasta } = req.query;
    const sequelize = Queja.sequelize;
    if (dim === "tipo_falla") {
      const dateWhere =
        fecha_desde || fecha_hasta
          ? ` AND q.fecha >= '${fecha_desde || "1970-01-01"}' AND q.fecha <= '${fecha_hasta || new Date().toISOString()}'`
          : "";
      const q = `
        SELECT t.tipoqueja AS dimension, AVG(EXTRACT(EPOCH FROM (q.fechaok - q.created_at)) / 3600.0) AS mttr_hours
        FROM tb_queja q
        LEFT JOIN tb_tipoqueja t ON t.id_tipoqueja = q.id_tipoqueja
        WHERE q.fechaok IS NOT NULL ${dateWhere}
        GROUP BY t.tipoqueja
        ORDER BY mttr_hours ASC;
      `;
      const [rows] = await sequelize.query(q);
      return res.json({ success: true, data: rows });
    }

    if (dim === "trabajador") {
      const dateWhere =
        fecha_desde || fecha_hasta
          ? ` AND q.fecha >= '${fecha_desde || "1970-01-01"}' AND q.fecha <= '${fecha_hasta || new Date().toISOString()}'`
          : "";
      const q = `
        SELECT tr.nombre AS dimension, AVG(EXTRACT(EPOCH FROM (q.fechaok - q.created_at)) / 3600.0) AS mttr_hours
        FROM tb_queja q
        LEFT JOIN tb_trabajador tr ON tr.id_trabajador = q.probador
        WHERE q.fechaok IS NOT NULL ${dateWhere}
        GROUP BY tr.nombre
        ORDER BY mttr_hours ASC;
      `;
      const [rows] = await sequelize.query(q);
      return res.json({ success: true, data: rows });
    }

    return next(apiErrors.badRequest("Dimension no soportada"));
  } catch (error) {
    next(error);
  }
};

// GET /queja/dashboard/recurrentes?days=30
QuejaController.recurrentes = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 30;
    const { fecha_desde, fecha_hasta } = req.query;
    const sequelize = Queja.sequelize;
    const whereDate =
      fecha_desde || fecha_hasta
        ? `WHERE q.fecha >= '${fecha_desde || "1970-01-01"}' AND q.fecha <= '${fecha_hasta || new Date().toISOString()}'`
        : `WHERE q.fecha >= now() - interval '${days} days'`;
    const q = `
      SELECT COALESCE(qt.telefono::text, ql.clavelinea::text, qp.nombre::text) AS equipo,
        COUNT(*) AS total, MIN(q.fecha) AS primera, MAX(q.fecha) AS ultima,
        EXTRACT(EPOCH FROM (MAX(q.fecha) - MIN(q.fecha))) / 86400.0 AS dias_entre
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
