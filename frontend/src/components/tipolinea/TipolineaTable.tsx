import type { TipolineaItem } from '../../services/tipolineaService';

interface TipolineaTableProps {
    items: TipolineaItem[];
    searchTerm: string;
    onEdit: (item: TipolineaItem) => void;
    onDelete: (id: number) => void;
    loading?: boolean;
}

export default function TipolineaTable({
    items,
    onEdit,
    onDelete,
    loading = false
}: TipolineaTableProps) {
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center">
                <i className="ri-loader-4-line animate-spin text-2xl text-blue-600 mb-2"></i>
                <p className="text-gray-600">Actualizando datos...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tipo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha Creación
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                    <i className="ri-inbox-line text-3xl mb-2 block"></i>
                                    No se encontraron resultados
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id_tipolinea} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {item.tipo}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => onEdit(item)}
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                                                title="Editar"
                                            >
                                                <i className="ri-edit-line"></i>
                                            </button>
                                            <button
                                                onClick={() => onDelete(item.id_tipolinea)}
                                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                                title="Eliminar"
                                            >
                                                <i className="ri-delete-bin-line"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

