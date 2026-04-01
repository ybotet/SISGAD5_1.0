const {
  Queja,
  Prueba,
  Trabajo,
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
   *         schema: { type: string, enum: [Abierta, En Proceso, Pendiente, Resuelto, Cerrada] }
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
          typeof sortByRaw === "string" && ALLOWED_SORT.includes(sortByRaw)
            ? sortByRaw
            : "fecha";

        const sortOrderRaw = req.query.sortOrder;
        const sortOrderValue =
          typeof sortOrderRaw === "string" &&
          ["ASC", "DESC"].includes(sortOrderRaw.toUpperCase())
            ? sortOrderRaw.toUpperCase()
            : "DESC";

        // Debug temporal (puedes quitarlo después)
        console.log("🔍 ORDER DEBUG:", {
          sortByValue,
          sortOrderValue,
          raw: req.query.sortBy,
        });

        // ✅ Consulta con valores blindados
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
   *                     flujo: { type: array, items: { type: object } }
   *       401: { description: 'No autorizado', content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
   *       404: { description: 'Queja no encontrada', content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
   *       500: { description: 'Error interno', content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
   */

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

      const [pruebas, trabajos] = await Promise.all([
        Prueba.findAll({
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
        }),
        Trabajo.findAll({
          where: { id_queja: id },
          include: [
            { association: "tb_clave", attributes: ["id_clave", "clave"] },
            {
              association: "tb_trabajador",
              attributes: ["id_trabajador", "clave_trabajador"],
            },
          ],
        }),
      ]);

      // Construir historial de flujo
      const flujo = [];
      const clavesArr = Array.isArray(queja.claves_flujo)
        ? queja.claves_flujo
        : [];
      const fechasArr = Array.isArray(queja.fechas_flujo)
        ? queja.fechas_flujo
        : [];
      for (let i = 0; i < Math.max(clavesArr.length, fechasArr.length); i++) {
        flujo.push({
          id_clave: clavesArr[i] ?? null,
          fecha: fechasArr[i] ?? null,
        });
      }

      res.json({
        success: true,
        data: { queja, pruebas, trabajos, flujo },
      });
    } catch (error) {
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

        // 🔹 Lógica de flujo inicial (id_clave + fecha)
        if (bodyData.id_clave && bodyData.fecha) {
          bodyData.claves_flujo = [bodyData.id_clave];
          bodyData.fechas_flujo = [new Date(bodyData.fecha)];
        }

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
   *                 enum: [Abierta, En Proceso, Pendiente, Resuelto, Cerrada]
   *                 example: "En Proceso"
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

        // 🔹 Si se actualiza estado, validar transición (opcional: lógica de negocio)
        if (updateData.estado) {
          const validTransitions = {
            Abierta: ["En Proceso", "Cerrada"],
            "En Proceso": ["Resuelto", "Pendiente", "Cerrada"],
            Pendiente: ["En Proceso", "Cerrada"],
            Resuelto: ["Cerrada"],
            Cerrada: [], // Terminal
          };

          const current = await Queja.findByPk(id, { attributes: ["estado"] });
          if (
            current &&
            !validTransitions[current.estado]?.includes(updateData.estado)
          ) {
            return next(
              apiErrors.badRequest("ERROR.ESTADO.TRANSICION.INVALIDA"),
            );
          }
        }

        const [affectedRows] = await Queja.update(updateData, {
          where: { id_queja: parseInt(id) },
          returning: true,
        });

        if (affectedRows === 0) {
          return next(apiErrors.notFound("Queja"));
        }

        const updatedData = await Queja.findByPk(id);

        res.json({
          success: true,
          message: "ERROR.QUEJA.UPDATED",
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

      // 🔹 Recomendación: usar soft delete en vez de eliminación física
      // const affectedRows = await Queja.destroy({ where: { id_queja: id } });

      // Alternativa con soft delete (requiere campo deleted_at en el modelo):
      const affectedRows = await Queja.update(
        { estado: "Eliminada", deleted_at: new Date() },
        { where: { id_queja: parseInt(id) } },
      );

      if (affectedRows[0] === 0) {
        return next(apiErrors.notFound("Queja"));
      }

      res.json({
        success: true,
        message: "ERROR.QUEJA.DELETED",
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = QuejaController;
