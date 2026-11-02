import { useState, useEffect } from 'react';
import type { SistemaItem, Propietario } from '../../services/sistemaService';

interface SistemaModalProps {
    show: boolean;
    editingItem: SistemaItem | null;
    saving: boolean;
    propietarios: Propietario[];
    onClose: () => void;
    onSave: (formData: FormData) => void;
}

export default function SistemaModal({
    show,
    editingItem,
    saving,
    propietarios,
    onClose,
    onSave
}: SistemaModalProps) {
    const [selectedPropietario, setSelectedPropietario] = useState<number | null>(null);

    useEffect(() => {
        if (editingItem?.tb_propietario) {
            setSelectedPropietario(editingItem.tb_propietario.id_propietario);
        } else {
            setSelectedPropietario(null);
        }
    }, [editingItem, show]);

    if (!show) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        if (selectedPropietario) {
            formData.set('id_propietario', selectedPropietario.toString());
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold mb-4">
                    {editingItem ? 'Editar Sistema' : 'Nuevo Sistema'}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sistema
                            </label>
                            <input
                                type="text"
                                name="sistema"
                                defaultValue={editingItem?.sistema || ''}
                                required
                                maxLength={15}
                                disabled={saving}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">Máximo 15 caracteres</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Propietario
                            </label>
                            <select
                                value={selectedPropietario || ''}
                                onChange={(e) => setSelectedPropietario(e.target.value ? Number(e.target.value) : null)}
                                disabled={saving}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">-- Seleccionar propietario --</option>
                                {propietarios.map((prop) => (
                                    <option key={prop.id_propietario} value={prop.id_propietario}>
                                        {prop.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dirección
                            </label>
                            <input
                                type="text"
                                name="direccion"
                                defaultValue={editingItem?.direccion || ''}
                                required
                                maxLength={15}
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

