import { useEffect, useState } from 'react';
import type { Permiso } from '../../../services/usuariosService';
import { usuariosService } from '../../../services/usuariosService';
import PermisosTable from '../../../components/roles/PermisosTable';
import PermisosModal from '../../../components/roles/PermisosModal';
import PermisosConfirmModal from '../../../components/roles/PermisosConfirmModal';

export default function PermisosPage() {
    const [items, setItems] = useState<Permiso[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Permiso | null>(null);
    const [saving, setSaving] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Permiso | null>(null);

    useEffect(() => { loadPermisos(); }, []);

    const loadPermisos = async () => {
        try {
            setLoading(true);
            const data = await usuariosService.getPermisos();
            setItems(data || []);
        } catch (err) {
            console.error('Error cargando permisos', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => { setEditingItem(null); setShowModal(true); };
    const handleEdit = (p: Permiso) => { setEditingItem(p); setShowModal(true); };
    const handleDelete = (p: Permiso) => { setItemToDelete(p); setShowConfirm(true); };

    const handleSave = async (payload: { nombre: string; descripcion?: string }) => {
        try {
            setSaving(true);
            if (editingItem) {
                await usuariosService.updatePermiso(editingItem.id_permiso, payload);
            } else {
                await usuariosService.createPermiso(payload);
            }
            await loadPermisos();
            setShowModal(false);
            setEditingItem(null);
        } catch (err) {
            console.error('Error guardando permiso', err);
        } finally { setSaving(false); }
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            setSaving(true);
            await usuariosService.deletePermiso(itemToDelete.id_permiso);
            await loadPermisos();
            setShowConfirm(false);
            setItemToDelete(null);
        } catch (err) {
            console.error('Error eliminando permiso', err);
        } finally { setSaving(false); }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold">Permisos</h1>
                    <p className="text-sm text-gray-500">Gestiona los permisos del sistema</p>
                </div>
                <div>
                    <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded flex items-center space-x-2">
                        <i className="ri-add-line"></i><span>Nuevo permiso</span>
                    </button>
                </div>
            </div>

            <PermisosTable items={items} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />

            <PermisosModal show={showModal} editingItem={editingItem} saving={saving} onClose={() => setShowModal(false)} onSave={handleSave} />

            <PermisosConfirmModal
                show={showConfirm}
                title="Eliminar permiso"
                message={`¿Eliminar permiso "${itemToDelete?.nombre}"?`}
                loading={saving}
                onConfirm={confirmDelete}
                onCancel={() => setShowConfirm(false)}
            />
        </div>
    );
}