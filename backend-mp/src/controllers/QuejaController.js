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
   * @desc    Obtener todos los registros (CON validación Zod en query)
   * @route   GET /api/mp/queja
   * @access  Private (auth required)
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
   * @desc    Obtener un registro por ID
   * @route   GET /api/mp/queja/:id
   * @access  Private
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

  /**
   * @desc    Crear nuevo registro (CON validación Zod en body)
   * @route   POST /api/mp/queja
   * @access  Private
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
   * @desc    Actualizar registro (CON validación Zod parcial)
   * @route   PUT /api/mp/queja/:id
   * @access  Private
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
