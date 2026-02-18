import type { ClaveItem } from '../../services/claveService';
import { useState, useEffect } from 'react';

interface ClaveModalProps {
    show: boolean;
    editingItem: ClaveItem | null;
    saving: boolean;
    onClose: () => void;
    onSave: (formData: FormData) => void;
}

export default function ClaveModal({
    show,
    editingItem,
    saving,
    onClose,
    onSave
}: ClaveModalProps) {
    const [formData, setFormData] = useState({
        clave: '',
        descripcion: '',
        valor_p: '',
        es_pendiente: 'false'
    });

    // Actualizar formData cuando cambia editingItem
    useEffect(() => {
        if (editingItem) {
            setFormData({
                clave: editingItem.clave || '',
                descripcion: editingItem.descripcion || '',
                valor_p: editingItem.valor_p || '',
                es_pendiente: editingItem.es_pendiente ? 'true' : 'false'
            });
        } else {
            setFormData({
                clave: '',
                descripcion: '',
                valor_p: '',
                es_pendiente: 'false'
            });
        }
    }, [editingItem]);

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
                    {editingItem ? 'Editar Clave' : 'Nueva Clave'}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Clave *
                            </label>
                            <input
                                type="text"
                                name="clave"
                                value={formData.clave}
                                onChange={handleInputChange}
                                required
                                maxLength={10}
                                disabled={saving}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder="Ej: 1R, 2C, etc."
                            />
                            <p className="text-xs text-gray-500 mt-1">Máximo 10 caracteres</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descripción *
                            </label>
                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleInputChange}
                                required
                                rows={3}
                                maxLength={200}
                                disabled={saving}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                                placeholder="Descripción de la clave"
                            />
                            <p className="text-xs text-gray-500 mt-1">Máximo 200 caracteres</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Valor P
                            </label>
                            <input
                                type="text"
                                name="valor_p"
                                value={formData.valor_p}
                                onChange={handleInputChange}
                                maxLength={20}
                                disabled={saving}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder="Ej: 0.0000"
                            />
                            <p className="text-xs text-gray-500 mt-1">Valor numérico opcional</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Estado
                            </label>
                            <select
                                name="es_pendiente"
                                value={formData.es_pendiente}
                                onChange={handleInputChange}
                                disabled={saving}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="false">Ok</option>
                                <option value="true">Pendiente</option>
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