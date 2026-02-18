const { User_Roles } = require('../models');
const { Op } = require('sequelize');

const UserRolesController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbUserRoles
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
            { id_usuario: searchNum },
            { id_rol: searchNum }
          ];
        }
      }

      // Agregar otros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await User_Roles.findAndCountAll({
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
      console.error('Error en UserRolesController.getAll:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbUserRoles/:id
   * @access  Public
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await User_Roles.findByPk(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'UserRoles no encontrado'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error en UserRolesController.getById:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbUserRoles
   * @access  Public
   */
  async create(req, res) {
    try {
      const data = await User_Roles.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: 'UserRoles creado exitosamente'
      });
    } catch (error) {
      console.error('Error en UserRolesController.create:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error creando UserRoles',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbUserRoles/:id
   * @access  Public
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const [affectedRows] = await User_Roles.update(req.body, {
        where: { id_usuario: id, id_rol: req.body.id_rol } // Asumiendo composite key
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'UserRoles no encontrado'
        });
      }

      const updatedData = await User_Roles.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: 'UserRoles actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en UserRolesController.update:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(400).json({
        success: false,
        error: 'Error actualizando UserRoles'
      });
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbUserRoles/:id
   * @access  Public
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const affectedRows = await User_Roles.destroy({
        where: { id_usuario: id, id_rol: req.body.id_rol } // Asumiendo composite key
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'UserRoles no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'UserRoles eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en UserRolesController.delete:', error);
      res.status(500).json({
        success: false,
        error: 'Error eliminando UserRoles'
      });
    }
  }
};

module.exports = UserRolesController;