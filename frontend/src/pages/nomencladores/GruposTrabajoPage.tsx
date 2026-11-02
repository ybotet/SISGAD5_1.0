import { useEffect, useState } from 'react';
import type {
    GrupoTrabajoItem,
    CreateGrupoTrabajoRequest,
    PaginatedResponse
} from '../../services/grupowService';
import { grupowService } from '../../services/grupowService';

import {
    GruposTrabajoHeader,
    GruposTrabajoError,
    GruposTrabajoStats,
    GruposTrabajoFilters,
    GruposTrabajoTable,
    GruposTrabajoPagination,
    GruposTrabajoModal,
    GruposTrabajoConfirmModal
} from '../../components/grupow';

export default function GruposTrabajoPage() {
    const [items, setItems] = useState<GrupoTrabajoItem[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1,
    });
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<GrupoTrabajoItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadGruposTrabajo(pagination.page, pagination.limit, debouncedSearch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchTerm), 400);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        loadGruposTrabajo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadGruposTrabajo = async (page: number = 1, limit: number = 10, search: string = debouncedSearch) => {
        try {
            setLoading(true);
            setError('');
            const response: PaginatedResponse<GrupoTrabajoItem> = await grupowService.getGruposTrabajo(page, limit, search);
            setItems(response.data);
            setPagination(response.pagination);
        } catch (err) {
            console.error('Error cargando grupos de trabajo:', err);
            setError('Error al cargar los grupos de trabajo');
        } finally {
            setLoading(false);
        }
    };

    const goToPage = (page: number) => {
        if (page >= 1 && page <= pagination.pages) {
            loadGruposTrabajo(page, pagination.limit, debouncedSearch);
        }
    };

    const nextPage = () => {
        if (pagination.page < pagination.pages) {
            goToPage(pagination.page + 1);
        }
    };

    const prevPage = () => {
        if (pagination.page > 1) {
            goToPage(pagination.page - 1);
        }
    };

    const handleLimitChange = (newLimit: number) => {
        loadGruposTrabajo(1, newLimit, debouncedSearch);
    };

    const handleDelete = (id: number) => {
        setItemToDelete(id);
        setShowConfirmModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            setDeleting(true);
            setError('');
            await grupowService.deleteGrupoTrabajo(itemToDelete);
            await loadGruposTrabajo(pagination.page, pagination.limit, debouncedSearch);
        } catch (err: any) {
            console.error('Error al eliminar grupo de trabajo:', err);
            const errorMessage = err?.response?.data?.error || err?.message || 'Error al eliminar el grupo de trabajo';
            setError(errorMessage);
        } finally {
            setDeleting(false);
            setShowConfirmModal(false);
            setItemToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setShowConfirmModal(false);
        setItemToDelete(null);
    };

    const handleEdit = (item: GrupoTrabajoItem) => {
        setEditingItem(item);
        setShowModal(true);
    };

    const handleSave = async (formData: FormData) => {
        try {
            setSaving(true);
            setError('');

            const itemData: CreateGrupoTrabajoRequest = {
                grupo: (formData.get('grupo') as string)?.trim(),
            };

            if (!itemData.grupo) {
                setError('El nombre del grupo es obligatorio');
                setSaving(false);
                return;
            }

            if (editingItem) {
                await grupowService.updateGrupoTrabajo(editingItem.id_grupow, itemData);
            } else {
                await grupowService.createGrupoTrabajo(itemData);
            }

            await loadGruposTrabajo(pagination.page, pagination.limit, debouncedSearch);
            setShowModal(false);
            setEditingItem(null);
        } catch (err: any) {
            console.error('Error guardando grupo de trabajo:', err);
            const errorMessage = err?.response?.data?.error || err?.message || (editingItem ? 'Error al actualizar el grupo de trabajo' : 'Error al crear el grupo de trabajo');
            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
    };

    if (loading && items.length === 0) {
        return (
            <div className="p-6 flex justify-center items-center h-64">
                <div className="text-center">
                    <i className="ri-loader-4-line animate-spin text-2xl text-blue-600 mb-2"></i>
                    <p className="text-gray-600">Cargando grupos de trabajo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <GruposTrabajoHeader
                title="Grupos de Trabajo"
                description="Gestiona los grupos de trabajo del sistema"
                onAdd={() => setShowModal(true)}
            />

            <GruposTrabajoError
                error={error}
                onClose={() => setError('')}
            />

            <GruposTrabajoStats
                total={pagination.total}
                showing={items.length}
                page={pagination.page}
                pages={pagination.pages}
                limit={pagination.limit}
            />

            <GruposTrabajoFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onRefresh={() => loadGruposTrabajo(pagination.page, pagination.limit, debouncedSearch)}
            />

            <GruposTrabajoTable
                items={items}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading && items.length > 0}
            />

            {pagination.pages > 1 && (
                <GruposTrabajoPagination
                    pagination={pagination}
                    onPageChange={goToPage}
                    onLimitChange={handleLimitChange}
                    onNext={nextPage}
                    onPrev={prevPage}
                />
            )}

            <GruposTrabajoModal
                show={showModal}
                editingItem={editingItem}
                saving={saving}
                onClose={handleCloseModal}
                onSave={handleSave}
            />

            <GruposTrabajoConfirmModal
                show={showConfirmModal}
                title="Confirmar Eliminación"
                message="¿Está seguro de que desea eliminar este grupo de trabajo? Esta acción no se puede deshacer."
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                loading={deleting}
            />
        </div>
    );
}


