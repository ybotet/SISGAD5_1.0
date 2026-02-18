import type { TipoPizarraItem, ClasifPizarra } from '../../services/tipopizarraService';
import { useState, useEffect } from 'react';
import { tipopizarraService } from '../../services/tipopizarraService';

interface TipoPizarraModalProps {
    show: boolean;
    editingItem: TipoPizarraItem | null;
    saving: boolean;
    onClose: () => void;
    onSave: (formData: FormData) => void;
}

export default function TipoPizarraModal({
    show,
    editingItem,
    saving,
    onClose,
    onSave
}: TipoPizarraModalProps) {
    const [formData, setFormData] = useState({
        tipo: '',
        id_clasifpizarra: ''
    });
    const [clasificaciones, setClasificaciones] = useState<ClasifPizarra[]>([]);
    const [loadingClasificaciones, setLoadingClasificaciones] = useState(false);

    // Cargar clasificaciones al abrir el modal
    useEffect(() => {
        if (show) {
            loadClasificaciones();
        }
    }, [show]);

    // Actualizar formData cuando cambia editingItem
    useEffect(() => {
        if (editingItem) {
            setFormData({
                tipo: editingItem.tipo || '',
                id_clasifpizarra: editingItem.id_clasifpizarra?.toString() || ''
            });
        } else {
            setFormData({
                tipo: '',
                id_clasifpizarra: ''
            });
        }
    }, [editingItem]);

    const loadClasificaciones = async () => {
        try {
            setLoadingClasificaciones(true);
            const clasificacionesData = await tipopizarraService.getClasifPizarras();
            setClasificaciones(clasificacionesData);
        } catch (error) {
            console.error('Error cargando clasificaciones:', error);
        } finally {
            setLoadingClasificaciones(false);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSave(new FormData(e.currentTarget));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold mb-4">
                    {editingItem ? 'Editar Tipo de Pizarra' : 'Nuevo Tipo de Pizarra'}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo *
                            </label>
                            <input
                                type="text"
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleInputChange}
                                required
                                maxLength={100}
                                disabled={saving}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder="Ingrese el tipo de pizarra"
                            />
                            <p className="text-xs text-gray-500 mt-1">Máximo 100 caracteres</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Clasificación *
                            </label>
                            <select
                                name="id_clasifpizarra"
                                value={formData.id_clasifpizarra}
                                onChange={handleInputChange}
                                required
                                disabled={saving || loadingClasificaciones}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">Seleccione una clasificación</option>
                                {clasificaciones.map((clasificacion) => (
                                    <option key={clasificacion.id_clasifpizarra} value={clasificacion.id_clasifpizarra}>
                                        {clasificacion.clasificacion}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                {loadingClasificaciones ? 'Cargando clasificaciones...' : 'Seleccione la clasificación'}
                            </p>
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