const { Queja, Prueba, Trabajo, Resultadoprueba, Trabajador, Cable, Clave } = require('../models');
const { Op } = require('sequelize');


const QuejaController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbQueja
   * @access  Public
   */
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'fecha',
        sortOrder = 'DESC',
        search = '',
        ...filters
      } = req.query;

      const offset = (page - 1) * limit;

      // Configuración de includes
      const includeConfig = [{
        association: 'tb_telefono',
        attributes: ['id_telefono', 'telefono'],
        required: false
      }, {
        association: 'tb_linea',
        attributes: ['id_linea', 'clavelinea'],
        required: false
      }, {
        association: 'tb_tipoqueja',
        attributes: ['id_tipoqueja', 'tipoqueja'],
        required: false
      }, {
        association: 'tb_pizarra',
        attributes: ['id_pizarra', 'nombre'],
        required: false
      }, {
        association: 'tb_clave',
        attributes: ['id_clave', 'clave'],
        required: false
      }, {
        association: 'tb_trabajador',
        attributes: ['id_trabajador', 'clave_trabajador'],
        required: false
      }];

      // Construir where clause para búsqueda
      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { num_reporte: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Agregar otros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Queja.findAndCountAll({
        where: whereClause,
        include: includeConfig,
        limit: parseInt(limit),
        offset: offset,
        order: [[sortBy, sortOrder.toUpperCase()]],
        distinct: true
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
      console.error('Error en QuejaController.getAll:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbQueja/:id
   * @access  Public
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const queja = await Queja.findByPk(id, {
        include: [{
          association: 'tb_telefono',
          attributes: ['id_telefono', 'telefono']
        }, {
          association: 'tb_linea',
          attributes: ['id_linea', 'clavelinea']
        }, {
          association: 'tb_tipoqueja',
          attributes: ['id_tipoqueja', 'tipoqueja']
        }, {
          association: 'tb_pizarra',
          attributes: ['id_pizarra', 'nombre']
        }, {
          association: 'tb_clave',
          attributes: ['id_clave', 'clave']
        }, {
          association: 'tb_trabajador',
          attributes: ['id_trabajador', 'clave_trabajador']
        }]
      });

      if (!queja) {
        return res.status(404).json({
          success: false,
          error: 'Queja no encontrado'
        });
      }

      const pruebas = await Prueba.findAll({
        where: { id_queja: id },
        include: [{
          association: 'tb_resultadoprueba',
          attributes: ['id_resultadoprueba', 'resultado']
        }, {
          association: 'tb_cable',
          attributes: ['id_cable', 'numero']
        }, {
          association: 'tb_clave',
          attributes: ['id_clave', 'clave']
        }, {
          association: 'tb_trabajador',
          attributes: ['id_trabajador', 'clave_trabajador']
        }]
      });

      const trabajos = await Trabajo.findAll({
        where: { id_queja: id },
        include: [{
          association: 'tb_clave',
          attributes: ['id_clave', 'clave']
        }, {
          association: 'tb_trabajador',
          attributes: ['id_trabajador', 'clave_trabajador']
        }]
      });


      res.json({
        success: true,
        data: { queja, pruebas, trabajos }
      });
    } catch (error) {
      console.error('Error en QuejaController.getById:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbQueja
   * @access  Public
   */
  async create(req, res) {
    try {
      const data = await Queja.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'Queja creado exitosamente'
      });
    } catch (error) {
      console.error('Error en QuejaController.create:', error);

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
        message: 'Error creando queja',
        error: 'Error creando Queja',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbQueja/:id
   * @access  Public
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Queja.update(req.body, {
        where: { id_queja: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Queja no encontrado'
        });
      }

      const updatedData = await Queja.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: 'Queja actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en QuejaController.update:', error);

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
        message: 'Error actualizando queja',
        error: 'Error actualizando Queja'
      });
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbQueja/:id
   * @access  Public
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const affectedRows = await Queja.destroy({
        where: { id_queja: id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Queja no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Queja eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en QuejaController.delete:', error);
      res.status(500).json({
        success: false,
        error: 'Error eliminando Queja'
      });
    }
  }
};

module.exports = QuejaController;
