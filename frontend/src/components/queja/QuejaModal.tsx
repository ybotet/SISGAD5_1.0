import type { QuejaItem, Telefono, TipoQueja, Clave, Pizarra, Linea } from '../../services/quejaService';
import { useState, useEffect } from 'react';
import { quejaService } from '../../services/quejaService';

interface QuejaModalProps {
    show: boolean;
    editingItem: QuejaItem | null;
    saving: boolean;
    onClose: () => void;
    onSave: (formData: FormData) => void;
}

type TipoServicio = 'telefono' | 'linea' | 'pizarra' | 'ninguno';

export default function QuejaModal({
    show,
    editingItem,
    saving,
    onClose,
    onSave
}: QuejaModalProps) {
    // Estado para el tipo de servicio seleccionado
    const [tipoServicio, setTipoServicio] = useState<TipoServicio>('ninguno');

    const [formData, setFormData] = useState({
        num_reporte: '',
        fecha: '',
        prioridad: '',
        probador: '',
        fecha_pdte: '',
        clave_pdte: '',
        claveok: '',
        fechaok: '',
        red: 'false',
        id_telefono: '',
        id_linea: '',
        id_tipoqueja: '',
        id_clave: '',
        id_pizarra: '',
        estado: '',
        reportado_por: ''
    });

    const [telefonos, setTelefonos] = useState<Telefono[]>([]);
    const [tiposQueja, setTiposQueja] = useState<TipoQueja[]>([]);
    const [claves, setClaves] = useState<Clave[]>([]);
    const [pizarras, setPizarras] = useState<Pizarra[]>([]);
    const [lineas, setLineas] = useState<Linea[]>([]);
    const [probadores, setProbadores] = useState<any[]>([]);
    const [loadingCombos, setLoadingCombos] = useState(false);
    const [errors, setErrors] = useState<string[] | Record<string, string[]>>([]);

    // Cargar combos al abrir el modal
    useEffect(() => {
        if (show) {
            loadCombos();

            // Determinar tipo de servicio basado en editingItem
            if (editingItem) {
                if (editingItem.id_telefono) {
                    setTipoServicio('telefono');
                } else if (editingItem.id_linea) {
                    setTipoServicio('linea');
                } else if (editingItem.id_pizarra) {
                    setTipoServicio('pizarra');
                } else {
                    setTipoServicio('ninguno');
                }
            } else {
                setTipoServicio('ninguno');
            }
        }
    }, [show, editingItem]);

    // Actualizar formData cuando cambia editingItem
    useEffect(() => {
        if (editingItem) {
            const fecha = editingItem.fecha
                ? editingItem.fecha.includes('T')
                    ? editingItem.fecha.substring(0, 16) // Formato YYYY-MM-DDTHH:mm
                    : editingItem.fecha + 'T00:00'
                : '';
            const fechaPdte = editingItem.fecha_pdte ? editingItem.fecha_pdte.split('T')[0] : '';
            const fechaOk = editingItem.fechaok ? editingItem.fechaok.split('T')[0] : '';

            setFormData({
                num_reporte: editingItem.num_reporte?.toString() || '',
                fecha: fecha,
                prioridad: editingItem.prioridad?.toString() || '',
                probador: editingItem.probador?.toString() || '',
                fecha_pdte: fechaPdte,
                clave_pdte: editingItem.clave_pdte || '',
                claveok: editingItem.claveok || '',
                fechaok: fechaOk,
                estado: editingItem.estado || '',
                red: editingItem.red === true ? 'true' : 'false',
                id_telefono: editingItem.id_telefono?.toString() || '',
                id_linea: editingItem.id_linea?.toString() || '',
                id_tipoqueja: editingItem.id_tipoqueja?.toString() || '',
                id_clave: editingItem.id_clave?.toString() || '',
                id_pizarra: editingItem.id_pizarra?.toString() || '',
                reportado_por: editingItem.reportado_por || ''
            });
        } else {
            // Formato de fecha actual para nuevo registro
            const today = new Date().toISOString().split('T')[0];
            setFormData({
                num_reporte: '',
                fecha: today,
                prioridad: '',
                probador: '',
                fecha_pdte: '',
                clave_pdte: '',
                claveok: '',
                fechaok: '',
                red: 'false',
                id_telefono: '',
                id_linea: '',
                id_tipoqueja: '',
                id_clave: '',
                id_pizarra: '',
                reportado_por: '',
                estado: ''
            });
        }
    }, [editingItem]);

    const loadCombos = async () => {
        try {
            setLoadingCombos(true);
            const [telefonosData, tiposQuejaData, clavesData, pizarrasData, lineasData, probadoresData] = await Promise.all([
                quejaService.getTelefonos(),
                quejaService.getTiposQueja(),
                quejaService.getClaves(),
                quejaService.getPizarras(),
                quejaService.getLineas(),
                quejaService.getProbadores()
            ]);
            setTelefonos(telefonosData);
            setTiposQueja(tiposQuejaData);
            setClaves(clavesData);
            setPizarras(pizarrasData);
            setLineas(lineasData);
            setProbadores(probadoresData);
        } catch (error) {
            console.error('Error cargando combos:', error);
        } finally {
            setLoadingCombos(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors([]);
        try {
            await onSave(new FormData(e.currentTarget));
        } catch (err: any) {
            const resp = err?.response?.data;
            if (resp) {
                if (Array.isArray(resp.details) || Array.isArray(resp.errors)) {
                    setErrors(resp.details || resp.errors);
                } else if ((resp.details && typeof resp.details === 'object') || (resp.errors && typeof resp.errors === 'object')) {
                    setErrors(resp.details || resp.errors);
                } else if (resp.message) {
                    setErrors([resp.message]);
                } else if (resp.error) {
                    setErrors([resp.error]);
                } else {
                    setErrors([err.message || 'Error desconocido']);
                }
            } else {
                setErrors([err?.message || 'Error desconocido']);
            }
            console.error('Errores al guardar queja:', err);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTipoServicioChange = (tipo: TipoServicio) => {
        setTipoServicio(tipo);

        // Limpiar los otros campos cuando se cambia el tipo de servicio
        setFormData(prev => ({
            ...prev,
            id_telefono: tipo === 'telefono' ? prev.id_telefono : '',
            id_linea: tipo === 'linea' ? prev.id_linea : '',
            id_pizarra: tipo === 'pizarra' ? prev.id_pizarra : ''
        }));
    };

    // Renderizar el selector de servicio según el tipo seleccionado
    const renderServicioSelector = () => {
        switch (tipoServicio) {
            case 'telefono':
                return (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Seleccionar Teléfono *
                        </label>
                        <select
                            name="id_telefono"
                            value={formData.id_telefono}
                            onChange={handleInputChange}
                            required
                            disabled={saving || loadingCombos}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="">Seleccione un teléfono</option>
                            {telefonos.map((telefono) => (
                                <option key={telefono.id_telefono} value={telefono.id_telefono}>
                                    {telefono.telefono}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500">
                            {telefonos.length} teléfonos disponibles
                        </p>
                    </div>
                );

            case 'linea':
                return (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Seleccionar Línea *
                        </label>
                        <select
                            name="id_linea"
                            value={formData.id_linea}
                            onChange={handleInputChange}
                            required
                            disabled={saving || loadingCombos}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="">Seleccione una línea</option>
                            {lineas.map((linea) => (
                                <option key={linea.id_linea} value={linea.id_linea}>
                                    {linea.clavelinea}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500">
                            {lineas.length} líneas disponibles
                        </p>
                    </div>
                );

            case 'pizarra':
                return (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Seleccionar Pizarra *
                        </label>
                        <select
                            name="id_pizarra"
                            value={formData.id_pizarra}
                            onChange={handleInputChange}
                            required
                            disabled={saving || loadingCombos}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="">Seleccione una pizarra</option>
                            {pizarras.map((pizarra) => (
                                <option key={pizarra.id_pizarra} value={pizarra.id_pizarra}>
                                    {pizarra.nombre}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500">
                            {pizarras.length} pizarras disponibles
                        </p>
                    </div>
                );

            case 'ninguno':
                return (
                    <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                        <i className="ri-question-line text-2xl text-gray-400 mb-2"></i>
                        <p className="text-sm text-gray-500">
                            Seleccione un tipo de servicio para continuar
                        </p>
                    </div>
                );
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">
                    {editingItem ? 'Editar Queja' : 'Nueva Queja'}
                </h3>
                <form onSubmit={handleSubmit}>
                    {Array.isArray(errors) && errors.length > 0 && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
                            <ul className="list-disc ml-5">
                                {errors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {(!Array.isArray(errors) && Object.keys(errors).length > 0) && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
                            <ul className="list-disc ml-5">
                                {Object.entries(errors).map(([field, msgs]) => (
                                    msgs.map((m, idx) => (
                                        <li key={`${field}-${idx}`}>{field}: {m}</li>
                                    ))
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Columna 1 - Información básica */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha *
                                </label>
                                <input
                                    type="datetime-local"
                                    name="fecha"
                                    value={formData.fecha}
                                    onChange={handleInputChange}
                                    required
                                    disabled={saving}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Seleccionar Probador *
                                </label>
                                <select
                                    name="probador"
                                    value={formData.probador}
                                    onChange={handleInputChange}
                                    required
                                    disabled={saving || loadingCombos}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    <option value="">Seleccione un probador</option>
                                    {probadores.map((probador) => (
                                        <option key={probador.id_trabajador} value={probador.id_trabajador}>
                                            {probador.clave_trabajador}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500">
                                    {probadores.length} probadores disponibles
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reportado por el cliente
                                </label>
                                <input
                                    type="text"
                                    name="reportado_por"
                                    value={formData.reportado_por}
                                    onChange={handleInputChange}
                                    maxLength={100}
                                    disabled={saving}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="Nombre de quien reporta"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo Queja
                                </label>
                                <select
                                    name="id_tipoqueja"
                                    value={formData.id_tipoqueja}
                                    onChange={handleInputChange}
                                    disabled={saving || loadingCombos}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    <option value="">Seleccione tipo de queja</option>
                                    {tiposQueja.map((tipo) => (
                                        <option key={tipo.id_tipoqueja} value={tipo.id_tipoqueja}>
                                            {tipo.tipoqueja}
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
                                    value={formData.id_clave}
                                    onChange={handleInputChange}
                                    disabled={saving || loadingCombos}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    <option value="">Seleccione clave</option>
                                    {claves.map((clave) => (
                                        <option key={clave.id_clave} value={clave.id_clave}>
                                            {clave.clave}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Columna 2 - Servicio y estado */}
                        <div className="space-y-4">
                            {/* Selección de tipo de servicio */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Servicio *
                                </label>
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => handleTipoServicioChange('telefono')}
                                        className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${tipoServicio === 'telefono'
                                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                                            : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <i className="ri-phone-line text-xl mb-1"></i>
                                        <span className="text-xs font-medium">Teléfono</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleTipoServicioChange('linea')}
                                        className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${tipoServicio === 'linea'
                                            ? 'bg-green-50 border-green-300 text-green-700'
                                            : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <i className="ri-wire-line text-xl mb-1"></i>
                                        <span className="text-xs font-medium">Línea</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleTipoServicioChange('pizarra')}
                                        className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${tipoServicio === 'pizarra'
                                            ? 'bg-purple-50 border-purple-300 text-purple-700'
                                            : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <i className="ri-layout-line text-xl mb-1"></i>
                                        <span className="text-xs font-medium">Pizarra</span>
                                    </button>
                                </div>

                                {/* Selector de servicio específico */}
                                {renderServicioSelector()}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Estado
                                    </label>
                                    <select
                                        name="red"
                                        value={formData.red}
                                        onChange={handleInputChange}
                                        disabled={saving}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        <option value="abierta">Abierta</option>
                                        <option value="proceso">En Proceso</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prioridad
                                    </label>
                                    <input
                                        type="number"
                                        name="prioridad"
                                        value={formData.prioridad}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="10"
                                        disabled={saving}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        placeholder="0-10"
                                    />
                                </div>
                            </div>


                        </div>
                    </div>

                    {/* Fechas importantes */}
                    {/* <div className="mt-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Fechas importantes</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">


                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha Pendiente
                                </label>
                                <input
                                    type="datetime-local"
                                    name="fecha_pdte"
                                    value={formData.fecha_pdte}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha OK
                                </label>
                                <input
                                    type="datetime-local"
                                    name="fechaok"
                                    value={formData.fechaok}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div> */}

                    {/* Claves */}
                    {/* <div className="mt-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Claves</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Clave Pendiente
                                </label>
                                <input
                                    type="text"
                                    name="clave_pdte"
                                    value={formData.clave_pdte}
                                    onChange={handleInputChange}
                                    maxLength={50}
                                    disabled={saving}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="Ej: pdte Pba"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Clave OK
                                </label>
                                <input
                                    type="text"
                                    name="claveok"
                                    value={formData.claveok}
                                    onChange={handleInputChange}
                                    maxLength={50}
                                    disabled={saving}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="Ej: 34"
                                />
                            </div>
                        </div>
                    </div> */}

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving && <i className="ri-loader-4-line animate-spin"></i>}
                            <span>{editingItem ? 'Actualizar' : 'Crear'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}