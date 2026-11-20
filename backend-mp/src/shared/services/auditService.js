const { sequelize } = require("../../shared/config/database");

/**
 * Registra una entrada en el trail de auditoría (tb_auditoria).
 * Debe llamarse DENTRO de la misma transacción que la operación auditada
 * para garantizar atomicidad (si la operación falla, no queda rastro).
 *
 * @param {Object} params
 * @param {string} params.entidad - Nombre de la entidad (ej: 'Queja', 'Trabajo', 'Linea', 'Pizarra')
 * @param {number} params.id_entidad - PK de la entidad afectada
 * @param {string} params.accion - Acción realizada: 'CREATE' | 'UPDATE' | 'DELETE' | 'ASIGNAR' | 'CERRAR' | 'ESTADO'
 * @param {string} [params.desde_estado] - Estado anterior (para transiciones)
 * @param {string} [params.hacia_estado] - Estado nuevo (para transiciones)
 * @param {number} params.usuario_id - ID del usuario que realiza la acción (req.userId)
 * @param {Object} [params.detalle] - Objeto con datos adicionales (se guarda como JSONB)
 * @param {string} [params.ip] - IP del cliente (req.ip)
 * @param {Object} [params.transaction] - Transacción Sequelize activa (opcional pero recomendado)
 * @returns {Promise<Object>} La fila insertada
 */
async function logAuditoria({
  entidad,
  id_entidad,
  accion,
  desde_estado = null,
  hacia_estado = null,
  usuario_id,
  detalle = null,
  ip = null,
  transaction = null,
}) {
  const query = `
    INSERT INTO tb_auditoria (entidad, id_entidad, accion, desde_estado, hacia_estado, usuario_id, detalle, ip, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    RETURNING id_auditoria, entidad, id_entidad, accion, desde_estado, hacia_estado, usuario_id, detalle, ip, created_at;
  `;

  const replacements = [
    entidad,
    id_entidad,
    accion,
    desde_estado,
    hacia_estado,
    usuario_id,
    detalle ? JSON.stringify(detalle) : null,
    ip,
  ];

  const options = { replacements };
  if (transaction) {
    options.transaction = transaction;
  }

  const [result] = await sequelize.query(query, options);
  return result[0];
}

/**
 * Helper para extraer IP del request (considera proxies)
 */
function getClientIp(req) {
  return req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || null;
}

module.exports = { logAuditoria, getClientIp };