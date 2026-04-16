interface AsignacionFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onRefresh: () => void;
}

export default function AsignacionFilters({
  searchTerm,
  onSearchChange,
  onRefresh,
}: AsignacionFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center gap-3">
      <div className="flex-1 relative">
        <i className="ri-search-line absolute left-3 top-3 text-gray-400"></i>
        <input
          type="text"
          placeholder="Buscar por ID trabajador..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <button
        onClick={onRefresh}
        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
      >
        <i className="ri-refresh-line"></i>
        Actualizar
      </button>
    </div>
  );
}
