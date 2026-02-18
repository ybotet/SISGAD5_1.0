import type { Usuario } from '../../services/usuariosService';

// Extender la interface existente
interface UsuariosTableProps {
    items: Usuario[];
    onEdit: (item: Usuario) => void;
    onDelete: (id: number) => void;
    loading?: boolean;
    // Nuevas props opcionales para selección múltiple
    onSelectionChange?: (ids: number[]) => void;
    selectedIds?: number[];
}

export default function UsuariosTable({
    items,
    onEdit,
    onDelete,
    loading = false,
    // Nuevas props con valores por defecto
    onSelectionChange,
    selectedIds = []
}: UsuariosTableProps) {
    // Manejar selección individual
    const handleSelectUsuario = (id: number) => {
        if (!onSelectionChange) return;
        
        const newSelectedIds = selectedIds.includes(id)
            ? selectedIds.filter(itemId => itemId !== id)
            : [...selectedIds, id];
        
        onSelectionChange(newSelectedIds);
    };

    // Manejar selección de todos
    const handleSelectAll = () => {
        if (!onSelectionChange) return;
        
        if (selectedIds.length === items.length) {
            // Deseleccionar todos
            onSelectionChange([]);
        } else {
            // Seleccionar todos
            const allIds = items.map(item => item.id_usuario);
            onSelectionChange(allIds);
        }
    };

    // Función para renderizar los roles del usuario
    const renderRoles = (usuario: Usuario) => {
        if (!usuario.tb_rol || usuario.tb_rol.length === 0) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Sin roles asignados
                </span>
            );
        }

        return (
            <div className="flex flex-wrap gap-1">
                {usuario.tb_rol.map((rol: any) => (
                    <span
                        key={rol.id_rol}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        title={rol.descripcion}
                    >
                        {rol.nombre}
                    </span>
                ))}
            </div>
        );
    };

    // Función para renderizar el estado
    const renderEstado = (activo: boolean) => {
        return activo ? (
            <div className="flex items-center">
                <div className="bg-green-100 rounded-full p-1 mr-2">
                    <i className="ri-checkbox-circle-line text-green-600 text-xs"></i>
                </div>
                <span className="text-sm font-medium text-green-700">Activo</span>
            </div>
        ) : (
            <div className="flex items-center">
                <div className="bg-red-100 rounded-full p-1 mr-2">
                    <i className="ri-close-circle-line text-red-600 text-xs"></i>
                </div>
                <span className="text-sm font-medium text-red-700">Inactivo</span>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center">
                <i className="ri-loader-4-line animate-spin text-2xl text-blue-600 mb-2"></i>
                <p className="text-gray-600">Actualizando datos...</p>
            </div>
        );
    }

    const allSelected = items.length > 0 && selectedIds.length === items.length;
    const someSelected = selectedIds.length > 0 && selectedIds.length < items.length;

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {/* Checkbox para seleccionar todos - SIEMPRE VISIBLE */}
                            <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
                                <input
                                    type="checkbox"
                                    className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 sm:left-6"
                                    checked={allSelected}
                                    ref={input => {
                                        if (input) {
                                            input.indeterminate = someSelected;
                                        }
                                    }}
                                    onChange={handleSelectAll}
                                    disabled={items.length === 0}
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Usuario
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Roles
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
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
                                <td 
                                    colSpan={7} // 7 columnas con checkbox
                                    className="px-6 py-8 text-center text-gray-500"
                                >
                                    <i className="ri-inbox-line text-3xl mb-2 block"></i>
                                    No se encontraron usuarios
                                </td>
                            </tr>
                        ) : (
                            items.map((usuario) => {
                                const isSelected = selectedIds.includes(usuario.id_usuario);
                                
                                return (
                                    <tr 
                                        key={usuario.id_usuario} 
                                        className={`hover:bg-gray-50 ${
                                            isSelected ? 'bg-blue-50' : ''
                                        }`}
                                    >
                                        {/* Checkbox para selección individual */}
                                        <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                                            <input
                                                type="checkbox"
                                                className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 sm:left-6"
                                                checked={isSelected}
                                                onChange={() => handleSelectUsuario(usuario.id_usuario)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="bg-blue-50 rounded-lg p-2 mr-3">
                                                    <i className="ri-user-line text-blue-500"></i>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {usuario.nombre} {usuario.apellidos}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        ID: {usuario.id_usuario}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{usuario.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {renderRoles(usuario)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {renderEstado(usuario.activo)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(usuario.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(usuario.createdAt).toLocaleTimeString([], { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => onEdit(usuario)}
                                                    className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                                    title="Editar"
                                                >
                                                    <i className="ri-edit-line"></i>
                                                </button>
                                                <button
                                                    onClick={() => onDelete(usuario.id_usuario)}
                                                    className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <i className="ri-delete-bin-line"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pie de tabla con información de selección */}
            {items.length > 0 && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                            {selectedIds.length > 0 ? (
                                <span className="font-medium text-blue-600">
                                    {selectedIds.length} de {items.length} usuario(s) seleccionado(s)
                                </span>
                            ) : (
                                <span>Selecciona usuarios marcando las casillas</span>
                            )}
                        </div>
                        <div className="flex items-center space-x-4">
                            {selectedIds.length > 0 && (
                                <button
                                    onClick={() => onSelectionChange && onSelectionChange([])}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    <i className="ri-close-line mr-1"></i>
                                    Deseleccionar todos
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}