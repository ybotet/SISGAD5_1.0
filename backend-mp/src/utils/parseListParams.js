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
  } = options;

  // 🔹 Parsear números con fallback seguro
  const page = Math.max(1, parseInt(query?.page) || 1);
  const limit = Math.min(
    maxLimit,
    Math.max(minLimit, parseInt(query?.limit) || defaultLimit),
  );
  const offset = (page - 1) * limit;

  // 🔹 Validar sortBy contra whitelist
  const sortByRaw = query?.sortBy;
  const sortBy =
    typeof sortByRaw === "string" && allowedSortFields.includes(sortByRaw)
      ? sortByRaw
      : defaultSort;

  // 🔹 Validar sortOrder
  const sortOrderRaw = query?.sortOrder;
  const sortOrder =
    typeof sortOrderRaw === "string" &&
    ["ASC", "DESC"].includes(sortOrderRaw.toUpperCase())
      ? sortOrderRaw.toUpperCase()
      : defaultOrder;

  // 🔹 Search y otros filtros
  const search = typeof query?.search === "string" ? query.search.trim() : "";

  return { page, limit, offset, sortBy, sortOrder, search };
};

module.exports = { parseListParams };
