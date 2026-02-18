import { useState, useEffect } from 'react';
import type {
    PlantaItem,
    CreatePlantaRequest,
    PaginatedResponse
} from '../../services/plantaService';
import { plantaService } from '../../services/plantaService';

// Components
import {
    PlantaHeader,
    PlantaError,
    PlantaStats,
    PlantaFilters,
    PlantaTable,
    PlantaPagination,
    PlantaModal,
    PlantaConfirmModal
} from '../../components/planta';

export default function PlantaPage() {
    // Estados
    const [items, setItems] = useState<PlantaItem[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1,
    });
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<PlantaItem | null>(null);
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
        loadPlantas();
    }, []);

    // Cargar plantas cuando cambia el término de búsqueda
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadPlantas(1, pagination.limit, searchTerm);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const loadPlantas = async (page: number = 1, limit: number = 10, search: string = '') => {
        try {
            setLoading(true);
            setError('');
            const response: PaginatedResponse<PlantaItem> = await plantaService.getPlantas(page, limit, search);

            setItems(response.data);
            setPagination(response.pagination);
        } catch (err) {
            setError('Error al cargar las plantas');
            console.error('Error loading plantas:', err);
        } finally {
            setLoading(false);
        }
    };

    // Funciones de paginación
    const goToPage = (page: number) => {
        if (page >= 1 && page <= pagination.pages) {
            loadPlantas(page, pagination.limit, searchTerm);
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
        loadPlantas(1, newLimit, searchTerm);
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

            await plantaService.deletePlanta(itemToDelete);
            console.log('✅ Eliminación exitosa');

            // Recargar los datos
            await loadPlantas(pagination.page, pagination.limit, searchTerm);

        } catch (err: any) {
            console.error('❌ Error en eliminación:', err);
            const errorMessage = err?.response?.data?.error || err?.message || 'Error al eliminar la planta';
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
    const handleEdit = (item: PlantaItem) => {
        setEditingItem(item);
        setShowModal(true);
    };

    const handleSave = async (formData: FormData) => {
        try {
            setSaving(true);
            setError('');

            const itemData: CreatePlantaRequest = {
                codigo: parseInt(formData.get('codigo') as string),
                planta: formData.get('planta') as string,
            };

            if (editingItem) {
                await plantaService.updatePlanta(editingItem.id_planta, itemData);
            } else {
                await plantaService.createPlanta(itemData);
            }

            loadPlantas(pagination.page, pagination.limit, searchTerm);
            setShowModal(false);
            setEditingItem(null);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.error || err?.message ||
                (editingItem ? 'Error al actualizar la planta' : 'Error al crear la planta');
            setError(errorMessage);
            console.error('Error saving planta:', err);
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
                    <p className="text-gray-600">Cargando plantas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <PlantaHeader
                title="Plantas"
                description="Gestiona las plantas del sistema"
                onAdd={() => setShowModal(true)}
            />

            {/* Error */}
            <PlantaError
                error={error}
                onClose={() => setError('')}
            />

            {/* Stats */}
            <PlantaStats
                total={pagination.total}
                showing={items.length}
                page={pagination.page}
                pages={pagination.pages}
                limit={pagination.limit}
            />

            {/* Filters */}
            <PlantaFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onRefresh={() => loadPlantas(pagination.page, pagination.limit, searchTerm)}
            />

            {/* Table */}
            <PlantaTable
                items={items}
                searchTerm={searchTerm}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading && items.length > 0}
            />

            {/* Pagination */}
            {pagination.pages > 1 && (
                <PlantaPagination
                    pagination={pagination}
                    onPageChange={goToPage}
                    onLimitChange={handleLimitChange}
                    onNext={nextPage}
                    onPrev={prevPage}
                />
            )}

            {/* Modal de Crear/Editar */}
            <PlantaModal
                show={showModal}
                editingItem={editingItem}
                saving={saving}
                onClose={handleCloseModal}
                onSave={handleSave}
            />

            {/* Modal de Confirmación de Eliminación */}
            <PlantaConfirmModal
                show={showConfirmModal}
                title="Confirmar Eliminación"
                message="¿Está seguro de que desea eliminar esta planta? Esta acción no se puede deshacer."
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                loading={deleting}
            />
        </div>
    );
}