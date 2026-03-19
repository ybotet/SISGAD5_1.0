const { Prueba, Queja } = require("../models");
const { Op } = require("sequelize");
const { addFlowEntry, removeFlowEntry } = require("../utils/quejaFlow");
const apiErrors = require("../utils/apiErrors");

const PruebaController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbPrueba
   * @access  Public
   */
  async getAll(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "ASC",
        search = "",
        ...filters
      } = req.query;

      const offset = (page - 1) * limit;

      // Construir where clause para búsqueda
      const whereClause = {};
      if (search) {
        // Prueba solo tiene IDs y fechas, buscar por ID si es número
        if (!isNaN(search)) {
          const searchNum = parseInt(search);
          whereClause[Op.or] = [
            { id_prueba: searchNum },
            { id_resultado: searchNum },
            { id_trabajador: searchNum },
            { id_cable: searchNum },
            { id_clave: searchNum },
            { id_queja: searchNum },
          ];
        }
      }

      // Agregar otros filtros
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Prueba.findAndCountAll({
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
      return next(error);
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbPrueba/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Prueba.findByPk(id);

      if (!data) {
        return next(apiErrors.notFound("Prueba"));
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
   * @desc    Crear nuevo registro
   * @route   POST /api/tbPrueba
   * @access  Public
   */
  async create(req, res, next) {
    try {
      const data = await Prueba.create(req.body);

      // actualizar flujo de la queja asociada
      if (data.id_queja) {
        await addFlowEntry(data.id_queja, data.id_clave, data.fecha);
      }

      // Actualizando el estado de la queja
      await Queja.update(
        { estado: "En Proceso" },
        {
          where: { id_queja: data.id_queja },
          validate: false, // Esto omite las validaciones del modelo
          individualHooks: false,
        },
      );

      res.status(201).json({
        success: true,
        data,
        message: "Prueba creado exitosamente",
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

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbPrueba/:id
   * @access  Public
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;

      // obtener valores antiguos para mantener el flujo
      const existing = await Prueba.findByPk(id);
      if (!existing) {
        return next(apiErrors.notFound("Prueba"));
      }
      const oldQueja = existing.id_queja;
      const oldClave = existing.id_clave;
      const oldFecha = existing.fecha;

      const [affectedRows] = await Prueba.update(req.body, {
        where: { id_prueba: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Prueba"));
      }

      const updatedData = await Prueba.findByPk(id);

      // si cambió alguna de las propiedades que afectan al flujo, ajustar arrays
      if (
        oldQueja &&
        (oldQueja !== updatedData.id_queja ||
          oldClave !== updatedData.id_clave ||
          oldFecha !== updatedData.fecha)
      ) {
        await removeFlowEntry(oldQueja, oldClave, oldFecha);
      }
      if (updatedData.id_queja) {
        await addFlowEntry(
          updatedData.id_queja,
          updatedData.id_clave,
          updatedData.fecha,
        );
      }

      res.json({
        success: true,
        data: updatedData,
        message: "Prueba actualizado exitosamente",
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

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbPrueba/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      // obtener antes de borrar para limpiar flujo
      const existing = await Prueba.findByPk(id);
      if (!existing) {
        return next(apiErrors.notFound("Prueba"));
      }

      await removeFlowEntry(
        existing.id_queja,
        existing.id_clave,
        existing.fecha,
      );

      const affectedRows = await Prueba.destroy({
        where: { id_prueba: id },
      });

      res.json({
        success: true,
        message: "Prueba eliminado exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = PruebaController;
