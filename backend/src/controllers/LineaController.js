const { Linea } = require('../models');
const { Op } = require('sequelize');
const { Recorrido, Queja } = require('../models');

const LineaController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbLinea
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
          { clavelinea: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Agregar otros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Linea.findAndCountAll({
        where: whereClause,
        include: [{
          association: 'tb_tipolinea',
          attributes: ['id_tipolinea', 'tipo']
        },
        {
          association: 'tb_propietario',
          attributes: ['id_propietario', 'nombre']
        },
        {
          association: 'tb_senalizacion',
          attributes: ['id_senalizacion', 'senalizacion']
        },

        ],

        limit: parseInt(limit),
        offset: offset,
        order: [[sortBy, sortOrder.toUpperCase()]]
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
      console.error('Error en LineaController.getAll:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbLinea/:id
   * @access  Public
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const linea = await Linea.findByPk(id, {
        include: [
          {
            association: 'tb_tipolinea',
            attributes: ['id_tipolinea', 'tipo']
          }
        ]
      });

      if (!linea) {
        return res.status(404).json({
          success: false,
          error: 'Linea no encontrado'
        });
      }

      const recorridos = await Recorrido.findAll({
        where: { id_telefono: id },
        include: [{
          association: 'tb_cable',
          attributes: ['id_cable', 'numero']
        }, {
          association: 'tb_planta',
          attributes: ['id_planta', 'planta']
        }, {
          association: 'tb_sistema',
          attributes: ['id_sistema', 'sistema']
        }, {
          association: 'tb_propietario',
          attributes: ['id_propietario', 'nombre']
        }],
        limit: 100 // o paginación
      });

      const quejas = await Queja.findAll({
        where: { id_telefono: id },
        // include: [
        //   { model: Cable, attributes: ['id_cable', 'numero'] },
        //   { model: Planta, attributes: ['id_planta', 'planta'] }
        // ],
        limit: 100 // o paginación
      });

      res.json({
        success: true,
        data: {
          linea,
          recorridos,
          quejas
        }
      });
    } catch (error) {
      console.error('Error en LineaController.getById:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbLinea
   * @access  Public
   */
  async create(req, res) {
    try {
      const data = await Linea.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'Linea creado exitosamente'
      });
    } catch (error) {
      console.error('Error en LineaController.create:', error);

      if (error.name === 'SequelizeValidationError') {
        const mensajes = error.errors.map(err => err.message).join('. ');
        return res.status(400).json({
          success: false,
          message: mensajes,
          error: mensajes,
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        message: 'Error creando línea',
        error: 'Error creando Linea',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbLinea/:id
   * @access  Public
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Linea.update(req.body, {
        where: { id_linea: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Linea no encontrado'
        });
      }

      const updatedData = await Linea.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: 'Linea actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en LineaController.update:', error);

      if (error.name === 'SequelizeValidationError') {
        const mensajes = error.errors.map(err => err.message).join('. ');
        return res.status(400).json({
          success: false,
          message: mensajes,
          error: mensajes,
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        message: 'Error actualizando línea',
        error: 'Error actualizando Linea'
      });
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbLinea/:id
   * @access  Public
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const affectedRows = await Linea.destroy({
        where: { id_linea: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Linea no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Linea eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en LineaController.delete:', error);
      res.status(500).json({
        success: false,
        error: 'Error eliminando Linea'
      });
    }
  }
};

module.exports = LineaController;
