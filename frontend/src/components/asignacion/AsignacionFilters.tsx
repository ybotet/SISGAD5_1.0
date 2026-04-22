interface AsignacionFiltersProps {
  searchTerm: string;
  fechaDesde?: string;
  fechaHasta?: string;
  claveTrabajador?: string;
  onSearchChange: (term: string) => void;
  onFechaDesdeChange: (v: string) => void;
  onFechaHastaChange: (v: string) => void;
  onClaveChange: (v: string) => void;
  onRefresh: () => void;
}

export default function AsignacionFilters({
  searchTerm,
  fechaDesde,
  fechaHasta,
  claveTrabajador,
  onSearchChange,
  onFechaDesdeChange,
  onFechaHastaChange,
  onClaveChange,
  onRefresh,
}: AsignacionFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center gap-3 flex-wrap">
      <div className="flex-1 min-w-[220px] relative">
        <i className="ri-search-line absolute left-3 top-3 text-gray-400"></i>
        <input
          type="text"
          placeholder="Buscar por texto, clave trabajador..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="min-w-[180px]">
        <label className="text-xs text-gray-600">Fecha desde</label>
        <input
          type="date"
          value={fechaDesde || ""}
          onChange={(e) => onFechaDesdeChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="min-w-[180px]">
        <label className="text-xs text-gray-600">Fecha hasta</label>
        <input
          type="date"
          value={fechaHasta || ""}
          onChange={(e) => onFechaHastaChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="min-w-[220px]">
        <label className="text-xs text-gray-600">Clave trabajador</label>
        <input
          type="text"
          placeholder="Ej: ABC123"
          value={claveTrabajador || ""}
          onChange={(e) => onClaveChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="ml-auto">
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
        >
          <i className="ri-refresh-line"></i>
          Actualizar
        </button>
      </div>
    </div>
  );
}
