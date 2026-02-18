import type { CableItem, Propietario } from '../../services/cableService';
import { useState, useEffect } from 'react';
import { cableService } from '../../services/cableService';

interface CableModalProps {
    show: boolean;
    editingItem: CableItem | null;
    saving: boolean;
    onClose: () => void;
    onSave: (formData: FormData) => void;
}

export default function CableModal({
    show,
    editingItem,
    saving,
    onClose,
    onSave
}: CableModalProps) {
    const [formData, setFormData] = useState({
        numero: '',
        direccion: '',
        id_propietario: ''
    });
    const [propietarios, setPropietarios] = useState<Propietario[]>([]);
    const [loadingPropietarios, setLoadingPropietarios] = useState(false);

    // Cargar propietarios al abrir el modal
    useEffect(() => {
        if (show) {
            loadPropietarios();
        }
    }, [show]);

    // Actualizar formData cuando cambia editingItem
    useEffect(() => {
        if (editingItem) {
            setFormData({
                numero: editingItem.numero || '',
                direccion: editingItem.direccion || '',
                id_propietario: editingItem.id_propietario?.toString() || ''
            });
        } else {
            setFormData({
                numero: '',
                direccion: '',
                id_propietario: ''
            });
        }
    }, [editingItem]);

    const loadPropietarios = async () => {
        try {
            setLoadingPropietarios(true);
            const propietariosData = await cableService.getPropietarios();
            setPropietarios(propietariosData);
        } catch (error) {
            console.error('Error cargando propietarios:', error);
        } finally {
            setLoadingPropietarios(false);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSave(new FormData(e.currentTarget));
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
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold mb-4">
                    {editingItem ? 'Editar Cable' : 'Nuevo Cable'}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Número *
                            </label>
                            <input
                                type="text"
                                name="numero"
                                value={formData.numero}
                                onChange={handleInputChange}
                                required
                                maxLength={50}
                                disabled={saving}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder="Ingrese el número del cable"
                            />
                            <p className="text-xs text-gray-500 mt-1">Máximo 50 caracteres</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dirección
                            </label>
                            <textarea
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleInputChange}
                                rows={3}
                                maxLength={200}
                                disabled={saving}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                                placeholder="Ingrese la dirección del cable"
                            />
                            <p className="text-xs text-gray-500 mt-1">Máximo 200 caracteres</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Propietario
                            </label>
                            <select
                                name="id_propietario"
                                value={formData.id_propietario}
                                onChange={handleInputChange}
                                disabled={saving || loadingPropietarios}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">Seleccione un propietario</option>
                                {propietarios.map((propietario) => (
                                    <option key={propietario.id_propietario} value={propietario.id_propietario}>
                                        {propietario.nombre}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                {loadingPropietarios ? 'Cargando propietarios...' : 'Seleccione el propietario del cable'}
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