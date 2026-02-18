import { useEffect, useState } from 'react';
import type {
    TrabajadorItem,
    CreateTrabajadorRequest,
    PaginatedResponse
} from '../services/trabajadorService';
import { trabajadorService } from '../services/trabajadorService';
import type { GrupoTrabajoItem } from '../services/grupowService';
import { grupowService } from '../services/grupowService';

import {
    TrabajadorHeader,
    TrabajadorError,
    TrabajadorStats,
    TrabajadorFilters,
    TrabajadorTable,
    TrabajadorPagination,
    TrabajadorModal,
    TrabajadorConfirmModal
} from '../components/trabajador';

export default function TrabajadorPage() {
    const [items, setItems] = useState<TrabajadorItem[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1,
    });
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<TrabajadorItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [saving, setSaving] = useState(false);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [grupos, setGrupos] = useState<GrupoTrabajoItem[]>([]);

    useEffect(() => {
        loadGrupos();
        loadTrabajadores();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadTrabajadores(1, pagination.limit, searchTerm);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const loadGrupos = async () => {
        try {
            const response = await grupowService.getGruposTrabajo(1, 1000, '');
            setGrupos(response.data);
        } catch (err) {
            console.error('Error cargando grupos de trabajo:', err);
        }
    };

    const loadTrabajadores = async (page: number = 1, limit: number = 10, search: string = '') => {
        try {
            setLoading(true);
            setError('');
            const response: PaginatedResponse<TrabajadorItem> = await trabajadorService.getTrabajadores(page, limit, search);
            setItems(response.data);
            setPagination(response.pagination);
        } catch (err) {
            console.error('Error cargando trabajadores:', err);
            setError('Error al cargar los trabajadores');
        } finally {
            setLoading(false);
        }
    };

    const goToPage = (page: number) => {
        if (page >= 1 && page <= pagination.pages) {
            loadTrabajadores(page, pagination.limit, searchTerm);
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
        loadTrabajadores(1, newLimit, searchTerm);
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
            await trabajadorService.deleteTrabajador(itemToDelete);
            await loadTrabajadores(pagination.page, pagination.limit, searchTerm);
        } catch (err: any) {
            console.error('Error al eliminar trabajador:', err);
            const errorMessage = err?.response?.data?.error || err?.message || 'Error al eliminar el trabajador';
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

    const handleEdit = (item: TrabajadorItem) => {
        setEditingItem(item);
        setShowModal(true);
    };

    const handleSave = async (formData: FormData) => {
        try {
            setSaving(true);
            setError('');

            const activo = formData.get('activo') === 'on';
            const id_grupow_raw = formData.get('id_grupow') as string;
            const id_grupow = id_grupow_raw ? parseInt(id_grupow_raw, 10) : null;

            const itemData: CreateTrabajadorRequest = {
                clave_trabajador: (formData.get('clave_trabajador') as string) || null,
                nombre: (formData.get('nombre') as string) || null,
                cargo: (formData.get('cargo') as string) || null,
                activo,
                id_grupow,
            };

            if (editingItem) {
                await trabajadorService.updateTrabajador(editingItem.id_trabajador, itemData);
            } else {
                await trabajadorService.createTrabajador(itemData);
            }

            await loadTrabajadores(pagination.page, pagination.limit, searchTerm);
            setShowModal(false);
            setEditingItem(null);
        } catch (err: any) {
            console.error('Error guardando trabajador:', err);
            const errorMessage = err?.response?.data?.error || err?.message || (editingItem ? 'Error al actualizar el trabajador' : 'Error al crear el trabajador');
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
                    <p className="text-gray-600">Cargando trabajadores...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <TrabajadorHeader
                title="Trabajadores"
                description="Gestiona los trabajadores (Operarios)"
                onAdd={() => setShowModal(true)}
            />

            <TrabajadorError
                error={error}
                onClose={() => setError('')}
            />

            <TrabajadorStats
                total={pagination.total}
                showing={items.length}
                page={pagination.page}
                pages={pagination.pages}
                limit={pagination.limit}
            />

            <TrabajadorFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onRefresh={() => loadTrabajadores(pagination.page, pagination.limit, searchTerm)}
            />

            <TrabajadorTable
                items={items}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading && items.length > 0}
            />

            {pagination.pages > 1 && (
                <TrabajadorPagination
                    pagination={pagination}
                    onPageChange={goToPage}
                    onLimitChange={handleLimitChange}
                    onNext={nextPage}
                    onPrev={prevPage}
                />
            )}

            <TrabajadorModal
                show={showModal}
                editingItem={editingItem}
                saving={saving}
                grupos={grupos}
                onClose={handleCloseModal}
                onSave={handleSave}
            />

            <TrabajadorConfirmModal
                show={showConfirmModal}
                title="Confirmar Eliminación"
                message="¿Está seguro de que desea eliminar este trabajador? Esta acción no se puede deshacer."
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                loading={deleting}
            />
        </div>
    );
}

