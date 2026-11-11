const apiErrors = require("../../shared/utils/apiErrors");

/**
 * HistorialService
 *
 * Obtiene el historial unificado de una entidad (telefono, linea o pizarra).
 * Une los eventos de tipo queja, movimiento y recorrido relacionados a la entidad,
 * ordenados por fecha descendente.
 *
 * Relaciones usadas (definidas en src/features/index.js):
 *   - TbQueja.belongsTo(TbTelefono) / TbQueja.belongsTo(TbLinea) / TbQueja.belongsTo(TbPizarra)
 *   - TbMovimiento.belongsTo(TbTelefono) / TbMovimiento.belongsTo(TbLinea)
 *   - TbRecorrido.belongsTo(TbTelefono) / TbRecorrido.belongsTo(TbLinea)
 *
 * Índices necesarios (ya creados por las FK en migrations):
 *   - tb_queja(id_telefono), tb_queja(id_linea), tb_queja(id_pizarra)
 *   - tb_movimiento(id_telefono), tb_movimiento(id_linea)
 *   - tb_recorrido(id_telefono), tb_recorrido(id_linea)
 *
 * Si la consulta es lenta en datos reales, crear migración con:
 *   CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tb_queja_id_telefono ON tb_queja(id_telefono);
 *   (análogas para id_linea, id_pizarra, tb_movimiento, tb_recorrido)
 */

const ESTADOS_COMPLETADOS = ["Resuelta", "Cerrada"];

const ENTITY_CONFIG = {
  telefono: {
    entityModel: "Telefono",
    entityPk: "id_telefono",
    entityName: "telefono",
    quejaFk: "id_telefono",
    movimientoFk: "id_telefono",
    recorridoFk: "id_telefono",
  },
  linea: {
    entityModel: "Linea",
    entityPk: "id_linea",
    entityName: "linea",
    quejaFk: "id_linea",
    movimientoFk: "id_linea",
    recorridoFk: "id_linea",
  },
  pizarra: {
    entityModel: "Pizarra",
    entityPk: "id_pizarra",
    entityName: "pizarra",
    quejaFk: "id_pizarra",
    movimientoFk: null,
    recorridoFk: null,
  },
};

const normalizeFecha = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.toISOString ? value.toISOString() : String(value);
};

const buildEvento = (item, tipo) => {
  const json = item.toJSON ? item.toJSON() : item;
  const fecha = normalizeFecha(json.created_at || json.createdAt || json.fecha);
  return {
    tipo,
    id:
      json.id_queja ||
      json.id_movimiento ||
      json.id_recorrido ||
      json.id ||
      null,
    fecha,
    entidad: tipo,
    descripcion:
      json.descripcion ||
      json.motivo ||
      json.estado ||
      `Evento ${tipo} #${json.id_queja || json.id_movimiento || json.id_recorrido || json.id}`,
    ...json,
  };
};

const getHistorial = async (tipoEntidad, id, { limit = 50, models } = {}) => {
  const config = ENTITY_CONFIG[tipoEntidad];
  if (!config) {
    throw apiErrors.badRequest(`Tipo de entidad no soportado: ${tipoEntidad}`);
  }

  // Usar modelos pasados por parámetro o importados del scope del módulo
  const modelMap = models
    ? { telefono: models.Telefono, linea: models.Linea, pizarra: models.Pizarra }
    : {
        telefono: require("../telefono/telefono.model"),
        linea: require("../linea/linea.model"),
        pizarra: require("../pizarra/pizarra.model"),
      };
  const EntityModel = modelMap[tipoEntidad];
  const Queja = models && models.Queja ? models.Queja : require("../queja/queja.model");
  const Movimiento =
    models && models.Movimiento ? models.Movimiento : require("../movimiento/movimiento.model");
  const Recorrido =
    models && models.Recorrido ? models.Recorrido : require("../recorrido/recorrido.model");

  // Nota: los modelos importados con require() son funciones factory que necesitan
  // sequelize. En producción, se instancian una sola vez en src/features/index.js.
  // Aquí los usamos directamente asumiendo que ya están instanciados (patrón de
  // este proyecto donde los modelos se exportan ya instanciados desde index.js).
  // Para tests, pasar los modelos mockeados vía parámetro 'models'.

  // Verificar que la entidad exista
  const entidad = await EntityModel.findByPk(id, { attributes: [config.entityPk] });
  if (!entidad) {
    throw apiErrors.notFound(`${config.entityName} con id ${id} no encontrada`);
  }

  const promises = [];

  // Quejas (siempre aplica)
  promises.push(
    Queja.findAll({
      where: { [config.quejaFk]: id },
      attributes: [
        "id_queja",
        "fecha",
        "estado",
        "prioridad",
        "reportado_por",
        "created_at",
        "updated_at",
      ],
      limit,
    }).then((rows) => rows.map((r) => buildEvento(r, "queja"))),
  );

  // Movimientos (solo telefono y linea)
  if (config.movimientoFk) {
    promises.push(
      Movimiento.findAll({
        where: { [config.movimientoFk]: id },
        attributes: [
          "id_movimiento",
          "fecha",
          "motivo",
          "os",
          "created_at",
          "updated_at",
        ],
        limit,
      }).then((rows) => rows.map((r) => buildEvento(r, "movimiento"))),
    );
  }

  // Recorridos (solo telefono y linea)
  if (config.recorridoFk) {
    promises.push(
      Recorrido.findAll({
        where: { [config.recorridoFk]: id },
        attributes: [
          "id_recorrido",
          "numero",
          "par",
          "terminal",
          "createdAt",
          "updatedAt",
        ],
        limit,
      }).then((rows) => rows.map((r) => buildEvento(r, "recorrido"))),
    );
  }

  const results = await Promise.all(promises);

  // Unir y ordenar por fecha descendente
  const eventos = results.flat().sort((a, b) => {
    const fa = new Date(a.fecha || 0).getTime();
    const fb = new Date(b.fecha || 0).getTime();
    return fb - fa;
  });

  // Aplicar paginación final sobre el array unido
  const eventosPaginados = eventos.slice(0, limit);

  return {
    entidad: config.entityName,
    id,
    total: eventos.length,
    eventos: eventosPaginados,
  };
};

module.exports = { getHistorial, ENTITY_CONFIG };
