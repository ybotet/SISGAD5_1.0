import type { TelefonoItem, RecorridoItem, QuejaItem, Cable, Planta, Sistema, Propietario } from '../../services/telefonoService';
import { telefonoService } from '../../services/telefonoService';
// import { quejaService } from '../../services/quejaService';
import { useState, useEffect } from 'react';

interface TelefonoDetallesModalProps {
    show: boolean;
    telefono: TelefonoItem | null;
    recorridos: RecorridoItem[];
    quejas: QuejaItem[];
    loading: boolean;
    onClose: () => void;
    onDataUpdated?: () => void;
}

export default function TelefonoDetallesModal({
    show,
    telefono,
    recorridos,
    quejas,
    loading,
    onClose,
    onDataUpdated
}: TelefonoDetallesModalProps) {
    // Estados para gestión de recorridos
    const [showNuevoRecorrido, setShowNuevoRecorrido] = useState(false);
    const [editandoRecorrido, setEditandoRecorrido] = useState<RecorridoItem | null>(null);
    const [eliminandoRecorrido, setEliminandoRecorrido] = useState<number | null>(null);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    // Estado local para recorridos - ¡ESTO ES LO IMPORTANTE!
    const [recorridosLocales, setRecorridosLocales] = useState<RecorridoItem[]>([]);

    // Estados para combos
    const [cables, setCables] = useState<Cable[]>([]);
    const [plantas, setPlantas] = useState<Planta[]>([]);
    const [propietarios, setPropietarios] = useState<Propietario[]>([]);
    const [sistemas, setSistemas] = useState<Sistema[]>([]);
    const [loadingCombos, setLoadingCombos] = useState(false);

    // Estado para formulario de recorrido
    const [formRecorrido, setFormRecorrido] = useState({
        numero: '',
        par: '',
        terminal: '',
        de: '',
        a: '',
        dirter: '',
        soporte: '',
        canal: '',
        id_cable: '',
        id_planta: '',
        id_sistema: '',
        id_propietario: ''
    });

    // Inicializar recorridosLocales con los props cuando cambian
    useEffect(() => {
        if (recorridos) {
            setRecorridosLocales(recorridos);
        }
    }, [recorridos]);

    // Cargar combos al abrir el modal
    useEffect(() => {
        if (show && telefono) {
            loadCombos();
        }
    }, [show, telefono]);

    // Resetear formulario cuando se cierra o cambia el estado
    useEffect(() => {
        if (!showNuevoRecorrido && !editandoRecorrido) {
            resetFormRecorrido();
        }
    }, [showNuevoRecorrido, editandoRecorrido]);

    const loadCombos = async () => {
        try {
            setLoadingCombos(true);
            const cablesData = await telefonoService.getCables();
            setCables(cablesData);
            const plantasData = await telefonoService.getPlantas();
            setPlantas(plantasData);
            const propietariosData = await telefonoService.getPropietarios();
            setPropietarios(propietariosData);
            const sistemasData = await telefonoService.getSistemas();
            setSistemas(sistemasData);
        } catch (err) {
            console.error('Error cargando combos:', err);
            setError('Error al cargar datos adicionales');
        } finally {
            setLoadingCombos(false);
        }
    };

    // Función para recargar los recorridos desde el servidor
    const recargarRecorridos = async () => {
        if (!telefono) return;

        try {
            const response = await telefonoService.getRecorridosTelefono(
                telefono.id_telefono,
                1,  // página
                100 // límite alto para obtener todos
            );

            if (response.data && Array.isArray(response.data)) {
                setRecorridosLocales(response.data);
            } else if (response.data && Array.isArray(response.data)) {
                // Si la respuesta está dentro de data.data
                setRecorridosLocales(response.data);
            }

            // También notificar al componente padre
            if (onDataUpdated) {
                onDataUpdated();
            }

        } catch (err) {
            console.error('Error recargando recorridos:', err);
        }
    };

    const resetFormRecorrido = () => {
        setFormRecorrido({
            numero: '',
            par: '',
            terminal: '',
            de: '',
            a: '',
            dirter: '',
            soporte: '',
            canal: '',
            id_cable: '',
            id_planta: '',
            id_sistema: '',
            id_propietario: ''
        });
        setEditandoRecorrido(null);
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleCloseClick = () => {
        onClose();
        resetFormRecorrido();
        setShowNuevoRecorrido(false);
        setError('');
    };

    // Configurar formulario para edición
    const handleEditarRecorrido = (recorrido: RecorridoItem) => {
        setEditandoRecorrido(recorrido);
        setFormRecorrido({
            numero: recorrido.numero.toString(),
            par: recorrido.par || '',
            terminal: recorrido.terminal || '',
            de: recorrido.de || '',
            a: recorrido.a || '',
            dirter: recorrido.dirter || '',
            soporte: recorrido.soporte || '',
            canal: recorrido.canal || '',
            id_cable: recorrido.id_cable?.toString() || '',
            id_planta: recorrido.id_planta?.toString() || '',
            id_sistema: recorrido.id_sistema?.toString() || '',
            id_propietario: recorrido.id_propietario?.toString() || ''
        });
        setShowNuevoRecorrido(true);
    };

    // Manejar creación/actualización de recorrido
    const handleGuardarRecorrido = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!telefono) return;

        try {
            setGuardando(true);
            setError('');

            const recorridoData = {
                numero: parseInt(formRecorrido.numero),
                par: formRecorrido.par || null,
                terminal: formRecorrido.terminal || null,
                de: formRecorrido.de || null,
                a: formRecorrido.a || null,
                dirter: formRecorrido.dirter || null,
                soporte: formRecorrido.soporte || null,
                canal: formRecorrido.canal || null,
                id_telefono: telefono.id_telefono,
                id_cable: formRecorrido.id_cable ? parseInt(formRecorrido.id_cable) : null,
                id_planta: formRecorrido.id_planta ? parseInt(formRecorrido.id_planta) : null,
                id_sistema: formRecorrido.id_sistema ? parseInt(formRecorrido.id_sistema) : null,
                id_propietario: formRecorrido.id_propietario ? parseInt(formRecorrido.id_propietario) : null
            };

            if (editandoRecorrido) {
                await telefonoService.updateRecorrido(editandoRecorrido.id_recorrido, recorridoData);
            } else {
                await telefonoService.createRecorrido(recorridoData);
            }

            // ¡IMPORTANTE! Recargar los recorridos después de guardar
            await recargarRecorridos();

            // Cerrar formulario y resetear
            setShowNuevoRecorrido(false);
            resetFormRecorrido();

        } catch (err: any) {
            const errorMsg = err?.response?.data?.error || err?.message ||
                (editandoRecorrido ? 'Error al actualizar el recorrido' : 'Error al crear el recorrido');
            setError(errorMsg);
            console.error('Error guardando recorrido:', err);
        } finally {
            setGuardando(false);
        }
    };

    // Manejar eliminación de recorrido
    const handleEliminarRecorrido = async (id: number) => {
        if (!confirm('¿Está seguro de eliminar este recorrido? Esta acción no se puede deshacer.')) return;

        try {
            setEliminandoRecorrido(id);
            setError('');

            await telefonoService.deleteRecorrido(id);

            // ¡IMPORTANTE! Recargar los recorridos después de eliminar
            await recargarRecorridos();

        } catch (err: any) {
            setError(err?.response?.data?.error || 'Error al eliminar el recorrido');
            console.error('Error eliminando recorrido:', err);
        } finally {
            setEliminandoRecorrido(null);
        }
    };

    // Manejar cambios en formulario
    const handleRecorridoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormRecorrido(prev => ({ ...prev, [name]: value }));
    };

    // Renderizar campo relacionado (planta o sistema)
    const renderCampoRelacionado = (recorrido: RecorridoItem) => {
        const campos = [];

        // Nota: Asegúrate de que tu interfaz RecorridoItem incluya tb_planta y tb_sistema
        // Si no están incluidos, necesitarás actualizar la interfaz en telefonoService.ts

        if (recorrido.tb_planta?.planta) {
            campos.push(<div key="planta"><span className="font-medium">Planta:</span> {recorrido.tb_planta.planta}</div>);
        }

        if (recorrido.tb_sistema?.sistema) {
            campos.push(<div key="sistema"><span className="font-medium">Sistema:</span> {recorrido.tb_sistema.sistema}</div>);
        }

        if (recorrido.tb_propietario?.nombre) {
            campos.push(<div key="propietario"><span className="font-medium">Propietario:</span> {recorrido.tb_propietario.nombre}</div>);
        }

        return campos.length > 0 ? (
            <div className="space-y-1">
                {campos}
            </div>
        ) : 'N/A';
    };

    if (!show) return null;

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

    if (!telefono) return null;

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
                                Detalles del Teléfono: {telefono.telefono || 'N/A'}
                                <br />
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${telefono.esbaja
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-green-100 text-green-800'
                                    }`}>
                                    {telefono.esbaja ? 'Baja' : 'Activo'}
                                </span>
                            </h3>
                            <button
                                onClick={handleCloseClick}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <i className="ri-close-line text-xl"></i>
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Mensaje de error */}
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

                        {/* Información del Teléfono */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Nombre</h4>
                                    <p className="text-sm text-gray-900">{telefono.nombre || 'N/A'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Dirección</h4>
                                    <p className="text-sm text-gray-900">{telefono.direccion || 'N/A'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">LIC</h4>
                                    <p className="text-sm text-gray-900">{telefono.lic || 'N/A'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Zona</h4>
                                    <p className="text-sm text-gray-900">{telefono.zona || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Clasificación</h4>
                                    <p className="text-sm text-gray-900">
                                        {telefono.tb_clasificacion?.nombre || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Extensiones</h4>
                                    <p className="text-sm text-gray-900">{telefono.extensiones}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Mando</h4>
                                    <p className="text-sm text-gray-900">
                                        {telefono.tb_mando?.mando || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Sector</h4>
                                    <p className="text-sm text-gray-900">
                                        {telefono.sector || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Sección de Recorridos */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-semibold text-gray-900">Recorridos</h4>
                                <button
                                    onClick={() => {
                                        resetFormRecorrido();
                                        setShowNuevoRecorrido(!showNuevoRecorrido);
                                    }}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center space-x-2"
                                >
                                    <i className={showNuevoRecorrido ? "ri-close-line" : "ri-add-line"}></i>
                                    <span>{showNuevoRecorrido ? 'Cancelar' : 'Nuevo Recorrido'}</span>
                                </button>
                            </div>

                            {/* Formulario para nuevo/editar recorrido */}
                            {showNuevoRecorrido && (
                                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h5 className="text-sm font-semibold text-blue-800 mb-3">
                                        <i className="ri-add-circle-line mr-1"></i>
                                        {editandoRecorrido ? 'Editar Recorrido' : 'Nuevo Recorrido'}
                                    </h5>
                                    <form onSubmit={handleGuardarRecorrido} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Número *
                                                </label>
                                                <input
                                                    type="number"
                                                    name="numero"
                                                    value={formRecorrido.numero}
                                                    onChange={handleRecorridoChange}
                                                    required
                                                    disabled={guardando}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
                                                    placeholder="Ej: 238971"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Par
                                                </label>
                                                <input
                                                    type="text"
                                                    name="par"
                                                    value={formRecorrido.par}
                                                    onChange={handleRecorridoChange}
                                                    disabled={guardando}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
                                                    placeholder="Ej: 52"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Terminal
                                                </label>
                                                <input
                                                    type="text"
                                                    name="terminal"
                                                    value={formRecorrido.terminal}
                                                    onChange={handleRecorridoChange}
                                                    disabled={guardando}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
                                                    placeholder="Ej: 8Q"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    De
                                                </label>
                                                <input
                                                    type="text"
                                                    name="de"
                                                    value={formRecorrido.de}
                                                    onChange={handleRecorridoChange}
                                                    disabled={guardando}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
                                                    placeholder="Ej: 1"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    A
                                                </label>
                                                <input
                                                    type="text"
                                                    name="a"
                                                    value={formRecorrido.a}
                                                    onChange={handleRecorridoChange}
                                                    disabled={guardando}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
                                                    placeholder="Ej: 100"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Dirección Terminal
                                                </label>
                                                <input
                                                    type="text"
                                                    name="dirter"
                                                    value={formRecorrido.dirter}
                                                    onChange={handleRecorridoChange}
                                                    disabled={guardando}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
                                                    placeholder="Ej: DAAFAR"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Cable
                                                </label>
                                                <select
                                                    name="id_cable"
                                                    value={formRecorrido.id_cable}
                                                    onChange={handleRecorridoChange}
                                                    disabled={guardando || loadingCombos}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
                                                >
                                                    <option value="">Seleccionar cable</option>
                                                    {cables.map((cable) => (
                                                        <option key={cable.id_cable} value={cable.id_cable}>
                                                            {cable.numero}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Soporte
                                                </label>
                                                <input
                                                    type="text"
                                                    name="soporte"
                                                    value={formRecorrido.soporte}
                                                    onChange={handleRecorridoChange}
                                                    disabled={guardando}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
                                                    placeholder="Ej: Soporte técnico"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Canal
                                                </label>
                                                <input
                                                    type="text"
                                                    name="canal"
                                                    value={formRecorrido.canal}
                                                    onChange={handleRecorridoChange}
                                                    disabled={guardando}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
                                                    placeholder="Ej: Canal de comunicación"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Planta
                                                </label>
                                                <select
                                                    name="id_planta"
                                                    value={formRecorrido.id_planta}
                                                    onChange={handleRecorridoChange}
                                                    disabled={guardando || loadingCombos}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
                                                >
                                                    <option value="">Seleccionar planta</option>
                                                    {plantas.map((planta) => (
                                                        <option key={planta.id_planta} value={planta.id_planta}>
                                                            {planta.planta}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Propietario
                                                </label>
                                                <select
                                                    name="id_propietario"
                                                    value={formRecorrido.id_propietario}
                                                    onChange={handleRecorridoChange}
                                                    disabled={guardando || loadingCombos}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
                                                >
                                                    <option value="">Seleccionar propietario</option>
                                                    {propietarios.map((propietario) => (
                                                        <option key={propietario.id_propietario} value={propietario.id_propietario}>
                                                            {propietario.nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Sistema
                                                </label>
                                                <select
                                                    name="id_sistema"
                                                    value={formRecorrido.id_sistema}
                                                    onChange={handleRecorridoChange}
                                                    disabled={guardando || loadingCombos}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
                                                >
                                                    <option value="">Seleccionar sistema</option>
                                                    {sistemas.map((sistema) => (
                                                        <option key={sistema.id_sistema} value={sistema.id_sistema}>
                                                            {sistema.sistema}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowNuevoRecorrido(false);
                                                    resetFormRecorrido();
                                                }}
                                                disabled={guardando}
                                                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm transition-colors disabled:opacity-50"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={guardando}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center space-x-2 disabled:opacity-50"
                                            >
                                                {guardando && <i className="ri-loader-4-line animate-spin"></i>}
                                                <span>{editandoRecorrido ? 'Actualizar' : 'Guardar'} Recorrido</span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Tabla de Recorridos - ¡AHORA USA recorridosLocales! */}
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
                                                Cable/Par
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Dir. Ter. /Soporte/Canal
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                De/A
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Relaciones
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {recorridosLocales.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-4 py-4 text-center text-sm text-gray-500">
                                                    No hay recorridos registrados
                                                </td>
                                            </tr>
                                        ) : (
                                            recorridosLocales.map((recorrido, index) => (
                                                <tr key={recorrido.id_recorrido}>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {recorrido.terminal || 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        <div className="flex flex-col">
                                                            <span>Cable: {recorrido.tb_cable?.numero || 'N/A'}</span>
                                                            <span>Par: {recorrido.par || 'N/A'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        <div className="flex flex-col">
                                                            <span>Dir.Ter: {recorrido.dirter || 'N/A'}</span>
                                                            <span>Soporte: {recorrido.soporte || 'N/A'}</span>
                                                            <span>Canal: {recorrido.canal || 'N/A'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        <div className="flex flex-col">
                                                            <span>De: {recorrido.de || 'N/A'}</span>
                                                            <span>A: {recorrido.a || 'N/A'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-900">
                                                        {renderCampoRelacionado(recorrido)}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleEditarRecorrido(recorrido)}
                                                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                                                                title="Editar recorrido"
                                                            >
                                                                <i className="ri-edit-line"></i>
                                                            </button>
                                                            <button
                                                                onClick={() => handleEliminarRecorrido(recorrido.id_recorrido)}
                                                                disabled={eliminandoRecorrido === recorrido.id_recorrido}
                                                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                                                                title="Eliminar recorrido"
                                                            >
                                                                {eliminandoRecorrido === recorrido.id_recorrido ? (
                                                                    <i className="ri-loader-4-line animate-spin"></i>
                                                                ) : (
                                                                    <i className="ri-delete-bin-line"></i>
                                                                )}
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
                                                    No hay quejas registradas
                                                </td>
                                            </tr>
                                        ) : (
                                            quejas.map((queja) => (
                                                <tr key={queja.num_reporte}>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        <a href={`./quejas/${queja.num_reporte}`}>{queja.num_reporte}</a>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {new Date(queja.fecha).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {queja.tb_trabajador?.clave_trabajador || 'N/A'}
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
        </div>
    );
}