import { useEffect, useState } from 'react';
import type {
    PropietarioItem,
    CreatePropietarioRequest,
    PaginatedResponse
} from '../../services/propietarioService';
import { propietarioService } from '../../services/propietarioService';

import {
    PropietariosHeader,
    PropietariosError,
    PropietariosStats,
    PropietariosFilters,
    PropietariosTable,
    PropietariosPagination,
    PropietariosModal,
    PropietariosConfirmModal
} from '../../components/propietarios';

export default function PropietariosPage() {
    const [items, setItems] = useState<PropietarioItem[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1,
    });
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<PropietarioItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchTerm), 400);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        loadPropietarios(pagination.page, pagination.limit, debouncedSearch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    useEffect(() => {
        loadPropietarios();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadPropietarios = async (page: number = 1, limit: number = 10, search: string = debouncedSearch) => {
        try {
            setLoading(true);
            setError('');
            const response: PaginatedResponse<PropietarioItem> = await propietarioService.getPropietarios(page, limit, search);
            setItems(response.data);
            setPagination(response.pagination);
        } catch (err) {
            console.error('Error cargando propietarios:', err);
            setError('Error al cargar los propietarios');
        } finally {
            setLoading(false);
        }
    };

    const goToPage = (page: number) => {
        if (page >= 1 && page <= pagination.pages) {
            loadPropietarios(page, pagination.limit, debouncedSearch);
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
        loadPropietarios(1, newLimit, debouncedSearch);
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
            await propietarioService.deletePropietario(itemToDelete);
            await loadPropietarios(pagination.page, pagination.limit, debouncedSearch);
        } catch (err: any) {
            console.error('Error al eliminar propietario:', err);
            const errorMessage = err?.response?.data?.error || err?.message || 'Error al eliminar el propietario';
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

    const handleEdit = (item: PropietarioItem) => {
        setEditingItem(item);
        setShowModal(true);
    };

    const handleSave = async (formData: FormData) => {
        try {
            setSaving(true);
            setError('');

            const itemData: CreatePropietarioRequest = {
                nombre: (formData.get('nombre') as string)?.trim(),
            };

            if (!itemData.nombre) {
                setError('El nombre es obligatorio');
                setSaving(false);
                return;
            }

            if (editingItem) {
                await propietarioService.updatePropietario(editingItem.id_propietario, itemData);
            } else {
                await propietarioService.createPropietario(itemData);
            }

            await loadPropietarios(pagination.page, pagination.limit, debouncedSearch);
            setShowModal(false);
            setEditingItem(null);
        } catch (err: any) {
            console.error('Error guardando propietario:', err);
            const errorMessage = err?.response?.data?.error || err?.message || (editingItem ? 'Error al actualizar el propietario' : 'Error al crear el propietario');
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
                    <p className="text-gray-600">Cargando propietarios...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <PropietariosHeader
                title="Propietarios"
                description="Gestiona los propietarios del sistema"
                onAdd={() => setShowModal(true)}
            />

            <PropietariosError
                error={error}
                onClose={() => setError('')}
            />

            <PropietariosStats
                total={pagination.total}
                showing={items.length}
                page={pagination.page}
                pages={pagination.pages}
                limit={pagination.limit}
            />

            <PropietariosFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onRefresh={() => loadPropietarios(pagination.page, pagination.limit, debouncedSearch)}
            />

            <PropietariosTable
                items={items}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading && items.length > 0}
            />

            {pagination.pages > 1 && (
                <PropietariosPagination
                    pagination={pagination}
                    onPageChange={goToPage}
                    onLimitChange={handleLimitChange}
                    onNext={nextPage}
                    onPrev={prevPage}
                />
            )}

            <PropietariosModal
                show={showModal}
                editingItem={editingItem}
                saving={saving}
                onClose={handleCloseModal}
                onSave={handleSave}
            />

            <PropietariosConfirmModal
                show={showConfirmModal}
                title="Confirmar Eliminación"
                message="¿Está seguro de que desea eliminar este propietario? Esta acción no se puede deshacer."
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                loading={deleting}
            />
        </div>
    );
}

