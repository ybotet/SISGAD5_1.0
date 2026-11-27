const { Clave } = require("../../features");

/**
 * Estados de Trabajo modelados sobre el catálogo `tb_clave` (TASK-220-04 / flujo Asignada→Trabajo).
 *
 * El modelo real no tiene un enum de estado: `tb_trabajo.estado` es un FK a `tb_clave`.
 * Para el flujo "Asignada → Trabajo → Resuelta|Pendiente" usamos tres claves estables:
 *   - ABIERTO  (es_pendiente=false)  → trabajo recién generado al asignar.
 *   - RESUELTO (es_pendiente=false)  → trabajo completado; la queja pasa a Resuelta.
 *   - PEND     (es_pendiente=true)   → trabajo pospuesto; la queja pasa a Pendiente.
 *
 * El código de la clave se mantiene <= 8 chars (restricción de `tb_clave.clave`);
 * la etiqueta legible se guarda en `descripcion`.
 */
const CODIGOS = {
  ABIERTO: { clave: "ABIERTO", descripcion: "Abierto", es_pendiente: false },
  RESUELTO: { clave: "RESUELTO", descripcion: "Resuelto", es_pendiente: false },
  PEND: { clave: "PEND", descripcion: "Pendiente", es_pendiente: true },
};

/**
 * Obtiene (o crea de forma idempotente) la clave de trabajo indicada.
 *
 * NO se usa `findOrCreate` porque, dentro de la transacción de la operación, su
 * INSERT con `DEFAULT` en la PK falla cuando la secuencia de `tb_clave` está
 * desincronizada (tabla poblada manualmente): el re-SELECT por `clave` no
 * encuentra nada y Sequelize relanza `SequelizeUniqueConstraintError`.
 *
 * En su lugar: 1) reutilizar la fila si existe; 2) si no, crearla con un
 * `id_clave` explícito (max+1) para no depender de la secuencia.
 *
 * @param {'ABIERTO'|'RESUELTO'|'PEND'} tipo
 * @param {object} [transaction] transacción Sequelize activa
 * @returns {Promise<number>} id_clave
 */
async function getEstadoClave(tipo, transaction) {
  const def = CODIGOS[tipo];
  if (!def) throw new Error(`Estado de trabajo desconocido: ${tipo}`);

  const opts = transaction ? { transaction } : {};

  // 1) Reutilizar la clave si ya existe.
  const existente = await Clave.findOne({ where: { clave: def.clave }, ...opts });
  if (existente) return existente.id_clave;

  // 2) Crearla con id explícito (max+1) para no depender de la secuencia.
  const maxId = await Clave.max("id_clave", opts);
  const nuevoId = (maxId || 0) + 1;
  const creado = await Clave.create(
    {
      id_clave: nuevoId,
      clave: def.clave,
      descripcion: def.descripcion,
      es_pendiente: def.es_pendiente,
    },
    opts,
  );

  return creado.id_clave;
}

module.exports = { getEstadoClave, CODIGOS };