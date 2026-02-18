import { useState, useEffect } from 'react';
import type {
    LineaItem,
    RecorridoItem,
    QuejaItem,
    CreateLineaRequest,
    PaginatedResponse
} from '../services/lineaService';
import { lineaService } from '../services/lineaService';

// Components
import {
    LineaHeader,
    LineaError,
    LineaStats,
    LineaFilters,
    LineaTable,
    LineaPagination,
    LineaModal,
    LineaConfirmModal,
    LineaDetallesModal
} from '../components/linea';
import { getBackendErrorMessage } from '../utils/apiErrors';

export default function LineaPage() {
    // Estados principales
    const [items, setItems] = useState<LineaItem[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1,
    });
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<LineaItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [estadoFilter, setEstadoFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [saving, setSaving] = useState(false);

    // Estados para la confirmación de eliminación
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Estados para detalles
    const [showDetallesModal, setShowDetallesModal] = useState(false);
    const [lineaDetalles, setLineaDetalles] = useState<LineaItem | null>(null);
    const [recorridos, setRecorridos] = useState<RecorridoItem[]>([]);
    const [quejas, setQuejas] = useState<QuejaItem[]>([]);
    const [loadingDetalles, setLoadingDetalles] = useState(false);

    // Cargar datos
    useEffect(() => {
        loadLineas();
    }, []);

    // Cargar líneas cuando cambia el término de búsqueda o filtro de estado
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadLineas(1, pagination.limit, searchTerm, estadoFilter);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, estadoFilter]);

    const loadLineas = async (page: number = 1, limit: number = 10, search: string = '', estado: string = '') => {
        try {
            setLoading(true);
            setError('');

            const response: PaginatedResponse<LineaItem> = await lineaService.getLineas(
                page,
                limit,
                search,
                estado
            );

            setItems(response.data);
            setPagination(response.pagination);
        } catch (err) {
            setError('Error al cargar las líneas');
            console.error('Error loading lineas:', err);
        } finally {
            setLoading(false);
        }
    };

    // Cargar detalles de la línea
    // En la función loadLineaDetalles de LineaPage.tsx
    const loadLineaDetalles = async (id: number) => {
        try {
            console.log('Cargando detalles para línea ID:', id);
            setLoadingDetalles(true);
            const detalles = await lineaService.getLineaDetalles(id);
            console.log('Detalles recibidos:', detalles);

            setLineaDetalles(detalles.linea);
            setRecorridos(detalles.recorridos);
            setQuejas(detalles.quejas);

            console.log('Abriendo modal de detalles...');
            setShowDetallesModal(true);
        } catch (err) {
            console.error('Error loading linea detalles:', err);
            setError('Error al cargar los detalles de la línea');
        } finally {
            setLoadingDetalles(false);
        }
    };

    // Función para manejar cambio de filtro de estado
    const handleEstadoFilterChange = (estado: string) => {
        setEstadoFilter(estado);
    };

    // Funciones de paginación
    const goToPage = (page: number) => {
        if (page >= 1 && page <= pagination.pages) {
            loadLineas(page, pagination.limit, searchTerm, estadoFilter);
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
        loadLineas(1, newLimit, searchTerm, estadoFilter);
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

            await lineaService.deleteLinea(itemToDelete);
            console.log('✅ Eliminación exitosa');

            // Recargar los datos
            await loadLineas(pagination.page, pagination.limit, searchTerm, estadoFilter);

        } catch (err: unknown) {
            console.error('❌ Error en eliminación:', err);
            setError(getBackendErrorMessage(err, 'Error al eliminar la línea'));
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
    const handleEdit = (item: LineaItem) => {
        setEditingItem(item);
        setShowModal(true);
    };

    const handleView = (item: LineaItem) => {
        loadLineaDetalles(item.id_linea);
    };

    const handleSave = async (formData: FormData) => {
        try {
            setSaving(true);
            setError('');

            const itemData: CreateLineaRequest = {
                clavelinea: formData.get('clavelinea') as string,
                clave_n: formData.get('clave_n') as string || undefined,
                codificacion: formData.get('codificacion') as string || undefined,
                hilos: formData.get('hilos') as string || undefined,
                desde: formData.get('desde') as string,
                dirde: formData.get('dirde') as string,
                distdesde: formData.get('distdesde') ? parseFloat(formData.get('distdesde') as string) : undefined,
                zd: formData.get('zd') as string,
                hasta: formData.get('hasta') as string,
                dirha: formData.get('dirha') as string,
                disthasta: formData.get('disthasta') ? parseFloat(formData.get('disthasta') as string) : undefined,
                zh: formData.get('zh') as string,
                facturado: formData.get('facturado') as string || undefined,
                sector: formData.get('sector') as string || undefined,
                id_senalizacion: formData.get('id_senalizacion') ? parseInt(formData.get('id_senalizacion') as string) : null,
                id_tipolinea: formData.get('id_tipolinea') ? parseInt(formData.get('id_tipolinea') as string) : null,
                id_propietario: formData.get('id_propietario') ? parseInt(formData.get('id_propietario') as string) : null,
            };

            if (editingItem) {
                await lineaService.updateLinea(editingItem.id_linea, itemData);
            } else {
                await lineaService.createLinea(itemData);
            }

            loadLineas(pagination.page, pagination.limit, searchTerm, estadoFilter);
            setShowModal(false);
            setEditingItem(null);
        } catch (err: unknown) {
            setError(getBackendErrorMessage(
                err,
                editingItem ? 'Error al actualizar la línea' : 'Error al crear la línea'
            ));
            console.error('Error saving linea:', err);
            throw err;
        } finally {
            setSaving(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
    };

    const handleCloseDetallesModal = () => {
        setShowDetallesModal(false);
        setLineaDetalles(null);
        setRecorridos([]);
        setQuejas([]);
    };

    // Loading state
    if (loading && items.length === 0) {
        return (
            <div className="p-6 flex justify-center items-center h-64">
                <div className="text-center">
                    <i className="ri-loader-4-line animate-spin text-2xl text-blue-600 mb-2"></i>
                    <p className="text-gray-600">Cargando líneas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <LineaHeader
                title="Líneas"
                description="Gestiona las líneas del sistema"
                onAdd={() => setShowModal(true)}
            />

            {/* Error */}
            <LineaError
                error={error}
                onClose={() => setError('')}
            />

            {/* Stats */}
            <LineaStats
                total={pagination.total}
                showing={items.length}
                page={pagination.page}
                pages={pagination.pages}
                limit={pagination.limit}
            />

            {/* Filters */}
            <LineaFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                estadoFilter={estadoFilter}
                onEstadoFilterChange={handleEstadoFilterChange}
                onRefresh={() => loadLineas(pagination.page, pagination.limit, searchTerm, estadoFilter)}
            />

            {/* Table */}
            <LineaTable
                items={items}
                searchTerm={searchTerm}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                loading={loading && items.length > 0}
            />

            {/* Pagination */}
            {pagination.pages > 1 && (
                <LineaPagination
                    pagination={pagination}
                    onPageChange={goToPage}
                    onLimitChange={handleLimitChange}
                    onNext={nextPage}
                    onPrev={prevPage}
                />
            )}

            {/* Modal de Crear/Editar */}
            <LineaModal
                show={showModal}
                editingItem={editingItem}
                saving={saving}
                onClose={handleCloseModal}
                onSave={handleSave}
            />

            {/* Modal de Confirmación de Eliminación */}
            <LineaConfirmModal
                show={showConfirmModal}
                title="Confirmar Eliminación"
                message="¿Está seguro de que desea eliminar esta línea? Esta acción no se puede deshacer."
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                loading={deleting}
            />

            {/* Modal de Detalles */}
            <LineaDetallesModal
                show={showDetallesModal}
                linea={lineaDetalles}
                recorridos={recorridos}
                quejas={quejas}
                loading={loadingDetalles}
                onClose={handleCloseDetallesModal}
            />
        </div>
    );
}