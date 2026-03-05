const { Queja } = require("../models");

/**
 * Añade una entrada al flujo de una queja. Ambos arreglos claves_flujo y fechas_flujo
 * se mantienen en paralelo.
 * @param {number} idQueja
 * @param {number} idClave
 * @param {string|Date} fecha  (se guarda como string ISO)
 */
async function addFlowEntry(idQueja, idClave, fecha) {
  if (!idQueja) return;
  const queja = await Queja.findByPk(idQueja);
  if (!queja) return;

  const claves = Array.isArray(queja.claves_flujo)
    ? [...queja.claves_flujo]
    : [];
  const fechas = Array.isArray(queja.fechas_flujo)
    ? [...queja.fechas_flujo]
    : [];

  claves.push(idClave);
  fechas.push(fecha instanceof Date ? fecha.toISOString() : fecha);

  await queja.update({ claves_flujo: claves, fechas_flujo: fechas });
}

/**
 * Elimina la entrada del flujo correspondiente a la clave y fecha especificadas.
 * Compara ambos campos de forma estricta; si hay varias coincidencias exactas
 * se eliminan todas.
 * @param {number} idQueja
 * @param {number} idClave
 * @param {string|Date} fecha
 */
async function removeFlowEntry(idQueja, idClave, fecha) {
  if (!idQueja) return;
  const queja = await Queja.findByPk(idQueja);
  if (!queja) return;

  const claves = Array.isArray(queja.claves_flujo)
    ? [...queja.claves_flujo]
    : [];
  const fechas = Array.isArray(queja.fechas_flujo)
    ? [...queja.fechas_flujo]
    : [];

  const targetFecha = fecha instanceof Date ? fecha.toISOString() : fecha;

  const newClaves = [];
  const newFechas = [];

  for (let i = 0; i < claves.length; i++) {
    if (!(claves[i] === idClave && fechas[i] === targetFecha)) {
      newClaves.push(claves[i]);
      newFechas.push(fechas[i]);
    }
  }

  // sólo actualizamos si hubo cambio
  if (newClaves.length !== claves.length) {
    await queja.update({ claves_flujo: newClaves, fechas_flujo: newFechas });
  }
}

module.exports = {
  addFlowEntry,
  removeFlowEntry,
};
