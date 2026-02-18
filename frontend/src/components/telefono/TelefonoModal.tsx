import type { TelefonoItem, Mando, Clasificacion } from '../../services/telefonoService';
import { useState, useEffect } from 'react';
import { telefonoService } from '../../services/telefonoService';

interface TelefonoModalProps {
    show: boolean;
    editingItem: TelefonoItem | null;
    saving: boolean;
    onClose: () => void;
    onSave: (formData: FormData) => void;
}

export default function TelefonoModal({
    show,
    editingItem,
    saving,
    onClose,
    onSave
}: TelefonoModalProps) {
    const [formData, setFormData] = useState({
        telefono: '',
        nombre: '',
        direccion: '',
        lic: '',
        zona: '',
        extensiones: '',
        facturado: '',
        sector: '',
        id_mando: '',
        id_clasificacion: '',
        esbaja: 'false'
    });
    const [mandos, setMandos] = useState<Mando[]>([]);
    const [clasificaciones, setClasificaciones] = useState<Clasificacion[]>([]);
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
                telefono: editingItem.telefono || '',
                nombre: editingItem.nombre || '',
                direccion: editingItem.direccion || '',
                lic: editingItem.lic || '',
                zona: editingItem.zona || '',
                extensiones: editingItem.extensiones?.toString() || '',
                facturado: editingItem.facturado || '',
                sector: editingItem.sector || '',
                id_mando: editingItem.id_mando?.toString() || '',
                id_clasificacion: editingItem.id_clasificacion?.toString() || '',
                esbaja: editingItem.esbaja ? 'true' : 'false'
            });
        } else {
            setFormData({
                telefono: '',
                nombre: '',
                direccion: '',
                lic: '',
                zona: '',
                extensiones: '',
                facturado: '',
                sector: '',
                id_mando: '',
                id_clasificacion: '',
                esbaja: 'false'
            });
        }
    }, [editingItem]);

    const loadCombos = async () => {
        try {
            setLoadingCombos(true);
            const [mandosData, clasificacionesData] = await Promise.all([
                telefonoService.getMandos(),
                telefonoService.getClasificaciones()
            ]);
            setMandos(mandosData);
            setClasificaciones(clasificacionesData);
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
            // Intentar extraer errores de validación en distintos formatos
            const resp = err?.response?.data;
            if (resp) {
                if (Array.isArray(resp.errors)) {
                    setErrors(resp.errors);
                } else if (resp.errors && typeof resp.errors === 'object') {
                    setErrors(resp.errors as Record<string, string[]>);
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
            console.error('Errores al guardar teléfono:', err);
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
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">
                    {editingItem ? 'Editar Teléfono' : 'Nuevo Teléfono'}
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre *
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleInputChange}
                                maxLength={200}
                                required
                                disabled={saving}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder="Nombre del titular"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Teléfono *
                            </label>
                            <input
                                type="text"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleInputChange}
                                required
                                maxLength={20}
                                disabled={saving}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder="Ej: 72027832"
                            />
                        </div>

                        

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dirección *
                            </label>
                            <textarea
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleInputChange}
                                rows={2}
                                required
                                maxLength={300}
                                disabled={saving}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                                placeholder="Dirección completa"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                LIC
                            </label>
                            <input
                                type="text"
                                name="lic"
                                value={formData.lic}
                                onChange={handleInputChange}
                                maxLength={50}
                                disabled={saving}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder="Ej: LI3-28567"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Zona
                            </label>
                            <input
                                type="text"
                                name="zona"
                                value={formData.zona}
                                onChange={handleInputChange}
                                maxLength={50}
                                disabled={saving}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder="Ej: BV-URA1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Extensiones
                            </label>
                            <input
                                type="number"
                                name="extensiones"
                                value={formData.extensiones}
                                onChange={handleInputChange}
                                min="0"
                                max="999"
                                disabled={saving}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Facturado
                            </label>
                            <input
                                type="text"
                                name="facturado"
                                value={formData.facturado}
                                onChange={handleInputChange}
                                maxLength={50}
                                disabled={saving}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder="Información de facturación"
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
                                placeholder="Sector"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mando
                            </label>
                            <select
                                name="id_mando"
                                value={formData.id_mando}
                                onChange={handleInputChange}
                                disabled={saving || loadingCombos}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">Seleccione un mando</option>
                                {mandos.map((mando) => (
                                    <option key={mando.id_mando} value={mando.id_mando}>
                                        {mando.mando}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Clasificación
                            </label>
                            <select
                                name="id_clasificacion"
                                value={formData.id_clasificacion}
                                onChange={handleInputChange}
                                disabled={saving || loadingCombos}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">Seleccione una clasificación</option>
                                {clasificaciones.map((clasificacion) => (
                                    <option key={clasificacion.id_clasificacion} value={clasificacion.id_clasificacion}>
                                        {clasificacion.nombre}
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