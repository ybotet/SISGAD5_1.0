const { Trabajador, Grupow } = require('../models');
const { Op } = require('sequelize');

const TrabajadorController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbTrabajador
   * @access  Public
   */
  async getAll(req, res) {
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
      console.error('Error en TrabajadorController.getAll:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbTrabajador/:id
   * @access  Public
   */
  async getById(req, res) {
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
        return res.status(404).json({
          success: false,
          error: 'Trabajador no encontrado'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error en TrabajadorController.getById:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbTrabajador
   * @access  Public
   */
  async create(req, res) {
    try {
      const data = await Trabajador.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'Trabajador creado exitosamente'
      });
    } catch (error) {
      console.error('Error en TrabajadorController.create:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error creando Trabajador',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbTrabajador/:id
   * @access  Public
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Trabajador.update(req.body, {
        where: { id_trabajador: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Trabajador no encontrado'
        });
      }

      const updatedData = await Trabajador.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: 'Trabajador actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en TrabajadorController.update:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error actualizando Trabajador'
      });
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbTrabajador/:id
   * @access  Public
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const affectedRows = await Trabajador.destroy({
        where: { id_trabajador: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Trabajador no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Trabajador eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en TrabajadorController.delete:', error);
      res.status(500).json({
        success: false,
        error: 'Error eliminando Trabajador'
      });
    }
  },

  async getProbadores(req, res) {
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
        console.error('Error en TrabajadorController.getProbadores:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
}
};




module.exports = TrabajadorController;
