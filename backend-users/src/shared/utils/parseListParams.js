const parseListParams = (query, options = {}) => {
  const {
    allowedSortFields = ["createdAt"],
    defaultSort = "createdAt",
    defaultOrder = "DESC",
    minLimit = 1,
    maxLimit = 100,
    defaultLimit = 10,
    columnMapping = {},
  } = options;

  const page = Math.max(1, parseInt(query?.page) || 1);
  const limit = Math.min(maxLimit, Math.max(minLimit, parseInt(query?.limit) || defaultLimit));
  const offset = (page - 1) * limit;

  let sortByRaw = query?.sortBy;
  if (!sortByRaw) {
    sortByRaw = defaultSort;
  }

  const sortByValidated = allowedSortFields.includes(sortByRaw) ? sortByRaw : defaultSort;
  const sortBy = columnMapping[sortByValidated] || sortByValidated;

  const sortOrderRaw = query?.sortOrder;
  const sortOrder =
    typeof sortOrderRaw === "string" && ["ASC", "DESC"].includes(sortOrderRaw.toUpperCase())
      ? sortOrderRaw.toUpperCase()
      : defaultOrder;

  const search = typeof query?.search === "string" ? query.search.trim() : "";

  const extraFilters = {};
  const commonFilters = ["id_usuario", "id_rol", "id_permiso"];
  commonFilters.forEach((filter) => {
    if (query[filter] !== undefined && query[filter] !== "") {
      extraFilters[filter] = query[filter];
    }
  });

  return { page, limit, offset, sortBy, sortOrder, search, ...extraFilters };
};

module.exports = { parseListParams };
