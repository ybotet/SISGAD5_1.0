const { Telefono } = require("../models");
const { Op } = require("sequelize");
const { Recorrido, Queja, Cable, Planta } = require("../models");
const apiErrors = require("../utils/apiErrors");

const TelefonoController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbTelefono
   * @access  Public
   */
  async getAll(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "updatedAt",
        sortOrder = "DESC",
        search = "",
        ...filters
      } = req.query;

      const offset = (page - 1) * limit;

      // Construir where clause para búsqueda
      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [{ telefono: { [Op.iLike]: `%${search}%` } }];
      }

      // Agregar otros filtros
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Telefono.findAndCountAll({
        where: whereClause,
        include: [
          {
            association: "tb_clasificacion",
            attributes: ["id_clasificacion", "nombre"],
          },
          {
            association: "tb_mando",
            attributes: ["id_mando", "mando"],
          },
        ],
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
   * @route   GET /api/tbTelefono/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const telefono = await Telefono.findByPk(id, {
        include: [
          {
            association: "tb_clasificacion",
            attributes: ["id_clasificacion", "nombre"],
          },
          {
            association: "tb_mando",
            attributes: ["id_mando", "mando"],
          },
        ],
      });

      if (!telefono) {
        return next(apiErrors.notFound("Telefono"));
      }

      const recorridos = await Recorrido.findAll({
        where: { id_telefono: id },
        include: [
          {
            association: "tb_cable",
            attributes: ["id_cable", "numero"],
          },
          {
            association: "tb_planta",
            attributes: ["id_planta", "planta"],
          },
          {
            association: "tb_sistema",
            attributes: ["id_sistema", "sistema"],
          },
          {
            association: "tb_propietario",
            attributes: ["id_propietario", "nombre"],
          },
        ],
        limit: 100, // o paginación
      });
      // data.dataValues.recorridos = recorridos;

      const quejas = await Queja.findAll({
        where: { id_telefono: id },
        include: [
          {
            association: "tb_trabajador",
            attributes: ["id_trabajador", "clave_trabajador"],
          },
        ],
        limit: 100, // o paginación
      });

      res.json({
        success: true,
        data: {
          telefono,
          recorridos,
          quejas,
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbTelefono
   * @access  Public
   */
  async create(req, res, next) {
    try {
      const data = await Telefono.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: "Telefono creado exitosamente",
      });
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        const mensajes = error.errors.map((err) => err.message).join(". ");
        return next(apiErrors.badRequest(mensajes));
      }

      if (error.name === "SequelizeUniqueConstraintError") {
        return next(apiErrors.conflict("El teléfono ya existe"));
      }

      return next(error);
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbTelefono/:id
   * @access  Public
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Telefono.update(req.body, {
        where: { id_telefono: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Telefono"));
      }

      const updatedData = await Telefono.findByPk(id, {
        include: [
          {
            association: "tb_clasificacion",
            attributes: ["id_clasificacion", "nombre"],
          },
          {
            association: "tb_mando",
            attributes: ["id_mando", "mando"],
          },
        ],
      });

      res.json({
        success: true,
        data: updatedData,
        message: "Telefono actualizado exitosamente",
      });
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        const mensajes = error.errors.map((err) => err.message).join(". ");
        return next(apiErrors.badRequest(mensajes));
      }

      return next(error);
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbTelefono/:id
   * @access  Public
   */
  async darBaja(req, res, next) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Telefono.update(
        { esbaja: true },
        {
          where: { id_telefono: id },
        },
      );

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Telefono"));
      }

      const updatedData = await Telefono.findByPk(id, {
        include: [
          {
            association: "tb_clasificacion",
            attributes: ["id_clasificacion", "nombre"],
          },
          {
            association: "tb_mando",
            attributes: ["id_mando", "mando"],
          },
        ],
      });

      res.json({
        success: true,
        data: updatedData,
        message: "Telefono dado de baja exitosamente",
      });
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        const mensajes = error.errors.map((err) => err.message).join(". ");
        return next(apiErrors.badRequest(mensajes));
      }

      return next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Telefono.destroy({
        where: { id_telefono: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Telefono"));
      }

      res.json({
        success: true,
        message: "Telefono eliminado exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = TelefonoController;
