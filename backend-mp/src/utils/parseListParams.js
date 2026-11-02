/**
 * Parsea y valida parámetros de listado de forma segura
 * @param {Object} query - req.query crudo
 * @param {Object} options - Configuración
 * @returns {Object} Parámetros seguros para usar en Sequelize
 */
const parseListParams = (query, options = {}) => {
  const {
    allowedSortFields = ["createdAt"],
    defaultSort = "createdAt",
    defaultOrder = "DESC",
    minLimit = 1,
    maxLimit = 100,
    defaultLimit = 10,
    columnMapping = {}, // ✅ Nuevo: mapeo de camelCase a snake_case
  } = options;

  // 🔹 Parsear números con fallback seguro
  const page = Math.max(1, parseInt(query?.page) || 1);
  const limit = Math.min(maxLimit, Math.max(minLimit, parseInt(query?.limit) || defaultLimit));
  const offset = (page - 1) * limit;

  // 🔹 Validar sortBy contra whitelist y aplicar mapeo
  let sortByRaw = query?.sortBy;
  if (!sortByRaw) {
    sortByRaw = defaultSort;
  }

  const sortByValidated = allowedSortFields.includes(sortByRaw) ? sortByRaw : defaultSort;

  // ✅ Aplicar mapeo de columnas (ej: createdAt -> created_at)
  const sortBy = columnMapping[sortByValidated] || sortByValidated;

  // 🔹 Validar sortOrder
  const sortOrderRaw = query?.sortOrder;
  const sortOrder =
    typeof sortOrderRaw === "string" && ["ASC", "DESC"].includes(sortOrderRaw.toUpperCase())
      ? sortOrderRaw.toUpperCase()
      : defaultOrder;

  // 🔹 Search y otros filtros
  const search = typeof query?.search === "string" ? query.search.trim() : "";

  // 🔹 Extraer filtros adicionales (como id_senalizacion, etc.)
  const extraFilters = {};
  const commonFilters = [
    "id_senalizacion",
    "id_tipolinea",
    "id_propietario",
    "id_clasificacion",
    "id_mando",
  ];
  commonFilters.forEach((filter) => {
    if (query[filter] !== undefined && query[filter] !== "") {
      extraFilters[filter] = query[filter];
    }
  });

  return { page, limit, offset, sortBy, sortOrder, search, ...extraFilters };
};

module.exports = { parseListParams };
