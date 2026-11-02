import type { PizarraItem } from '../../services/pizarraService';

interface PizarraTableProps {
    items: PizarraItem[];
    onEdit: (item: PizarraItem) => void;
    onDelete: (id: number) => void;
    onView: (item: PizarraItem) => void;
    loading?: boolean;
}

export default function PizarraTable({ items, onEdit, onDelete, onView, loading = false }: PizarraTableProps) {
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observacion</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Creación</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    <i className="ri-inbox-line text-3xl mb-2 block"></i>
                                    No se encontraron resultados
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id_pizarra} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.nombre || <span className="text-gray-400 italic">Sin nombre</span>}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.direccion || <span className="text-gray-400 italic">Sin dirección</span>}</td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.tb_tipopizarra ? item.tb_tipopizarra.tipo : <span className="text-gray-400 italic">Sin tipo</span>}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.observacion || <span className="text-gray-400 italic">Sin observación</span>}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(item.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={() => onView(item)} className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors" title="Ver detalles"><i className="ri-eye-line"></i></button>
                                            <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors" title="Editar"><i className="ri-edit-line"></i></button>
                                            <button onClick={() => onDelete(item.id_pizarra)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors" title="Eliminar"><i className="ri-delete-bin-line"></i></button>
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
