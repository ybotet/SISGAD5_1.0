import { useState, useEffect } from 'react';
import type {
    ClasificadorclaveItem,
    CreateClasificadorclaveRequest,
    PaginatedResponse
} from '../../services/clasificadorclaveService';
import { clasificadorclaveService } from '../../services/clasificadorclaveService';

// Components
import {
    ClasificadorClaveHeader,
    ClasificadorClaveError,
    ClasificadorClaveStats,
    ClasificadorClaveFilters,
    ClasificadorClaveTable,
    ClasificadorClavePagination,
    ClasificadorClaveModal,
    ClasificadorClaveConfirmModal
} from '../../components/clasificadorclave';

export default function ClasificadorClavePage() {
    // Estados
    const [items, setItems] = useState<ClasificadorclaveItem[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1,
    });
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<ClasificadorclaveItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [saving, setSaving] = useState(false);

    // Estados para la confirmación de eliminación
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Cargar datos
    useEffect(() => {
        loadClasificadoresClave();
    }, []);

    // Cargar clasificadores cuando cambia el término de búsqueda
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadClasificadoresClave(1, pagination.limit, searchTerm);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const loadClasificadoresClave = async (page: number = 1, limit: number = 10, search: string = '') => {
        try {
            setLoading(true);
            setError('');
            const response: PaginatedResponse<ClasificadorclaveItem> = await clasificadorclaveService.getClasificadoresClave(page, limit, search);

            setItems(response.data);
            setPagination(response.pagination);
        } catch (err) {
            setError('Error al cargar los clasificadores de clave');
            console.error('Error loading clasificadores clave:', err);
        } finally {
            setLoading(false);
        }
    };

    // Funciones de paginación
    const goToPage = (page: number) => {
        if (page >= 1 && page <= pagination.pages) {
            loadClasificadoresClave(page, pagination.limit, searchTerm);
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
        loadClasificadoresClave(1, newLimit, searchTerm);
    };

    // Funciones para eliminar con confirmación modal
    const handleDelete = (id: number) => {
        console.log('Solicitando eliminación para ID:', id);
        setItemToDelete(id);
        setShowConfirmModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        console.log('Confirmando eliminación para ID:', itemToDelete);

        try {
            setDeleting(true);
            setError('');

            await clasificadorclaveService.deleteClasificadorclave(itemToDelete);
            console.log('✅ Eliminación exitosa');

            // Recargar los datos
            await loadClasificadoresClave(pagination.page, pagination.limit, searchTerm);

        } catch (err: any) {
            console.error('❌ Error en eliminación:', err);
            const errorMessage = err?.response?.data?.error || err?.message || 'Error al eliminar el clasificador de clave';
            setError(errorMessage);
        } finally {
            // Siempre cerrar el modal y resetear estados
            setDeleting(false);
            setShowConfirmModal(false);
            setItemToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        console.log('Eliminación cancelada por el usuario');
        setShowConfirmModal(false);
        setItemToDelete(null);
    };

    // Funciones para editar y guardar
    const handleEdit = (item: ClasificadorclaveItem) => {
        setEditingItem(item);
        setShowModal(true);
    };

    const handleSave = async (formData: FormData) => {
        try {
            setSaving(true);
            setError('');

            const itemData: CreateClasificadorclaveRequest = {
                clasificador: formData.get('clasificador') as string,
            };

            if (editingItem) {
                await clasificadorclaveService.updateClasificadorclave(editingItem.id_clasificadorclave, itemData);
            } else {
                await clasificadorclaveService.createClasificadorclave(itemData);
            }

            loadClasificadoresClave(pagination.page, pagination.limit, searchTerm);
            setShowModal(false);
            setEditingItem(null);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.error || err?.message || 
                (editingItem ? 'Error al actualizar el clasificador de clave' : 'Error al crear el clasificador de clave');
            setError(errorMessage);
            console.error('Error saving clasificador clave:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
    };

    // Loading state
    if (loading && items.length === 0) {
        return (
            <div className="p-6 flex justify-center items-center h-64">
                <div className="text-center">
                    <i className="ri-loader-4-line animate-spin text-2xl text-blue-600 mb-2"></i>
                    <p className="text-gray-600">Cargando clasificadores de clave...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <ClasificadorClaveHeader
                title="Clasificadores de Clave"
                description="Gestiona los clasificadores de clave del sistema"
                onAdd={() => setShowModal(true)}
            />

            {/* Error */}
            <ClasificadorClaveError
                error={error}
                onClose={() => setError('')}
            />

            {/* Stats */}
            <ClasificadorClaveStats
                total={pagination.total}
                showing={items.length}
                page={pagination.page}
                pages={pagination.pages}
                limit={pagination.limit}
            />

            {/* Filters */}
            <ClasificadorClaveFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onRefresh={() => loadClasificadoresClave(pagination.page, pagination.limit, searchTerm)}
            />

            {/* Table */}
            <ClasificadorClaveTable
                items={items}
                searchTerm={searchTerm}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading && items.length > 0}
            />

            {/* Pagination */}
            {pagination.pages > 1 && (
                <ClasificadorClavePagination
                    pagination={pagination}
                    onPageChange={goToPage}
                    onLimitChange={handleLimitChange}
                    onNext={nextPage}
                    onPrev={prevPage}
                />
            )}

            {/* Modal de Crear/Editar */}
            <ClasificadorClaveModal
                show={showModal}
                editingItem={editingItem}
                saving={saving}
                onClose={handleCloseModal}
                onSave={handleSave}
            />

            {/* Modal de Confirmación de Eliminación */}
            <ClasificadorClaveConfirmModal
                show={showConfirmModal}
                title="Confirmar Eliminación"
                message="¿Está seguro de que desea eliminar este clasificador de clave? Esta acción no se puede deshacer."
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                loading={deleting}
            />
        </div>
    );
}

