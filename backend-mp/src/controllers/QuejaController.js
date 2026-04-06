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

module.exports = QuejaController;
