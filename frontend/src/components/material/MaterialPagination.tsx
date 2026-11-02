interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface MaterialPaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export default function MaterialPagination({
  pagination,
  onPageChange,
  onLimitChange,
}: MaterialPaginationProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mt-4">
      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="text-sm text-gray-600">
          Mostrando{" "}
          {Math.min(
            (pagination.page - 1) * pagination.limit + 1,
            pagination.total,
          )}{" "}
          - {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
          {pagination.total} elementos
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onPageChange(Math.max(pagination.page - 1, 1))}
            disabled={pagination.page === 1}
            className={`px-3 py-1 rounded-lg border ${pagination.page > 1 ? "bg-white border-gray-300 hover:bg-gray-50 text-gray-700" : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"}`}
          >
            <i className="ri-arrow-left-line"></i>
          </button>
          <span className="text-sm text-gray-600">
            Página {pagination.page} de {pagination.pages}
          </span>
          <button
            onClick={() =>
              onPageChange(Math.min(pagination.page + 1, pagination.pages))
            }
            disabled={pagination.page === pagination.pages}
            className={`px-3 py-1 rounded-lg border ${pagination.page < pagination.pages ? "bg-white border-gray-300 hover:bg-gray-50 text-gray-700" : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"}`}
          >
            <i className="ri-arrow-right-line"></i>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Items por página:</span>
          <select
            value={pagination.limit}
            onChange={(e) => onLimitChange(parseInt(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </div>
  );
}
