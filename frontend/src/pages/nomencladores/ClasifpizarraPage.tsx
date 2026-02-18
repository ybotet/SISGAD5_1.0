import { useState, useEffect } from 'react';
import type {
    ClasifpizarraItem,
    CreateClasifpizarraRequest,
    PaginatedResponse
} from '../../services/clasifpizarraService';
import { clasifpizarraService } from '../../services/clasifpizarraService';

// Components
import {
    ClasifpizarraHeader,
    ClasifpizarraError,
    ClasifpizarraStats,
    ClasifpizarraFilters,
    ClasifpizarraTable,
    ClasifpizarraPagination,
    ClasifpizarraModal,
    ClasifpizarraConfirmModal
} from '../../components/clasifpizarra';

export default function ClasifpizarraPage() {
    // Estados
    const [items, setItems] = useState<ClasifpizarraItem[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1,
    });
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<ClasifpizarraItem | null>(null);
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
        loadClasificacionesPizarra();
    }, []);

    // Cargar clasificaciones cuando cambia el término de búsqueda
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadClasificacionesPizarra(1, pagination.limit, searchTerm);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const loadClasificacionesPizarra = async (page: number = 1, limit: number = 10, search: string = '') => {
        try {
            setLoading(true);
            setError('');
            const response: PaginatedResponse<ClasifpizarraItem> = await clasifpizarraService.getClasificacionesPizarra(page, limit, search);

            setItems(response.data);
            setPagination(response.pagination);
        } catch (err) {
            setError('Error al cargar las clasificaciones de pizarra');
            console.error('Error loading clasificaciones pizarra:', err);
        } finally {
            setLoading(false);
        }
    };

    // Funciones de paginación
    const goToPage = (page: number) => {
        if (page >= 1 && page <= pagination.pages) {
            loadClasificacionesPizarra(page, pagination.limit, searchTerm);
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
        loadClasificacionesPizarra(1, newLimit, searchTerm);
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

            await clasifpizarraService.deleteClasifpizarra(itemToDelete);
            console.log('✅ Eliminación exitosa');

            // Recargar los datos
            await loadClasificacionesPizarra(pagination.page, pagination.limit, searchTerm);

        } catch (err: any) {
            console.error('❌ Error en eliminación:', err);
            const errorMessage = err?.response?.data?.error || err?.message || 'Error al eliminar la clasificación de pizarra';
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
    const handleEdit = (item: ClasifpizarraItem) => {
        setEditingItem(item);
        setShowModal(true);
    };

    const handleSave = async (formData: FormData) => {
        try {
            setSaving(true);
            setError('');

            const itemData: CreateClasifpizarraRequest = {
                clasificacion: formData.get('clasificacion') as string,
            };

            if (editingItem) {
                await clasifpizarraService.updateClasifpizarra(editingItem.id_clasifpizarra, itemData);
            } else {
                await clasifpizarraService.createClasifpizarra(itemData);
            }

            loadClasificacionesPizarra(pagination.page, pagination.limit, searchTerm);
            setShowModal(false);
            setEditingItem(null);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.error || err?.message || 
                (editingItem ? 'Error al actualizar la clasificación de pizarra' : 'Error al crear la clasificación de pizarra');
            setError(errorMessage);
            console.error('Error saving clasificacion pizarra:', err);
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
                    <p className="text-gray-600">Cargando clasificaciones de pizarra...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <ClasifpizarraHeader
                title="Clasificaciones de Pizarra"
                description="Gestiona las clasificaciones de pizarra del sistema"
                onAdd={() => setShowModal(true)}
            />

            {/* Error */}
            <ClasifpizarraError
                error={error}
                onClose={() => setError('')}
            />

            {/* Stats */}
            <ClasifpizarraStats
                total={pagination.total}
                showing={items.length}
                page={pagination.page}
                pages={pagination.pages}
                limit={pagination.limit}
            />

            {/* Filters */}
            <ClasifpizarraFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onRefresh={() => loadClasificacionesPizarra(pagination.page, pagination.limit, searchTerm)}
            />

            {/* Table */}
            <ClasifpizarraTable
                items={items}
                searchTerm={searchTerm}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading && items.length > 0}
            />

            {/* Pagination */}
            {pagination.pages > 1 && (
                <ClasifpizarraPagination
                    pagination={pagination}
                    onPageChange={goToPage}
                    onLimitChange={handleLimitChange}
                    onNext={nextPage}
                    onPrev={prevPage}
                />
            )}

            {/* Modal de Crear/Editar */}
            <ClasifpizarraModal
                show={showModal}
                editingItem={editingItem}
                saving={saving}
                onClose={handleCloseModal}
                onSave={handleSave}
            />

            {/* Modal de Confirmación de Eliminación */}
            <ClasifpizarraConfirmModal
                show={showConfirmModal}
                title="Confirmar Eliminación"
                message="¿Está seguro de que desea eliminar esta clasificación de pizarra? Esta acción no se puede deshacer."
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                loading={deleting}
            />
        </div>
    );
}

