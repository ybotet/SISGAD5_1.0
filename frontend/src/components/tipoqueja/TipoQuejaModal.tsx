import type { TipoQuejaItem } from '../../services/tipoquejaService';
import { useState, useEffect } from 'react';

interface TipoQuejaModalProps {
    show: boolean;
    editingItem: TipoQuejaItem | null;
    saving: boolean;
    onClose: () => void;
    onSave: (formData: FormData) => void;
}

// Opciones fijas para el servicio
const SERVICIO_OPTIONS = [
    { value: 'TELÉFONO', label: 'TELÉFONO' },
    { value: 'LÍNEA', label: 'LÍNEA' },
    { value: 'PIZARRA', label: 'PIZARRA' }
];

export default function TipoQuejaModal({
    show,
    editingItem,
    saving,
    onClose,
    onSave
}: TipoQuejaModalProps) {
    const [formData, setFormData] = useState({
        tipoqueja: '',
        servicio: ''
    });

    // Actualizar formData cuando cambia editingItem
    useEffect(() => {
        if (editingItem) {
            setFormData({
                tipoqueja: editingItem.tipoqueja,
                servicio: editingItem.servicio
            });
        } else {
            setFormData({
                tipoqueja: '',
                servicio: ''
            });
        }
    }, [editingItem]);

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
                    {editingItem ? 'Editar Tipo de Queja' : 'Nuevo Tipo de Queja'}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de Queja *
                            </label>
                            <input
                                type="text"
                                name="tipoqueja"
                                value={formData.tipoqueja}
                                onChange={handleInputChange}
                                required
                                maxLength={100}
                                disabled={saving}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder="Ingrese el tipo de queja"
                            />
                            <p className="text-xs text-gray-500 mt-1">Máximo 100 caracteres</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Servicio *
                            </label>
                            <select
                                name="servicio"
                                value={formData.servicio}
                                onChange={handleInputChange}
                                required
                                disabled={saving}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">Seleccione un servicio</option>
                                {SERVICIO_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Seleccione el tipo de servicio</p>
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