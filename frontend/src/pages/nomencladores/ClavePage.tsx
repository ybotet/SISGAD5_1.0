import { useState, useEffect } from 'react';
import type {
    ClaveItem,
    CreateClaveRequest,
    PaginatedResponse
} from '../../services/claveService';
import { claveService } from '../../services/claveService';

// Components
import {
    ClaveHeader,
    ClaveError,
    ClaveStats,
    ClaveFilters,
    ClaveTable,
    ClavePagination,
    ClaveModal,
    ClaveConfirmModal
} from '../../components/clave';

export default function ClavePage() {
    // Estados
    const [items, setItems] = useState<ClaveItem[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1,
    });
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<ClaveItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [estadoFilter, setEstadoFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [saving, setSaving] = useState(false);

    // Estados para la confirmación de eliminación
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Cargar datos
    useEffect(() => {
        loadClaves();
    }, []);

    // Cargar claves cuando cambia el término de búsqueda o filtro de estado
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadClaves(1, pagination.limit, searchTerm, estadoFilter);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, estadoFilter]);

    const loadClaves = async (page: number = 1, limit: number = 10, search: string = '', estado: string = '') => {
        try {
            setLoading(true);
            setError('');

            const response: PaginatedResponse<ClaveItem> = await claveService.getClaves(
                page,
                limit,
                search,
                estado
            );

            setItems(response.data);
            setPagination(response.pagination);
        } catch (err) {
            setError('Error al cargar las claves');
            console.error('Error loading claves:', err);
        } finally {
            setLoading(false);
        }
    };

    // Función para manejar cambio de filtro de estado
    const handleEstadoFilterChange = (estado: string) => {
        setEstadoFilter(estado);
    };

    // Funciones de paginación
    const goToPage = (page: number) => {
        if (page >= 1 && page <= pagination.pages) {
            loadClaves(page, pagination.limit, searchTerm, estadoFilter);
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
        loadClaves(1, newLimit, searchTerm, estadoFilter);
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

            await claveService.deleteClave(itemToDelete);
            console.log('✅ Eliminación exitosa');

            // Recargar los datos
            await loadClaves(pagination.page, pagination.limit, searchTerm, estadoFilter);

        } catch (err: any) {
            console.error('❌ Error en eliminación:', err);
            const errorMessage = err?.response?.data?.error || err?.message || 'Error al eliminar la clave';
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
    const handleEdit = (item: ClaveItem) => {
        setEditingItem(item);
        setShowModal(true);
    };

    const handleSave = async (formData: FormData) => {
        try {
            setSaving(true);
            setError('');

            const itemData: CreateClaveRequest = {
                clave: formData.get('clave') as string,
                descripcion: formData.get('descripcion') as string,
                valor_p: formData.get('valor_p') as string || undefined,
                es_pendiente: formData.get('es_pendiente') === 'true'
            };

            if (editingItem) {
                await claveService.updateClave(editingItem.id_clave, itemData);
            } else {
                await claveService.createClave(itemData);
            }

            loadClaves(pagination.page, pagination.limit, searchTerm, estadoFilter);
            setShowModal(false);
            setEditingItem(null);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.error || err?.message ||
                (editingItem ? 'Error al actualizar la clave' : 'Error al crear la clave');
            setError(errorMessage);
            console.error('Error saving clave:', err);
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
                    <p className="text-gray-600">Cargando claves...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <ClaveHeader
                title="Claves"
                description="Gestiona las claves del sistema"
                onAdd={() => setShowModal(true)}
            />

            {/* Error */}
            <ClaveError
                error={error}
                onClose={() => setError('')}
            />

            {/* Stats */}
            <ClaveStats
                total={pagination.total}
                showing={items.length}
                page={pagination.page}
                pages={pagination.pages}
                limit={pagination.limit}
            />

            {/* Filters */}
            <ClaveFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                estadoFilter={estadoFilter}
                onEstadoFilterChange={handleEstadoFilterChange}
                onRefresh={() => loadClaves(pagination.page, pagination.limit, searchTerm, estadoFilter)}
            />

            {/* Table */}
            <ClaveTable
                items={items}
                searchTerm={searchTerm}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading && items.length > 0}
            />

            {/* Pagination */}
            {pagination.pages > 1 && (
                <ClavePagination
                    pagination={pagination}
                    onPageChange={goToPage}
                    onLimitChange={handleLimitChange}
                    onNext={nextPage}
                    onPrev={prevPage}
                />
            )}

            {/* Modal de Crear/Editar */}
            <ClaveModal
                show={showModal}
                editingItem={editingItem}
                saving={saving}
                onClose={handleCloseModal}
                onSave={handleSave}
            />

            {/* Modal de Confirmación de Eliminación */}
            <ClaveConfirmModal
                show={showConfirmModal}
                title="Confirmar Eliminación"
                message="¿Está seguro de que desea eliminar esta clave? Esta acción no se puede deshacer."
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                loading={deleting}
            />
        </div>
    );
}