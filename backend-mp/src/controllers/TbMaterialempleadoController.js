const { TbMaterialempleado } = require('../models');
const { Op } = require('sequelize');

const TbMaterialempleadoController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbMaterialempleado
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
        // Solo tiene IDs
        if (!isNaN(search)) {
          const searchNum = parseInt(search);
          whereClause[Op.or] = [
            { id_material: searchNum },
            { id_empleado: searchNum }
          ];
        }
      }

      // Agregar otros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await TbMaterialempleado.findAndCountAll({
        where: whereClause,
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
      console.error('Error en TbMaterialempleadoController.getAll:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbMaterialempleado/:id
   * @access  Public
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await TbMaterialempleado.findByPk(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'TbMaterialempleado no encontrado'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error en TbMaterialempleadoController.getById:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbMaterialempleado
   * @access  Public
   */
  async create(req, res) {
    try {
      const data = await TbMaterialempleado.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'TbMaterialempleado creado exitosamente'
      });
    } catch (error) {
      console.error('Error en TbMaterialempleadoController.create:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error creando TbMaterialempleado',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbMaterialempleado/:id
   * @access  Public
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const [affectedRows] = await TbMaterialempleado.update(req.body, {
        where: { id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'TbMaterialempleado no encontrado'
        });
      }

      const updatedData = await TbMaterialempleado.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: 'TbMaterialempleado actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en TbMaterialempleadoController.update:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error actualizando TbMaterialempleado'
      });
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbMaterialempleado/:id
   * @access  Public
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const affectedRows = await TbMaterialempleado.destroy({
        where: { id }
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'TbMaterialempleado no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'TbMaterialempleado eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en TbMaterialempleadoController.delete:', error);
      res.status(500).json({
        success: false,
        error: 'Error eliminando TbMaterialempleado'
      });
    }
  }
};

module.exports = TbMaterialempleadoController;
