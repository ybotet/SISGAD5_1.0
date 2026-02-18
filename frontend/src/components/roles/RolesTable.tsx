import type { Rol } from '../../services/usuariosService';

interface Props {
    items: Rol[];
    loading?: boolean;
    onEdit: (r: Rol) => void;
    onDelete: (r: Rol) => void;
}

export default function RolesTable({ items, loading, onEdit, onDelete }: Props) {
    if (loading) return <div className="py-6 text-center">Cargando roles...</div>;
    if (items.length === 0) return <div className="py-6 text-center">No hay roles.</div>;

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {items.map(r => (
                        <tr key={r.id_rol}>
                            <td className="px-6 py-3 text-sm text-gray-700">{r.id_rol}</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{r.nombre}</td>
                            <td className="px-6 py-3 text-sm text-gray-500">{r.descripcion}</td>
                            <td className="px-6 py-3 text-sm text-right">
                                <button onClick={() => onEdit(r)}
                                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                                    title="Editar">
                                    <i className="ri-edit-line"></i>
                                </button>
                                <button onClick={() => onDelete(r)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                    title="Eliminar"
                                >
                                    <i className="ri-delete-bin-line"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
