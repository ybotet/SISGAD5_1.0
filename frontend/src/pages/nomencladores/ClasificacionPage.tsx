import { useState, useEffect } from 'react';
import type {
    ClasificacionItem,
    CreateClasificacionRequest,
    PaginatedResponse
} from '../../services/clasificacionService';
import { clasificacionService } from '../../services/clasificacionService';

// Components
import {
    ClasificacionHeader,
    ClasificacionError,
    ClasificacionStats,
    ClasificacionFilters,
    ClasificacionTable,
    ClasificacionPagination,
    ClasificacionModal,
    ClasificacionConfirmModal
} from '../../components/clasificacion';

interface ClasificacionPageProps {
    type: string;
}

export default function ClasificacionPage({ type }: ClasificacionPageProps) {
    // Estados existentes
    const [items, setItems] = useState<ClasificacionItem[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1,
    });
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<ClasificacionItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [saving, setSaving] = useState(false);

    // NUEVOS ESTADOS para la confirmación
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Cargar datos
    useEffect(() => {
        loadClasificaciones();
    }, [type]);

    const loadClasificaciones = async (page: number = 1, limit: number = 10) => {
        try {
            setLoading(true);
            setError('');
            const response: PaginatedResponse<ClasificacionItem> = await clasificacionService.getClasificaciones(type, page, limit);

            setItems(response.data);
            setPagination(response.pagination);
        } catch (err) {
            setError('Error al cargar las clasificaciones');
            console.error('Error loading classifications:', err);
        } finally {
            setLoading(false);
        }
    };

    // Funciones de paginación (mantener igual)
    const goToPage = (page: number) => {
        if (page >= 1 && page <= pagination.pages) {
            loadClasificaciones(page, pagination.limit);
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
        loadClasificaciones(1, newLimit);
    };

    // NUEVAS FUNCIONES para eliminar con confirmación modal
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

            await clasificacionService.deleteClasificacion(itemToDelete);
            console.log('Eliminación exitosa');

            // Recargar los datos
            await loadClasificaciones(pagination.page, pagination.limit);

        } catch (err: any) {
            console.error('Error en eliminación:', err);
            const errorMessage = err?.message || 'Error al eliminar la clasificación';
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

    // Funciones existentes (mantener igual)
    const handleEdit = (item: ClasificacionItem) => {
        setEditingItem(item);
        setShowModal(true);
    };

    const handleSave = async (formData: FormData) => {
        try {
            setSaving(true);
            setError('');

            const itemData: CreateClasificacionRequest = {
                nombre: formData.get('nombre') as string,
                tipo: type
            };

            if (editingItem) {
                await clasificacionService.updateClasificacion(editingItem.id_clasificacion, itemData);
            } else {
                await clasificacionService.createClasificacion(itemData);
            }

            loadClasificaciones(pagination.page, pagination.limit);
            setShowModal(false);
            setEditingItem(null);
        } catch (err) {
            setError(editingItem ? 'Error al actualizar la clasificación' : 'Error al crear la clasificación');
            console.error('Error saving classification:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
    };

    // Filtrado
    const filteredItems = items.filter(item =>
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    console.log('Items filtrados:', filteredItems.length);


    // Loading state
    if (loading && items.length === 0) {
        return (
            <div className="p-6 flex justify-center items-center h-64">
                <div className="text-center">
                    <i className="ri-loader-4-line animate-spin text-2xl text-blue-600 mb-2"></i>
                    <p className="text-gray-600">Cargando clasificaciones...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <ClasificacionHeader
                title="Clasificación"
                description="Gestiona los elementos de clasificación"
                onAdd={() => setShowModal(true)}
            />

            {/* Error */}
            <ClasificacionError
                error={error}
                onClose={() => setError('')}
            />

            {/* Stats */}
            <ClasificacionStats
                total={pagination.total}
                showing={items.length}
                page={pagination.page}
                pages={pagination.pages}
                limit={pagination.limit}
            />

            {/* Filters */}
            <ClasificacionFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onRefresh={() => loadClasificaciones(pagination.page, pagination.limit)}
            />

            {/* Table */}
            <ClasificacionTable
                items={items}
                searchTerm={searchTerm}
                onEdit={handleEdit}
                onDelete={handleDelete} // ← Ahora usa la nueva función
                loading={loading && items.length > 0}
            />

            {/* Pagination */}
            {pagination.pages > 1 && (
                <ClasificacionPagination
                    pagination={pagination}
                    onPageChange={goToPage}
                    onLimitChange={handleLimitChange}
                    onNext={nextPage}
                    onPrev={prevPage}
                />
            )}

            {/* Modal de Crear/Editar */}
            <ClasificacionModal
                show={showModal}
                editingItem={editingItem}
                saving={saving}
                onClose={handleCloseModal}
                onSave={handleSave}
            />

            {/* NUEVO: Modal de Confirmación de Eliminación */}
            <ClasificacionConfirmModal
                show={showConfirmModal}
                title="Confirmar Eliminación"
                message="¿Está seguro de que desea eliminar este elemento? Esta acción no se puede deshacer."
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                confirmText="Sí, Eliminar"
                cancelText="Cancelar"
                loading={deleting}
            />
        </div>
    );
}