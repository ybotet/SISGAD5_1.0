import { useState, useEffect } from 'react';
import type {
    TipoMovimientoItem,
    CreateTipoMovimientoRequest,
    PaginatedResponse
} from '../../services/tipomovimientoService';
import { tipomovimientoService } from '../../services/tipomovimientoService';

// Components
import {
    TipoMovimientoHeader,
    TipoMovimientoError,
    TipoMovimientoStats,
    TipoMovimientoFilters,
    TipoMovimientoTable,
    TipoMovimientoPagination,
    TipoMovimientoModal,
    TipoMovimientoConfirmModal
} from '../../components/tipomovimiento';

export default function TipoMovimientoPage() {
    // Estados
    const [items, setItems] = useState<TipoMovimientoItem[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1,
    });
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<TipoMovimientoItem | null>(null);
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
        loadTiposMovimiento();
    }, []);

    // Cargar tipos de movimiento cuando cambia el término de búsqueda
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadTiposMovimiento(1, pagination.limit, searchTerm);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const loadTiposMovimiento = async (page: number = 1, limit: number = 10, search: string = '') => {
        try {
            setLoading(true);
            setError('');
            const response: PaginatedResponse<TipoMovimientoItem> = await tipomovimientoService.getTiposMovimiento(page, limit, search);

            setItems(response.data);
            setPagination(response.pagination);
        } catch (err) {
            setError('Error al cargar los tipos de movimiento');
            console.error('Error loading tipos movimiento:', err);
        } finally {
            setLoading(false);
        }
    };

    // Funciones de paginación
    const goToPage = (page: number) => {
        if (page >= 1 && page <= pagination.pages) {
            loadTiposMovimiento(page, pagination.limit, searchTerm);
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
        loadTiposMovimiento(1, newLimit, searchTerm);
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

            await tipomovimientoService.deleteTipoMovimiento(itemToDelete);
            console.log('✅ Eliminación exitosa');

            // Recargar los datos
            await loadTiposMovimiento(pagination.page, pagination.limit, searchTerm);

        } catch (err: any) {
            console.error('❌ Error en eliminación:', err);
            const errorMessage = err?.response?.data?.error || err?.message || 'Error al eliminar el tipo de movimiento';
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
    const handleEdit = (item: TipoMovimientoItem) => {
        setEditingItem(item);
        setShowModal(true);
    };

    const handleSave = async (formData: FormData) => {
        try {
            setSaving(true);
            setError('');

            const itemData: CreateTipoMovimientoRequest = {
                movimiento: formData.get('movimiento') as string,
            };

            if (editingItem) {
                await tipomovimientoService.updateTipoMovimiento(editingItem.id_tipomovimiento, itemData);
            } else {
                await tipomovimientoService.createTipoMovimiento(itemData);
            }

            loadTiposMovimiento(pagination.page, pagination.limit, searchTerm);
            setShowModal(false);
            setEditingItem(null);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.error || err?.message || 
                (editingItem ? 'Error al actualizar el tipo de movimiento' : 'Error al crear el tipo de movimiento');
            setError(errorMessage);
            console.error('Error saving tipo movimiento:', err);
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
                    <p className="text-gray-600">Cargando tipos de movimiento...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <TipoMovimientoHeader
                title="Tipos de Movimiento"
                description="Gestiona los tipos de movimiento del sistema"
                onAdd={() => setShowModal(true)}
            />

            {/* Error */}
            <TipoMovimientoError
                error={error}
                onClose={() => setError('')}
            />

            {/* Stats */}
            <TipoMovimientoStats
                total={pagination.total}
                showing={items.length}
                page={pagination.page}
                pages={pagination.pages}
                limit={pagination.limit}
            />

            {/* Filters */}
            <TipoMovimientoFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onRefresh={() => loadTiposMovimiento(pagination.page, pagination.limit, searchTerm)}
            />

            {/* Table */}
            <TipoMovimientoTable
                items={items}
                searchTerm={searchTerm}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading && items.length > 0}
            />

            {/* Pagination */}
            {pagination.pages > 1 && (
                <TipoMovimientoPagination
                    pagination={pagination}
                    onPageChange={goToPage}
                    onLimitChange={handleLimitChange}
                    onNext={nextPage}
                    onPrev={prevPage}
                />
            )}

            {/* Modal de Crear/Editar */}
            <TipoMovimientoModal
                show={showModal}
                editingItem={editingItem}
                saving={saving}
                onClose={handleCloseModal}
                onSave={handleSave}
            />

            {/* Modal de Confirmación de Eliminación */}
            <TipoMovimientoConfirmModal
                show={showConfirmModal}
                title="Confirmar Eliminación"
                message="¿Está seguro de que desea eliminar este tipo de movimiento? Esta acción no se puede deshacer."
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                loading={deleting}
            />
        </div>
    );
}

