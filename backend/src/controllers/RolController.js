const { Rol, Permiso } = require('../models');
const { Op } = require('sequelize');

const RolController = {
  async obtenerRoles(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (search) {
        where[Op.or] = [
          { nombre: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const data = await Rol.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: [['nombre', 'ASC']],
        include: [{ model: Permiso, as: 'tb_permiso', through: { attributes: [] } }]
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
      console.error('Error en RolController.obtenerRoles:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor', message: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
  }
};

module.exports = RolController;
