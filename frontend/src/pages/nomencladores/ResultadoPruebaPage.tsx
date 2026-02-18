import { useState, useEffect } from 'react';
import type {
    ResultadoPruebaItem,
    CreateResultadoPruebaRequest,
    PaginatedResponse
} from '../../services/resultadopruebaService';
import { resultadopruebaService } from '../../services/resultadopruebaService';

// Components
import {
    ResultadoPruebaHeader,
    ResultadoPruebaError,
    ResultadoPruebaStats,
    ResultadoPruebaFilters,
    ResultadoPruebaTable,
    ResultadoPruebaPagination,
    ResultadoPruebaModal,
    ResultadoPruebaConfirmModal
} from '../../components/resultadoprueba';

export default function ResultadoPruebaPage() {
    // Estados existentes
    const [items, setItems] = useState<ResultadoPruebaItem[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1,
    });
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<ResultadoPruebaItem | null>(null);
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
        loadResultadoPruebaes();
    }, []);

    const loadResultadoPruebaes = async (page: number = 1, limit: number = 10, search: string = '') => {
        try {
            setLoading(true);
            setError('');
            const response: PaginatedResponse<ResultadoPruebaItem> = await resultadopruebaService.getResultadoPrueba(page, limit, search);

            setItems(response.data);
            setPagination(response.pagination);
        } catch (err) {
            setError('Error al cargar los resultados de pruebas');
            console.error('Error loading classifications:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filtrado por búsqueda
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadResultadoPruebaes(1, pagination.limit, searchTerm);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Funciones de paginación (mantener igual)
    const goToPage = (page: number) => {
        if (page >= 1 && page <= pagination.pages) {
            loadResultadoPruebaes(page, pagination.limit);
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
        loadResultadoPruebaes(1, newLimit);
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

            await resultadopruebaService.deleteResultadoPrueba(itemToDelete);
            console.log('✅ Eliminación exitosa');

            // Recargar los datos
            await loadResultadoPruebaes(pagination.page, pagination.limit);

        } catch (err: any) {
            console.error('❌ Error en eliminación:', err);
            const errorMessage = err?.message || 'Error al eliminar el resultado de pruebas';
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
    const handleEdit = (item: ResultadoPruebaItem) => {
        setEditingItem(item);
        setShowModal(true);
    };

    const handleSave = async (formData: FormData) => {
        try {
            setSaving(true);
            setError('');

            const itemData: CreateResultadoPruebaRequest = {
                resultado: formData.get('resultado') as string,
                // tipo: type
            };

            if (editingItem) {
                await resultadopruebaService.updateResultadoPrueba(editingItem.id_resultadoprueba, itemData);
            } else {
                await resultadopruebaService.createResultadoPrueba(itemData);
            }

            loadResultadoPruebaes(pagination.page, pagination.limit);
            setShowModal(false);
            setEditingItem(null);
        } catch (err) {
            setError(editingItem ? 'Error al actualizar la resultado de pruebas' : 'Error al crear la resultado de pruebas');
            console.error('Error saving classification:', err);
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
                    <p className="text-gray-600">Cargando resultados de pruebas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <ResultadoPruebaHeader
                title="Resultado de Pruebas"
                description="Gestiona los elementos de resultado de pruebas"
                onAdd={() => setShowModal(true)}
            />

            {/* Error */}
            <ResultadoPruebaError
                error={error}
                onClose={() => setError('')}
            />

            {/* Stats */}
            <ResultadoPruebaStats
                total={pagination.total}
                showing={items.length}
                page={pagination.page}
                pages={pagination.pages}
                limit={pagination.limit}
            />

            {/* Filters */}
            <ResultadoPruebaFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onRefresh={() => loadResultadoPruebaes(pagination.page, pagination.limit)}
            />

            {/* Table */}
            <ResultadoPruebaTable
                items={items}
                searchTerm={searchTerm}
                onEdit={handleEdit}
                onDelete={handleDelete} // ← Ahora usa la nueva función
                loading={loading && items.length > 0}
            />

            {/* Pagination */}
            {pagination.pages > 1 && (
                <ResultadoPruebaPagination
                    pagination={pagination}
                    onPageChange={goToPage}
                    onLimitChange={handleLimitChange}
                    onNext={nextPage}
                    onPrev={prevPage}
                />
            )}

            {/* Modal de Crear/Editar */}
            <ResultadoPruebaModal
                show={showModal}
                editingItem={editingItem}
                saving={saving}
                onClose={handleCloseModal}
                onSave={handleSave}
            />

            {/* NUEVO: Modal de Confirmación de Eliminación */}
            <ResultadoPruebaConfirmModal
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