const { Trabajo } = require("../models");
const { addFlowEntry, removeFlowEntry } = require("../utils/quejaFlow");
const { Op } = require("sequelize");

const TrabajoController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbTrabajo
   * @access  Public
   */
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "DESC",
        search = "",
        ...filters
      } = req.query;

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

      // Agregar otros filtros
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Trabajo.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: offset,
        order: [[sortBy, sortOrder.toUpperCase()]],
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
      console.error("Error en TrabajoController.getAll:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
        message:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbTrabajo/:id
   * @access  Public
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await Trabajo.findByPk(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          error: "Trabajo no encontrado",
        });
      }

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("Error en TrabajoController.getById:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
      });
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbTrabajo
   * @access  Public
   */
  async create(req, res) {
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
      console.error("Error en TrabajoController.create:", error);

      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          success: false,
          error: "Error de validación",
          details: error.errors.map((err) => err.message),
        });
      }

      res.status(400).json({
        success: false,
        error: "Error creando Trabajo",
        message:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbTrabajo/:id
   * @access  Public
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const existing = await Trabajo.findByPk(id);
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, error: "Trabajo no encontrado" });
      }

      // valores antiguos para mantener sincronía del flujo
      const oldQueja = existing.id_queja;
      const oldClave = existing.estado;
      const oldFecha = existing.fecha;

      const [affectedRows] = await Trabajo.update(req.body, {
        where: { id_trabajo: id },
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: "Trabajo no encontrado",
        });
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
      console.error("Error en TrabajoController.update:", error);

      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          success: false,
          error: "Error de validación",
          details: error.errors.map((err) => err.message),
        });
      }

      res.status(400).json({
        success: false,
        error: "Error actualizando Trabajo",
      });
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbTrabajo/:id
   * @access  Public
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const existing = await Trabajo.findByPk(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: "Trabajo no encontrado",
        });
      }

      // limpiar flujo asociado antes de eliminar
      await removeFlowEntry(existing.id_queja, existing.estado, existing.fecha);

      const affectedRows = await Trabajo.destroy({
        where: { id_trabajo: id },
      });

      res.json({
        success: true,
        message: "Trabajo eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error en TrabajoController.delete:", error);
      res.status(500).json({
        success: false,
        error: "Error eliminando Trabajo",
      });
    }
  },
};

module.exports = TrabajoController;
