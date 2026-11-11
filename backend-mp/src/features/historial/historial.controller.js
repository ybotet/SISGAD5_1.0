const { getHistorial } = require("./HistorialService");
const apiErrors = require("../../shared/utils/apiErrors");

// Obtener modelos mockeados/reales desde el índice de features
const models = require("../index");

const HistorialController = {
  /**
   * @desc    Obtener historial del teléfono (quejas, movimientos, recorridos)
   * @route   GET /api/tbTelefono/:id/historial
   * @access  Public
   */
  async telefono(req, res, next) {
    try {
      const { id } = req.params;
      const { limit } = req.query;
      const result = await getHistorial("telefono", id, {
        limit: limit ? parseInt(limit, 10) : 50,
        models,
      });
      res.json({
        success: true,
        data: result,
        message: `Historial de teléfono ${id}`,
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * @desc    Obtener historial de la línea (quejas, movimientos, recorridos)
   * @route   GET /api/tbLinea/:id/historial
   * @access  Public
   */
  async linea(req, res, next) {
    try {
      const { id } = req.params;
      const { limit } = req.query;
      const result = await getHistorial("linea", id, {
        limit: limit ? parseInt(limit, 10) : 50,
        models,
      });
      res.json({
        success: true,
        data: result,
        message: `Historial de línea ${id}`,
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * @desc    Obtener historial de la pizarra (quejas asociadas)
   * @route   GET /api/tbPizarra/:id/historial
   * @access  Public
   */
  async pizarra(req, res, next) {
    try {
      const { id } = req.params;
      const { limit } = req.query;
      const result = await getHistorial("pizarra", id, {
        limit: limit ? parseInt(limit, 10) : 50,
        models,
      });
      res.json({
        success: true,
        data: result,
        message: `Historial de pizarra ${id}`,
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = HistorialController;
