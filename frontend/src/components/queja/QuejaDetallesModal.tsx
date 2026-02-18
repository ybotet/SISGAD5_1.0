import type { QuejaItem, PruebaItem, TrabajoItem, Clave, Trabajador, ResultadoPrueba } from '../../services/quejaService';
import { quejaService } from '../../services/quejaService';
import { useState, useEffect } from 'react';

interface QuejaDetallesModalProps {
    show: boolean;
    queja: QuejaItem | null;
    pruebas: PruebaItem[];
    trabajos: TrabajoItem[];
    loading: boolean;
    onClose: () => void;
    onDataUpdated?: () => void;
}

export default function QuejaDetallesModal({
    show,
    queja,
    pruebas,
    trabajos,
    loading,
    onClose,
    onDataUpdated
}: QuejaDetallesModalProps) {
    // Estados para formularios
    const [showNuevaPrueba, setShowNuevaPrueba] = useState(false);
    const [showNuevoTrabajo, setShowNuevoTrabajo] = useState(false);
    const [eliminandoPrueba, setEliminandoPrueba] = useState<number | null>(null);
    const [eliminandoTrabajo, setEliminandoTrabajo] = useState<number | null>(null);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    // Estados para combos
    const [claves, setClaves] = useState<Clave[]>([]);
    const [probadores, setProbadores] = useState<Trabajador[]>([]);
    const [resultados, setResultados] = useState<ResultadoPrueba[]>([]);
    // const [ setLoadingCombos] = useState<boolean>(false);
    const [_loadingCombos, setLoadingCombos] = useState<boolean>(false);

    // Estados para formularios
    const [nuevaPrueba, setNuevaPrueba] = useState({
        fecha: '',
        id_clave: '',
        id_resultado: '',
        id_trabajador: ''
    });

    const [nuevoTrabajo, setNuevoTrabajo] = useState({
        fecha: '',
        probador: '',
        estado: '',
        observaciones: ''
    });

    // Cargar combos al abrir el modal
    useEffect(() => {
        if (show && queja) {
            loadCombos();
        }
    }, [show, queja]);

    const loadCombos = async () => {
        try {
            setLoadingCombos(true);
            const [clavesData, resultadosData, probadoresData] = await Promise.all([
                quejaService.getClaves(),
                quejaService.getResultadosPrueba(),
                quejaService.getProbadores()
            ]);
            setClaves(clavesData);
            setResultados(resultadosData); 
            setProbadores(probadoresData);
        } catch (err) {
            console.error('Error cargando combos:', err);
            setError('Error al cargar datos adicionales');
        } finally {
            setLoadingCombos(false);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleCloseClick = () => {
        onClose();
    };

    // Manejar creación de prueba
    const handleCrearPrueba = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!queja) return;

        try {
            setGuardando(true);
            setError('');

            await quejaService.createPrueba({
                fecha: nuevaPrueba.fecha || null,
                id_clave: nuevaPrueba.id_clave ? parseInt(nuevaPrueba.id_clave) : null,
                id_resultado: nuevaPrueba.id_resultado ? parseInt(nuevaPrueba.id_resultado) : null,
                id_trabajador: nuevaPrueba.id_trabajador ? parseInt(nuevaPrueba.id_trabajador) : null,
                id_queja: queja.id_queja
            });

            // Limpiar formulario
            setNuevaPrueba({
                fecha: '',
                id_clave: '',
                id_resultado: '',
                id_trabajador: ''
            });
            setShowNuevaPrueba(false);

            // Notificar al padre para refrescar datos
            if (onDataUpdated) {
                onDataUpdated();
            }
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Error al crear la prueba');
            console.error('Error creando prueba:', err);
        } finally {
            setGuardando(false);
        }
    };

    // Manejar eliminación de prueba
    const handleEliminarPrueba = async (id: number) => {
        if (!confirm('¿Está seguro de eliminar esta prueba?')) return;

        try {
            setEliminandoPrueba(id);
            setError('');

            await quejaService.deletePrueba(id);

            // Notificar al padre para refrescar datos
            if (onDataUpdated) {
                onDataUpdated();
            }
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Error al eliminar la prueba');
            console.error('Error eliminando prueba:', err);
        } finally {
            setEliminandoPrueba(null);
        }
    };

    // Manejar creación de trabajo
    const handleCrearTrabajo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!queja) return;

        try {
            setGuardando(true);
            setError('');

            await quejaService.createTrabajo({
                fecha: nuevoTrabajo.fecha,
                probador: parseInt(nuevoTrabajo.probador),
                estado: nuevoTrabajo.estado || null,
                observaciones: nuevoTrabajo.observaciones || null,
                id_queja: queja.id_queja
            });

            // Limpiar formulario
            setNuevoTrabajo({
                fecha: '',
                probador: '',
                estado: '',
                observaciones: ''
            });
            setShowNuevoTrabajo(false);

            // Notificar al padre para refrescar datos
            if (onDataUpdated) {
                onDataUpdated();
            }
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Error al crear el trabajo');
            console.error('Error creando trabajo:', err);
        } finally {
            setGuardando(false);
        }
    };

    // Manejar eliminación de trabajo
    const handleEliminarTrabajo = async (id: number) => {
        if (!confirm('¿Está seguro de eliminar este trabajo?')) return;

        try {
            setEliminandoTrabajo(id);
            setError('');

            await quejaService.deleteTrabajo(id);

            // Notificar al padre para refrescar datos
            if (onDataUpdated) {
                onDataUpdated();
            }
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Error al eliminar el trabajo');
            console.error('Error eliminando trabajo:', err);
        } finally {
            setEliminandoTrabajo(null);
        }
    };

    // Manejar cambios en formularios
    const handlePruebaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNuevaPrueba(prev => ({ ...prev, [name]: value }));
    };

    const handleTrabajoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNuevoTrabajo(prev => ({ ...prev, [name]: value }));
    };

    if (!show) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[9999]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={handleBackdropClick}
            />

            {/* Contenido del modal */}
            <div className="relative flex items-center justify-center min-h-screen p-4">
                <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                    {/* Header fijo */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 sticky top-0 z-10">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {loading ? 'Cargando detalles...' : `Detalles de Queja #${queja?.num_reporte || 'N/A'}`}
                            </h3>
                            <button
                                onClick={handleCloseClick}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                type="button"
                            >
                                <i className="ri-close-line text-xl"></i>
                            </button>
                        </div>
                    </div>

                    {/* Contenido */}
                    <div className="p-6">
                        {loading ? (
                            <div className="text-center py-8">
                                <i className="ri-loader-4-line animate-spin text-2xl text-blue-600 mb-2"></i>
                                <p className="text-gray-600">Cargando detalles de la queja...</p>
                            </div>
                        ) : !queja ? (
                            <div className="text-center py-8">
                                <i className="ri-error-warning-line text-red-500 text-2xl mb-2"></i>
                                <p className="text-gray-600">No se pudieron cargar los detalles de la queja</p>
                            </div>
                        ) : (
                            <>
                                {/* Error message */}
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-center">
                                            <i className="ri-error-warning-line text-red-500 mr-2"></i>
                                            <span className="text-red-700 text-sm">{error}</span>
                                            <button
                                                onClick={() => setError('')}
                                                className="ml-auto text-red-500 hover:text-red-700"
                                            >
                                                <i className="ri-close-line"></i>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Información principal de la queja */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Número de Reporte</h4>
                                            <p className="text-sm text-gray-900 font-medium">{queja.num_reporte}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Fecha Reporte</h4>
                                            <p className="text-sm text-gray-900">
                                                {new Date(queja.fecha).toLocaleDateString()} {new Date(queja.fecha).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Teléfono</h4>
                                            <p className="text-sm text-gray-900">
                                                {queja.tb_telefono ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        <i className="ri-phone-line mr-1"></i>
                                                        {queja.tb_telefono.telefono}
                                                    </span>
                                                ) : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Línea</h4>
                                            <p className="text-sm text-gray-900">
                                                {queja.tb_linea ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {queja.tb_linea.clavelinea}
                                                    </span>
                                                ) : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Reportado por</h4>
                                            <p className="text-sm text-gray-900">{queja.reportado_por || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Tipo de Queja</h4>
                                            <p className="text-sm text-gray-900">
                                                {queja.tb_tipoqueja ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        {queja.tb_tipoqueja.tipoqueja}
                                                    </span>
                                                ) : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Clave</h4>
                                            <p className="text-sm text-gray-900">
                                                {queja.tb_clave ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        {queja.tb_clave.clave}
                                                    </span>
                                                ) : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Estado</h4>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${queja.red === true
                                                ? 'bg-red-100 text-red-800'
                                                : queja.red === false
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {queja.red === true ? 'En Red' : queja.red === false ? 'Resuelta' : 'Sin estado'}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Prioridad</h4>
                                            <p className="text-sm text-gray-900">{queja.prioridad || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Probador</h4>
                                            <p className="text-sm text-gray-900">{queja.probador || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Fechas importantes */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Fecha Pendiente</h4>
                                        <p className="text-sm text-gray-900">
                                            {queja.fecha_pdte ? new Date(queja.fecha_pdte).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Fecha OK</h4>
                                        <p className="text-sm text-gray-900">
                                            {queja.fechaok ? new Date(queja.fechaok).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {/* Tabla de Pruebas */}
                                <div className="mb-8">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-lg font-semibold text-gray-900">Pruebas Realizadas</h4>
                                        <button
                                            onClick={() => setShowNuevaPrueba(!showNuevaPrueba)}
                                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center space-x-2"
                                        >
                                            <i className={showNuevaPrueba ? "ri-close-line" : "ri-add-line"}></i>
                                            <span>{showNuevaPrueba ? 'Cancelar' : 'Nueva Prueba'}</span>
                                        </button>
                                    </div>

                                    {/* Formulario para nueva prueba */}
                                    {showNuevaPrueba && (
                                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <h5 className="text-sm font-semibold text-blue-800 mb-3">
                                                <i className="ri-add-circle-line mr-1"></i>
                                                Nueva Prueba
                                            </h5>
                                            <form onSubmit={handleCrearPrueba} className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Fecha
                                                        </label>
                                                        <input
                                                            type="datetime-local"
                                                            name="fecha"
                                                            value={nuevaPrueba.fecha}
                                                            onChange={handlePruebaChange}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                        />
                                                    </div>
                                                     <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Probador
                                                        </label>
                                                        <select
                                                            name="id_trabajador"
                                                            value={nuevaPrueba.id_trabajador}
                                                            onChange={handlePruebaChange}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                        >
                                                            <option value="">Seleccionar probador</option>
                                                            {probadores.map((probador) => (
                                                                <option key={probador.id_trabajador} value={probador.id_trabajador}>
                                                                    {probador.clave_trabajador || `ID: ${probador.id_trabajador}`}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Clave
                                                        </label>
                                                        <select
                                                            name="id_clave"
                                                            value={nuevaPrueba.id_clave}
                                                            onChange={handlePruebaChange}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                        >
                                                            <option value="">Seleccionar clave</option>
                                                            {claves.map((clave) => (
                                                                <option key={clave.id_clave} value={clave.id_clave}>
                                                                    {clave.clave}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Resultado
                                                        </label>
                                                        <select
                                                            name="id_resultado"
                                                            value={nuevaPrueba.id_resultado}
                                                            onChange={handlePruebaChange}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                        >
                                                            <option value="">Seleccionar resultado</option>
                                                            {resultados.map((resultado) => (
                                                                <option key={resultado.id_resultadoprueba} value={resultado.id_resultadoprueba}>
                                                                    {resultado.resultado}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end">
                                                    <button
                                                        type="submit"
                                                        disabled={guardando}
                                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center space-x-2 disabled:opacity-50"
                                                    >
                                                        {guardando && <i className="ri-loader-4-line animate-spin"></i>}
                                                        <span>Guardar Prueba</span>
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        ID
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Fecha
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Probador
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Clave
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Resultado
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Acciones
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {pruebas.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="px-4 py-4 text-center text-sm text-gray-500">
                                                            No hay pruebas registradas para esta queja
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    pruebas.map((prueba) => (
                                                        <tr key={prueba.id_prueba}>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {prueba.id_prueba}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {prueba.fecha ? new Date(prueba.fecha).toLocaleDateString() : 'N/A'}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {prueba.tb_trabajador ? prueba.tb_trabajador.clave_trabajador : 'N/A'}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {prueba.tb_clave?.clave || 'N/A'}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {prueba.tb_resultadoprueba?.resultado || 'N/A'}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                                <button
                                                                    onClick={() => handleEliminarPrueba(prueba.id_prueba)}
                                                                    disabled={eliminandoPrueba === prueba.id_prueba}
                                                                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                                                                    title="Eliminar prueba"
                                                                >
                                                                    {eliminandoPrueba === prueba.id_prueba ? (
                                                                        <i className="ri-loader-4-line animate-spin"></i>
                                                                    ) : (
                                                                        <i className="ri-delete-bin-line"></i>
                                                                    )}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Tabla de Trabajos */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-lg font-semibold text-gray-900">Trabajos Realizados</h4>
                                        <button
                                            onClick={() => setShowNuevoTrabajo(!showNuevoTrabajo)}
                                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg flex items-center space-x-2"
                                        >
                                            <i className={showNuevoTrabajo ? "ri-close-line" : "ri-add-line"}></i>
                                            <span>{showNuevoTrabajo ? 'Cancelar' : 'Nuevo Trabajo'}</span>
                                        </button>
                                    </div>

                                    {/* Formulario para nuevo trabajo */}
                                    {showNuevoTrabajo && (
                                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                            <h5 className="text-sm font-semibold text-green-800 mb-3">
                                                <i className="ri-add-circle-line mr-1"></i>
                                                Nuevo Trabajo
                                            </h5>
                                            <form onSubmit={handleCrearTrabajo} className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Fecha *
                                                        </label>
                                                        <input
                                                            type="datetime-local"
                                                            name="fecha"
                                                            value={nuevoTrabajo.fecha}
                                                            onChange={handleTrabajoChange}
                                                            required
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Probador *
                                                        </label>
                                                        <select
                                                            name="probador"
                                                            value={nuevoTrabajo.probador}
                                                            onChange={handleTrabajoChange}
                                                            required
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                        >
                                                            <option value="">Seleccionar probador</option>
                                                            {probadores.map((probador) => (
                                                                <option key={probador.id_trabajador} value={probador.id_trabajador}>
                                                                    {probador.clave_trabajador || `ID: ${probador.id_trabajador}`}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Estado
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="estado"
                                                            value={nuevoTrabajo.estado}
                                                            onChange={handleTrabajoChange}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                            placeholder="Ej: Completado, Pendiente"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Observaciones
                                                    </label>
                                                    <textarea
                                                        name="observaciones"
                                                        value={nuevoTrabajo.observaciones}
                                                        onChange={handleTrabajoChange}
                                                        rows={2}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                        placeholder="Descripción del trabajo realizado..."
                                                    />
                                                </div>
                                                <div className="flex justify-end">
                                                    <button
                                                        type="submit"
                                                        disabled={guardando}
                                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg flex items-center space-x-2 disabled:opacity-50"
                                                    >
                                                        {guardando && <i className="ri-loader-4-line animate-spin"></i>}
                                                        <span>Guardar Trabajo</span>
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        ID
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Fecha
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Probador
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Estado
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Observaciones
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Acciones
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {trabajos.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500">
                                                            No hay trabajos registrados para esta queja
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    trabajos.map((trabajo) => (
                                                        <tr key={trabajo.id_trabajo}>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {trabajo.id_trabajo}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {new Date(trabajo.fecha).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {trabajo.tb_trabajador?.clave_trabajador}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {trabajo.estado || 'N/A'}
                                                            </td>
                                                            <td className="px-4 py-4 text-sm text-gray-900">
                                                                {trabajo.observaciones || 'N/A'}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                                <button
                                                                    onClick={() => handleEliminarTrabajo(trabajo.id_trabajo)}
                                                                    disabled={eliminandoTrabajo === trabajo.id_trabajo}
                                                                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                                                                    title="Eliminar trabajo"
                                                                >
                                                                    {eliminandoTrabajo === trabajo.id_trabajo ? (
                                                                        <i className="ri-loader-4-line animate-spin"></i>
                                                                    ) : (
                                                                        <i className="ri-delete-bin-line"></i>
                                                                    )}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}