import type { QuejaItem } from '../../services/quejaService';

interface QuejaTableProps {
    items: QuejaItem[];
    onEdit: (item: QuejaItem) => void;
    onDelete: (id: number) => void;
    onView: (item: QuejaItem) => void;
    loading?: boolean;
}

export default function QuejaTable({
    items,
    onEdit,
    onDelete,
    onView,
    loading = false
}: QuejaTableProps) {

    // Función para renderizar el servicio (teléfono, línea o pizarra)
    const renderServicio = (item: QuejaItem) => {
        // Primero verificar si hay teléfono
        if (item.tb_telefono) {
            return (
                <div className="flex flex-col">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-1">
                        <i className="ri-phone-line mr-1"></i>
                        Teléfono
                    </span>
                    <span className="text-xs text-gray-600 font-medium">
                        {item.tb_telefono.telefono}
                    </span>
                </div>
            );
        }

        // Luego verificar si hay línea
        if (item.tb_linea) {
            return (
                <div className="flex flex-col">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-1">
                        <i className="ri-wire-line mr-1"></i>
                        Línea
                    </span>
                    <span className="text-xs text-gray-600 font-medium">
                        {item.tb_linea.clavelinea}
                    </span>
                </div>
            );
        }

        // Luego verificar si hay pizarra
        if (item.tb_pizarra) {
            return (
                <div className="flex flex-col">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mb-1">
                        <i className="ri-layout-line mr-1"></i>
                        Pizarra
                    </span>
                    <span className="text-xs text-gray-600 font-medium">
                        {item.tb_pizarra.nombre || 'Sin nombre'}
                    </span>
                </div>
            );
        }

        // Si no hay ningún servicio
        return (
            <div className="flex flex-col">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-1">
                    <i className="ri-question-line mr-1"></i>
                    Sin servicio
                </span>
                <span className="text-xs text-gray-400 italic">
                    No asignado
                </span>
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

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                No. Reporte
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Servicio
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tipo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Reportado por
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    <i className="ri-inbox-line text-3xl mb-2 block"></i>
                                    No se encontraron resultados
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id_queja} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="bg-red-50 rounded-lg p-2 mr-3">
                                                <i className="ri-alarm-warning-line text-red-500"></i>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    #{item.num_reporte}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    ID: {item.id_queja}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {new Date(item.fecha).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(item.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {renderServicio(item)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {item.tb_tipoqueja ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                <i className="ri-file-list-line mr-1"></i>
                                                {item.tb_tipoqueja.tipoqueja}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                <i className="ri-question-line mr-1"></i>
                                                Sin tipo
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {item.estado === 'Abierta' ? (
                                            <div className="flex items-center">
                                                <div className="bg-red-100 rounded-full p-1 mr-2">
                                                    <i className="ri-alarm-warning-line text-red-600 text-xs"></i>
                                                </div>
                                                <span className="text-sm font-medium text-red-700">Abierta</span>
                                            </div>
                                        ) : item.estado === 'En Proceso' ? (
                                            <div className="flex items-center">
                                                <div className="bg-green-100 rounded-full p-1 mr-2">
                                                    <i className="ri-checkbox-circle-line text-green-600 text-xs"></i>
                                                </div>
                                                <span className="text-sm font-medium text-green-700">En Proceso</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center">
                                                <div className="bg-gray-100 rounded-full p-1 mr-2">
                                                    <i className="ri-question-line text-gray-600 text-xs"></i>
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">Sin estado</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            Persona que reporta: {item.reportado_por || 'Sin datos'}
                                        </div>

                                        <div className="text-xs text-gray-500">
                                            Probador: {item.tb_trabajador?.clave_trabajador || 'Sin datos del probador'}
                                        </div>

                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => onView(item)}
                                                className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors"
                                                title="Ver detalles"
                                            >
                                                <i className="ri-eye-line"></i>
                                            </button>
                                            <button
                                                onClick={() => onEdit(item)}
                                                className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                                title="Editar"
                                            >
                                                <i className="ri-edit-line"></i>
                                            </button>
                                            <button
                                                onClick={() => onDelete(item.id_queja)}
                                                className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
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