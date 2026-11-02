import type { TrabajadorItem } from '../../services/trabajadorService';
import type { GrupoTrabajoItem } from '../../services/grupowService';

interface TrabajadorModalProps {
    show: boolean;
    editingItem: TrabajadorItem | null;
    saving: boolean;
    grupos: GrupoTrabajoItem[];
    onClose: () => void;
    onSave: (formData: FormData) => void;
}

export default function TrabajadorModal({
    show,
    editingItem,
    saving,
    grupos,
    onClose,
    onSave
}: TrabajadorModalProps) {
    if (!show) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSave(new FormData(e.currentTarget));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-xl mx-4">
                <h3 className="text-lg font-semibold mb-4">
                    {editingItem ? 'Editar Trabajador' : 'Nuevo Trabajador'}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Clave trabajador
                            </label>
                            <input
                                type="text"
                                name="clave_trabajador"
                                defaultValue={editingItem?.clave_trabajador || ''}
                                maxLength={10}
                                disabled={saving}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">Máximo 10 caracteres</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                defaultValue={editingItem?.nombre || ''}
                                maxLength={18}
                                required
                                disabled={saving}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cargo
                            </label>
                            <input
                                type="text"
                                name="cargo"
                                defaultValue={editingItem?.cargo || ''}
                                maxLength={40}
                                disabled={saving}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Grupo de trabajo
                            </label>
                            <select
                                name="id_grupow"
                                defaultValue={editingItem?.id_grupow ?? ''}
                                disabled={saving}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">Sin grupo</option>
                                {grupos.map((g) => (
                                    <option key={g.id_grupow} value={g.id_grupow}>{g.grupo}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                id="activo"
                                name="activo"
                                type="checkbox"
                                defaultChecked={!!editingItem?.activo}
                                disabled={saving}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="activo" className="text-sm text-gray-700">Activo</label>
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

