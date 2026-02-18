import type { LineaItem, RecorridoItem, QuejaItem } from '../../services/lineaService';

interface LineaDetallesModalProps {
    show: boolean;
    linea: LineaItem | null;
    recorridos: RecorridoItem[];
    quejas: QuejaItem[];
    loading: boolean;
    onClose: () => void;
}

export default function LineaDetallesModal({
    show,
    linea,
    recorridos,
    quejas,
    loading,
    onClose
}: LineaDetallesModalProps) {
    // Si no se debe mostrar, no renderizar nada
    if (!show) return null;

    // Mostrar loading si está cargando
    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 text-center">
                    <i className="ri-loader-4-line animate-spin text-2xl text-blue-600 mb-2"></i>
                    <p className="text-gray-600">Cargando detalles...</p>
                </div>
            </div>
        );
    }

    // Si no hay línea (aunque show sea true), no renderizar el modal
    if (!linea) {
        console.warn('LineaDetallesModal: show es true pero linea es null');
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                {/* Header fijo */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 sticky top-0">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Detalles de la Línea: {linea?.clavelinea || 'No disponible'}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            type="button"
                            aria-label="Cerrar"
                        >
                            <i className="ri-close-line text-xl"></i>
                        </button>
                    </div>
                </div>

                {/* Contenido */}
                <div className="p-6">
                    {/* Información de la Línea */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Clave Línea</h4>
                                <p className="text-sm text-gray-900">{linea.clavelinea || 'N/A'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Desde</h4>
                                <p className="text-sm text-gray-900">{linea.desde || 'N/A'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Dirección Desde</h4>
                                <p className="text-sm text-gray-900">{linea.dirde || 'N/A'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Zona Desde</h4>
                                <p className="text-sm text-gray-900">{linea.zd || 'N/A'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Hilos</h4>
                                <p className="text-sm text-gray-900">{linea.hilos || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Hasta</h4>
                                <p className="text-sm text-gray-900">{linea.hasta || 'N/A'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Dirección Hasta</h4>
                                <p className="text-sm text-gray-900">{linea.dirha || 'N/A'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Zona Hasta</h4>
                                <p className="text-sm text-gray-900">{linea.zh || 'N/A'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Tipo Línea</h4>
                                <p className="text-sm text-gray-900">
                                    {linea.tb_tipolinea?.tipo || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Estado</h4>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${linea.esbaja
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-green-100 text-green-800'
                                    }`}>
                                    {linea.esbaja ? 'Baja' : 'Activo'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tabla de Recorridos */}
                    <div className="mb-8">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Recorridos</h4>
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            No.
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Terminal
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cable
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Par
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            De
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            A
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recorridos.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500">
                                                No hay recorridos registrados para esta línea
                                            </td>
                                        </tr>
                                    ) : (
                                        recorridos.map((recorrido, index) => (
                                            <tr key={recorrido.id_recorrido}>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {index + 1}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {recorrido.terminal || 'N/A'}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {recorrido.tb_cable?.numero || 'N/A'}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {recorrido.par || 'N/A'}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {recorrido.de || 'N/A'}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {recorrido.a || 'N/A'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Tabla de Quejas */}
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Quejas</h4>
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            No. Reporte
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Probador
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Clave OK
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha OK
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {quejas.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500">
                                                No hay quejas registradas para esta línea
                                            </td>
                                        </tr>
                                    ) : (
                                        quejas.map((queja) => (
                                            <tr key={queja.num_reporte}>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {queja.num_reporte}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {queja.fecha ? new Date(queja.fecha).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {queja.probador1 || 'N/A'}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {queja.claveok || 'N/A'}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {queja.fechaok ? new Date(queja.fechaok).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${queja.red
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-green-100 text-green-800'
                                                        }`}>
                                                        {queja.red ? 'En Red' : 'Resuelta'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}