const apiError = require("../utils/apiErrors");
const { Asignacion, AsignacionTrabajadores, Queja } = require("../models");
const { Op } = require("sequelize");
const { parseListParams } = require("../utils/parseListParams");
const {
  createAsignacionSchema,
  updateAsignacionSchema,
  listAsignacionSchema,
} = require("../validations/asignacion.schemas");
const validate = require("../middleware/validate");
const { create } = require("./TrabajoTrabajadoresController");
const { get } = require("../routes/asignacion");

const AsignacionController = {
  /**
   * @desc    Obtener todos los registros (CON validación Zod en query)
   * @route   GET /api/asignacion
   * @access  Public
   */
  create: [
    validate(createAsignacionSchema),
    async (req, res, next) => {
      try {
        const data = await Asignacion.create(req.body);

        if (req.body.trabajadores && req.body.trabajadores.length > 0) {
          const trabajadoresData = req.body.trabajadores.map((trabajador) => ({
            id_asignacion: data.id_asignacion,
            id_trabajador: trabajador.id_trabajador,
          }));
          await AsignacionTrabajadores.bulkCreate(trabajadoresData);
        }

        // Actualizando el estado de la queja
        await Queja.update(
          { estado: "Asignada" },
          {
            where: { id_queja: data.id_queja },
            validate: false, // Esto omite las validaciones del modelo
            individualHooks: false,
          },
        );

        res.status(201).json({
          success: true,
          data,
          message: "Asignacion creada exitosamente",
        });
      } catch (error) {
        return next(error);
      }
    },
  ],

  getAll: [
    validate(listAsignacionSchema, "query"),
    async (req, res, next) => {
      try {
        const { limit, offset } = parseListParams(req.query);
        const data = await Asignacion.findAll({
          limit,
          offset,
        });
        if (data.length === 0) {
          return next(apiError.notFound("Asignacion"));
        }
        data.forEach((asignacion) => {
          asignacion.dataValues.trabajadores = [];
        });

        for (let i = 0; i < data.length; i++) {
          const trabajadores = await AsignacionTrabajadores.findAll({
            where: { id_asignacion: data[i].id_asignacion },
          });
          data[i].dataValues.trabajadores = trabajadores;
        }

        res.json({
          success: true,
          data,
        });
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
      data.dataValues.trabajadores = [];

      const trabajadores = await AsignacionTrabajadores.findAll({
        where: { id_asignacion: data.id_asignacion },
      });
      data.dataValues.trabajadores = trabajadores;

      res.json({
        success: true,
        data,
      });
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
      await Asignacion.destroy({
        where: { id_asignacion: req.params.id },
      });
      res.json({
        success: true,
        message: "Asignacion eliminada exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = AsignacionController;
