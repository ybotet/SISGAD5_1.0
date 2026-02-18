import type { TipoPizarraItem } from '../../services/tipopizarraService';

interface TipoPizarraTableProps {
    items: TipoPizarraItem[];
    searchTerm: string;
    onEdit: (item: TipoPizarraItem) => void;
    onDelete: (id: number) => void;
    loading?: boolean;
}

export default function TipoPizarraTable({
    items,
    onEdit,
    onDelete,
    loading = false
}: TipoPizarraTableProps) {
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
                                Clasificación
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
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    <i className="ri-inbox-line text-3xl mb-2 block"></i>
                                    No se encontraron resultados
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id_tipopizarra} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center">
                                            <i className="ri-artboard-2-line mr-2 text-blue-500"></i>
                                            {item.tipo}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {item.tb_clasifpizarra ? (
                                            <div className="flex items-center">
                                                <i className="ri-category-line mr-2 text-green-500"></i>
                                                {item.tb_clasifpizarra.clasificacion}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic">Sin clasificación</span>
                                        )}
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
                                                onClick={() => onDelete(item.id_tipopizarra)}
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