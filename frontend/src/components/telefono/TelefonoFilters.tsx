interface TelefonoFiltersProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    estadoFilter: string;
    onEstadoFilterChange: (estado: string) => void;
    onRefresh: () => void;
}

export default function TelefonoFilters({
    searchTerm,
    onSearchChange,
    estadoFilter,
    onEstadoFilterChange,
    onRefresh
}: TelefonoFiltersProps) {
    return (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input
                            type="text"
                            placeholder="Buscar por teléfono, nombre, dirección..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="relative">
                        <select
                            value={estadoFilter}
                            onChange={(e) => onEstadoFilterChange(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm pr-8 appearance-none bg-white"
                        >
                            <option value="">Todos los estados</option>
                            <option value="activo">Activo</option>
                            <option value="baja">Baja</option>
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                    </div>

                    <button
                        onClick={onRefresh}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center space-x-2 transition-colors"
                        title="Actualizar lista"
                    >
                        <i className="ri-refresh-line"></i>
                        <span>Actualizar</span>
                    </button>
                </div>
            </div>
        </div>
    );
}