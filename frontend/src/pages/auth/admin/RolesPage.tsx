import { useEffect, useState } from 'react';
import type { Rol } from '../../../services/usuariosService';
import { usuariosService } from '../../../services/usuariosService';
import RolesTable from '../../../components/roles/RolesTable';
import RolesModal from '../../../components/roles/RolesModal';
import RolesConfirmModal from '../../../components/roles/RolesConfirmModal';

export default function RolesPage() {
    const [items, setItems] = useState<Rol[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Rol | null>(null);
    const [saving, setSaving] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Rol | null>(null);

    useEffect(() => { loadRoles(); }, []);

    const loadRoles = async () => {
        try {
            setLoading(true);
            const data = await usuariosService.getRoles();
            // getRoles returns array
            setItems(data || []);
        } catch (err) {
            console.error('Error cargando roles', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => { setEditingItem(null); setShowModal(true); };
    const handleEdit = (r: Rol) => { setEditingItem(r); setShowModal(true); };
    const handleDelete = (r: Rol) => { setItemToDelete(r); setShowConfirm(true); };

    const handleSave = async (payload: { nombre: string; descripcion?: string }) => {
        try {
            setSaving(true);
            if (editingItem) {
                await usuariosService.updateRol(editingItem.id_rol, payload);
            } else {
                await usuariosService.createRol(payload);
            }
            await loadRoles();
            setShowModal(false);
            setEditingItem(null);
        } catch (err) {
            console.error('Error guardando rol', err);
        } finally { setSaving(false); }
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            setSaving(true);
            await usuariosService.deleteRol(itemToDelete.id_rol);
            await loadRoles();
            setShowConfirm(false);
            setItemToDelete(null);
        } catch (err) {
            console.error('Error eliminando rol', err);
        } finally { setSaving(false); }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold">Roles</h1>
                    <p className="text-sm text-gray-500">Gestiona los roles del sistema</p>
                </div>
                <div>
                    <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded"> <i className="ri-add-line"> </i><span>Nuevo rol</span></button>
                </div>
            </div>

            <RolesTable items={items} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />

            <RolesModal show={showModal} editingItem={editingItem} saving={saving} onClose={() => setShowModal(false)} onSave={handleSave} />

            <RolesConfirmModal show={showConfirm} title="Eliminar rol" message={`¿Eliminar rol "${itemToDelete?.nombre}"?`} loading={saving} onConfirm={confirmDelete} onCancel={() => setShowConfirm(false)} />
        </div>
    );
}