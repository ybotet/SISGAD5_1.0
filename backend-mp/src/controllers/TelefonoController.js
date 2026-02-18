const { Telefono } = require('../models');
const { Op } = require('sequelize');
const { Recorrido, Queja, Cable, Planta } = require('../models');

const TelefonoController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbTelefono
   * @access  Public
   */
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'updatedAt',
        sortOrder = 'DESC',
        search = '',
        ...filters
      } = req.query;

      const offset = (page - 1) * limit;

      // Construir where clause para búsqueda
      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { telefono: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Agregar otros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Telefono.findAndCountAll({
        where: whereClause,
        include: [{
          association: 'tb_clasificacion',
          attributes: ['id_clasificacion', 'nombre']
        }, {
          association: 'tb_mando',
          attributes: ['id_mando', 'mando']
        }],
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
      console.error('Error en TelefonoController.getAll:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbTelefono/:id
   * @access  Public
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const telefono = await Telefono.findByPk(id, {
        include: [{
          association: 'tb_clasificacion',
          attributes: ['id_clasificacion', 'nombre']
        }, {
          association: 'tb_mando',
          attributes: ['id_mando', 'mando']
        }],
      });

      if (!telefono) {
        return res.status(404).json({
          success: false,
          error: 'Telefono no encontrado'
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
      // data.dataValues.recorridos = recorridos;

      const quejas = await Queja.findAll({
        where: { id_telefono: id },
        include: [
          {
            association: 'tb_trabajador',
            attributes: ['id_trabajador', 'clave_trabajador']
          }
        ],
        limit: 100 // o paginación
      });

      res.json({
        success: true,
        data: {
          telefono,
          recorridos,
          quejas
        }
      });
    } catch (error) {
      console.error('Error en TelefonoController.getById:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbTelefono
   * @access  Public
   */
  async create(req, res) {
    try {
      const data = await Telefono.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'Telefono creado exitosamente'
      });
    } catch (error) {
      console.error('Error en TelefonoController.create:', error);

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
        message: 'Error creando teléfono',
        error: 'Error creando Telefono',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbTelefono/:id
   * @access  Public
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Telefono.update(req.body, {
        where: { id_telefono: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Telefono no encontrado'
        });
      }

      const updatedData = await Telefono.findByPk(id, {
        include: [{
          association: 'tb_clasificacion',
          attributes: ['id_clasificacion', 'nombre']
        }, {
          association: 'tb_mando',
          attributes: ['id_mando', 'mando']
        }],
      });

      res.json({
        success: true,
        data: updatedData,
        message: 'Telefono actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en TelefonoController.update:', error);

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
        message: 'Error actualizando teléfono',
        error: 'Error actualizando Telefono'
      });
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbTelefono/:id
   * @access  Public
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const affectedRows = await Telefono.destroy({
        where: { id_telefono: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Telefono no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Telefono eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en TelefonoController.delete:', error);
      res.status(500).json({
        success: false,
        error: 'Error eliminando Telefono'
      });
    }
  }
};

module.exports = TelefonoController;
