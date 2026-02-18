import { useState, useEffect } from 'react';
import type {
    SenalizacionItem,
    CreateSenalizacionRequest,
    PaginatedResponse
} from '../../services/senalizacionService';
import { senalizacionService } from '../../services/senalizacionService';

// Components
import {
    SenalizacionHeader,
    SenalizacionError,
    SenalizacionStats,
    SenalizacionFilters,
    SenalizacionTable,
    SenalizacionPagination,
    SenalizacionModal,
    SenalizacionConfirmModal
} from '../../components/senalizacion';

export default function SenalizacionPage() {
    // Estados
    const [items, setItems] = useState<SenalizacionItem[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1,
    });
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<SenalizacionItem | null>(null);
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
        loadSenalizacion();
    }, []);

    // Cargar senalizacion cuando cambia el término de búsqueda
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (pagination.page === 1) {
                loadSenalizacion(1, pagination.limit, searchTerm);
            } else {
                loadSenalizacion(1, pagination.limit, searchTerm);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const loadSenalizacion = async (page: number = 1, limit: number = 10, search: string = '') => {
        try {
            setLoading(true);
            setError('');
            const response: PaginatedResponse<SenalizacionItem> = await senalizacionService.getSenalizacion(page, limit, search);

            setItems(response.data);
            setPagination(response.pagination);
        } catch (err) {
            setError('Error al cargar los senalizacion');
            console.error('Error loading senalizacion:', err);
        } finally {
            setLoading(false);
        }
    };

    // Funciones de paginación
    const goToPage = (page: number) => {
        if (page >= 1 && page <= pagination.pages) {
            loadSenalizacion(page, pagination.limit, searchTerm);
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
        loadSenalizacion(1, newLimit, searchTerm);
    };

    // Funciones para eliminar con confirmación modal
    const handleDelete = (id: number) => {
        console.log('Solicitando eliminación para ID:', id);
        setItemToDelete(id);
        setShowConfirmModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        console.log('Confirsenalizacion eliminación para ID:', itemToDelete);

        try {
            setDeleting(true);
            setError('');

            await senalizacionService.deleteSenalizacion(itemToDelete);
            console.log('✅ Eliminación exitosa');

            // Recargar los datos
            await loadSenalizacion(pagination.page, pagination.limit, searchTerm);

        } catch (err: any) {
            console.error('❌ Error en eliminación:', err);
            const errorMessage = err?.response?.data?.error || err?.message || 'Error al eliminar el senalizacion';
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
    const handleEdit = (item: SenalizacionItem) => {
        setEditingItem(item);
        setShowModal(true);
    };

    const handleSave = async (formData: FormData) => {
        try {
            setSaving(true);
            setError('');

            const itemData: CreateSenalizacionRequest = {
                senalizacion: formData.get('senalizacion') as string,
            };

            if (editingItem) {
                await senalizacionService.updateSenalizacion(editingItem.id_senalizacion, itemData);
            } else {
                await senalizacionService.createSenalizacion(itemData);
            }

            loadSenalizacion(pagination.page, pagination.limit, searchTerm);
            setShowModal(false);
            setEditingItem(null);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.error || err?.message ||
                (editingItem ? 'Error al actualizar el senalizacion' : 'Error al crear el senalizacion');
            setError(errorMessage);
            console.error('Error saving senalizacion:', err);
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
                    <p className="text-gray-600">Cargando señalización...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <SenalizacionHeader
                title="Señalización"
                description="Gestiona las señalizaciones del sistema"
                onAdd={() => setShowModal(true)}
            />

            {/* Error */}
            <SenalizacionError
                error={error}
                onClose={() => setError('')}
            />

            {/* Stats */}
            <SenalizacionStats
                total={pagination.total}
                showing={items.length}
                page={pagination.page}
                pages={pagination.pages}
                limit={pagination.limit}
            />

            {/* Filters */}
            <SenalizacionFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onRefresh={() => loadSenalizacion(pagination.page, pagination.limit, searchTerm)}
            />

            {/* Table */}
            <SenalizacionTable
                items={items}
                searchTerm={searchTerm}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading && items.length > 0}
            />

            {/* Pagination */}
            {pagination.pages > 1 && (
                <SenalizacionPagination
                    pagination={pagination}
                    onPageChange={goToPage}
                    onLimitChange={handleLimitChange}
                    onNext={nextPage}
                    onPrev={prevPage}
                />
            )}

            {/* Modal de Crear/Editar */}
            <SenalizacionModal
                show={showModal}
                editingItem={editingItem}
                saving={saving}
                onClose={handleCloseModal}
                onSave={handleSave}
            />

            {/* Modal de Confirmación de Eliminación */}
            <SenalizacionConfirmModal
                show={showConfirmModal}
                title="Confirmar Eliminación"
                message="¿Está seguro de que desea eliminar esta señalización? Esta acción no se puede deshacer."
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                confirmText="Sí, Eliminar"
                cancelText="Cancelar"
                loading={deleting}
            />
        </div>
    );
}

