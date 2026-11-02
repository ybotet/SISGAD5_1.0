import { useState, useEffect } from 'react';
import type { Rol } from '../../services/usuariosService';
// import { usuariosService } from '../../services/usuariosService';

interface Props {
    show: boolean;
    editingItem: Rol | null;
    saving: boolean;
    onClose: () => void;
    onSave: (data: { nombre: string; descripcion?: string }) => void;
}

export default function RolesModal({ show, editingItem, saving, onClose, onSave }: Props) {
    const [form, setForm] = useState({ nombre: '', descripcion: '' });
    const [errors, setErrors] = useState<{ nombre?: string }>({});

    useEffect(() => {
        if (editingItem) {
            setForm({ nombre: editingItem.nombre || '', descripcion: editingItem.descripcion || '' });
        } else {
            setForm({ nombre: '', descripcion: '' });
        }
        setErrors({});
    }, [editingItem, show]);

    if (!show) return null;

    const validate = () => {
        const e: { nombre?: string } = {};
        if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!validate()) return;
        onSave({ nombre: form.nombre.trim(), descripcion: form.descripcion.trim() || undefined });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold mb-4">{editingItem ? 'Editar Rol' : 'Nuevo Rol'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                            <input
                                name="nombre"
                                value={form.nombre}
                                onChange={e => setForm(prev => ({ ...prev, nombre: e.target.value }))}
                                className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
                                disabled={saving}
                            />
                            {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                            <input
                                name="descripcion"
                                value={form.descripcion}
                                onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                disabled={saving}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                        <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">{editingItem ? 'Actualizar' : 'Crear'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
