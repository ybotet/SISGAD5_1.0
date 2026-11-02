import type { Permiso } from '../../services/usuariosService';

interface PermisosTableProps {
    items: Permiso[];
    loading?: boolean;
    onEdit: (p: Permiso) => void;
    onDelete: (p: Permiso) => void;
}

export default function PermisosTable({ items, loading, onEdit, onDelete }: PermisosTableProps) {
    if (loading) return <div className="py-6 text-center">Cargando permisos...</div>;
    if (items.length === 0) return <div className="py-6 text-center">No hay permisos.</div>;

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
                    {items.map(p => (
                        <tr key={p.id_permiso}>
                            <td className="px-6 py-3 text-sm text-gray-700">{p.id_permiso}</td>
                            <td className="px-6 py-3 text-sm text-gray-700 font-mono">{p.nombre}</td>
                            <td className="px-6 py-3 text-sm text-gray-500">{p.descripcion}</td>
                            <td className="px-6 py-3 text-sm text-right">
                                <button onClick={() => onEdit(p)}
                                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                                    title="Editar">
                                    <i className="ri-edit-line"></i>
                                </button>
                                <button onClick={() => onDelete(p)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                    title="Eliminar">
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