const { Trabajador, Grupow } = require('../models');
const { Op } = require('sequelize');
const apiErrors = require('../utils/apiErrors');

const TrabajadorController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbTrabajador
   * @access  Public
   */
  async getAll(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        search = '',
        ...filters
      } = req.query;

      const offset = (page - 1) * limit;

      // Construir where clause para búsqueda
      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { nombre: { [Op.iLike]: `%${search}%` } },
          { cargo: { [Op.iLike]: `%${search}%` } },
          { clave_trabajador: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Agregar otros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Trabajador.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: offset,
        order: [[sortBy, sortOrder.toUpperCase()]],
        include: [
          {
            model: Grupow,
            as: 'tb_grupow',
            attributes: ['id_grupow', 'grupo']
          }
        ]
      });

      res.json({
        success: true,
        data: data.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: data.count,
          pages: Math.ceil(data.count / limit)
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbTrabajador/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Trabajador.findByPk(id, {
        include: [
          {
            model: Grupow,
            as: 'tb_grupow',
            attributes: ['id_grupow', 'grupo']
          }
        ]
      });

      if (!data) {
        return next(apiErrors.notFound('Trabajador'));
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbTrabajador
   * @access  Public
   */
  async create(req, res, next) {
    try {
      const data = await Trabajador.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'Trabajador creado exitosamente'
      });
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const mensajes =
          error.errors?.map(err => err.message).join('. ') || error.message;
        return next(apiErrors.badRequest(mensajes));
      }

      return next(error);
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbTrabajador/:id
   * @access  Public
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Trabajador.update(req.body, {
        where: { id_trabajador: id }
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound('Trabajador'));
      }

      const updatedData = await Trabajador.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: 'Trabajador actualizado exitosamente'
      });
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const mensajes =
          error.errors?.map(err => err.message).join('. ') || error.message;
        return next(apiErrors.badRequest(mensajes));
      }

      return next(error);
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbTrabajador/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Trabajador.destroy({
        where: { id_trabajador: id }
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound('Trabajador'));
      }

      res.json({
        success: true,
        message: 'Trabajador eliminado exitosamente'
      });
    } catch (error) {
      return next(error);
    }
  },

  async getProbadores(req, res, next) {
    try {
        const data = await Trabajador.findAll({
          include: [{
            model: Grupow, // Asegúrate de importar el modelo Grupow
            as: 'tb_grupow', // Usa el alias que hayas definido en la asociación
            required: true, // Hace un INNER JOIN
            where: {
                grupo: 'Probadores'
            }
          }]
        });
        if (!data || data.length === 0) {
          return res.json({
              success: true,
              data: [],
              message: 'No se encontraron probadores'
          });
      }
        // console.log(data)
        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        return next(error);
    }
}
};




module.exports = TrabajadorController;
