import type { LineaItem, Senalizacion, TipoLinea, Propietario } from '../../services/lineaService';
import { useState, useEffect } from 'react';
import { lineaService } from '../../services/lineaService';

interface LineaModalProps {
    show: boolean;
    editingItem: LineaItem | null;
    saving: boolean;
    onClose: () => void;
    onSave: (formData: FormData) => void;
}

export default function LineaModal({
    show,
    editingItem,
    saving,
    onClose,
    onSave
}: LineaModalProps) {
    const [formData, setFormData] = useState({
        clavelinea: '',
        clave_n: '',
        codificacion: '',
        hilos: '',
        desde: '',
        dirde: '',
        distdesde: '',
        zd: '',
        hasta: '',
        dirha: '',
        disthasta: '',
        zh: '',
        facturado: '',
        sector: '',
        id_senalizacion: '',
        id_tipolinea: '',
        id_propietario: '',
        esbaja: 'false'
    });
    const [senalizaciones, setSenalizaciones] = useState<Senalizacion[]>([]);
    const [tiposLinea, setTiposLinea] = useState<TipoLinea[]>([]);
    const [propietarios, setPropietarios] = useState<Propietario[]>([]);
    const [loadingCombos, setLoadingCombos] = useState(false);
    const [errors, setErrors] = useState<string[] | Record<string, string[]>>([]);

    // Cargar combos al abrir el modal
    useEffect(() => {
        if (show) {
            loadCombos();
        }
    }, [show]);

    // Actualizar formData cuando cambia editingItem
    useEffect(() => {
        if (editingItem) {
            setFormData({
                clavelinea: editingItem.clavelinea || '',
                clave_n: editingItem.clave_n || '',
                codificacion: editingItem.codificacion || '',
                hilos: editingItem.hilos || '',
                desde: editingItem.desde || '',
                dirde: editingItem.dirde || '',
                distdesde: editingItem.distdesde?.toString() || '',
                zd: editingItem.zd || '',
                hasta: editingItem.hasta || '',
                dirha: editingItem.dirha || '',
                disthasta: editingItem.disthasta?.toString() || '',
                zh: editingItem.zh || '',
                facturado: editingItem.facturado || '',
                sector: editingItem.sector || '',
                id_senalizacion: editingItem.id_senalizacion?.toString() || '',
                id_tipolinea: editingItem.id_tipolinea?.toString() || '',
                id_propietario: editingItem.id_propietario?.toString() || '',
                esbaja: editingItem.esbaja ? 'true' : 'false'
            });
        } else {
            setFormData({
                clavelinea: '',
                clave_n: '',
                codificacion: '',
                hilos: '',
                desde: '',
                dirde: '',
                distdesde: '',
                zd: '',
                hasta: '',
                dirha: '',
                disthasta: '',
                zh: '',
                facturado: '',
                sector: '',
                id_senalizacion: '',
                id_tipolinea: '',
                id_propietario: '',
                esbaja: 'false'
            });
        }
    }, [editingItem]);

    const loadCombos = async () => {
        try {
            setLoadingCombos(true);
            const [senalizacionesData, tiposLineaData, propietariosData] = await Promise.all([
                lineaService.getSenalizaciones(),
                lineaService.getTiposLinea(),
                lineaService.getPropietarios()
            ]);
            setSenalizaciones(senalizacionesData);
            setTiposLinea(tiposLineaData);
            setPropietarios(propietariosData);
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
            console.error('Errores al guardar línea:', err);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">
                    {editingItem ? 'Editar Línea' : 'Nueva Línea'}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Columna 1 */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Clave Línea *
                                </label>
                                <input
                                    type="text"
                                    name="clavelinea"
                                    value={formData.clavelinea}
                                    onChange={handleInputChange}
                                    required
                                    maxLength={50}
                                    disabled={saving}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="Ej: LT-0116-05"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Desde *
                                </label>
                                <input
                                    type="text"
                                    name="desde"
                                    value={formData.desde}
                                    onChange={handleInputChange}
                                    required
                                    maxLength={100}
                                    disabled={saving}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="Punto de origen"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Dirección Desde *
                                </label>
                                <input
                                    type="text"
                                    name="dirde"
                                    value={formData.dirde}
                                    onChange={handleInputChange}
                                    required
                                    maxLength={200}
                                    disabled={saving}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="Dirección del origen"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Zona Desde *
                                </label>
                                <input
                                    type="text"
                                    name="zd"
                                    value={formData.zd}
                                    onChange={handleInputChange}
                                    required
                                    maxLength={50}
                                    disabled={saving}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="Zona de origen"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Hasta *
                                </label>
                                <input
                                    type="text"
                                    name="hasta"
                                    value={formData.hasta}
                                    onChange={handleInputChange}
                                    required
                                    maxLength={100}
                                    disabled={saving}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="Punto de destino"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo Línea
                                </label>
                                <select
                                    name="id_tipolinea"
                                    value={formData.id_tipolinea}
                                    onChange={handleInputChange}
                                    disabled={saving || loadingCombos}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    <option value="">Seleccione tipo de línea</option>
                                    {tiposLinea.map((tipo) => (
                                        <option key={tipo.id_tipolinea} value={tipo.id_tipolinea}>
                                            {tipo.tipo}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Columna 2 */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Dirección Hasta *
                                </label>
                                <input
                                    type="text"
                                    name="dirha"
                                    value={formData.dirha}
                                    onChange={handleInputChange}
                                    required
                                    maxLength={200}
                                    disabled={saving}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="Dirección del destino"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Zona Hasta *
                                </label>
                                <input
                                    type="text"
                                    name="zh"
                                    value={formData.zh}
                                    onChange={handleInputChange}
                                    required
                                    maxLength={50}
                                    disabled={saving}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="Zona de destino"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Hilos
                                </label>
                                <input
                                    type="text"
                                    name="hilos"
                                    value={formData.hilos}
                                    onChange={handleInputChange}
                                    maxLength={10}
                                    disabled={saving}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="Ej: 2, 4"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Señalización
                                </label>
                                <select
                                    name="id_senalizacion"
                                    value={formData.id_senalizacion}
                                    onChange={handleInputChange}
                                    disabled={saving || loadingCombos}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    <option value="">Seleccione señalización</option>
                                    {senalizaciones.map((senalizacion) => (
                                        <option key={senalizacion.id_senalizacion} value={senalizacion.id_senalizacion}>
                                            {senalizacion.senalizacion}
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
                                    value={formData.id_propietario}
                                    onChange={handleInputChange}
                                    disabled={saving || loadingCombos}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    <option value="">Seleccione propietario</option>
                                    {propietarios.map((propietario) => (
                                        <option key={propietario.id_propietario} value={propietario.id_propietario}>
                                            {propietario.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Estado
                                </label>
                                <select
                                    name="esbaja"
                                    value={formData.esbaja}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    <option value="false">Activo</option>
                                    <option value="true">Baja</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Campos adicionales */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Clave N
                            </label>
                            <input
                                type="text"
                                name="clave_n"
                                value={formData.clave_n}
                                onChange={handleInputChange}
                                maxLength={50}
                                disabled={saving}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Codificación
                            </label>
                            <input
                                type="text"
                                name="codificacion"
                                value={formData.codificacion}
                                onChange={handleInputChange}
                                maxLength={50}
                                disabled={saving}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sector
                            </label>
                            <input
                                type="text"
                                name="sector"
                                value={formData.sector}
                                onChange={handleInputChange}
                                maxLength={50}
                                disabled={saving}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

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