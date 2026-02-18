import { useState, useEffect } from 'react';
import type {
    QuejaItem,
    PruebaItem,
    TrabajoItem,
    CreateQuejaRequest,
    PaginatedResponse,
    QuejaDetallesResponse
} from '../services/quejaService';
import { quejaService } from '../services/quejaService';

// Components
import {
    QuejaHeader,
    QuejaError,
    QuejaStats,
    QuejaFilters,
    QuejaTable,
    QuejaPagination,
    QuejaModal,
    QuejaConfirmModal,
    QuejaDetallesModal
} from '../components/queja';
import { getBackendErrorMessage } from '../utils/apiErrors';

export default function QuejaPage() {
    // Estados principales
    const [items, setItems] = useState<QuejaItem[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1,
    });
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<QuejaItem | null>(null);
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
    const [quejaDetalles, setQuejaDetalles] = useState<QuejaItem | null>(null);
    const [pruebas, setPruebas] = useState<PruebaItem[]>([]);
    const [trabajos, setTrabajos] = useState<TrabajoItem[]>([]);
    const [loadingDetalles, setLoadingDetalles] = useState(false);

    // Cargar datos iniciales
    useEffect(() => {
        loadQuejas();
    }, []);

    // Cargar quejas cuando cambia el término de búsqueda o filtro de estado
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadQuejas(1, pagination.limit, searchTerm, estadoFilter);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, estadoFilter]);

    const loadQuejas = async (page: number = 1, limit: number = 10, search: string = '', estado: string = '') => {
        try {
            setLoading(true);
            setError('');

            console.log('📡 Cargando quejas con parámetros:', { page, limit, search, estado });

            const response: PaginatedResponse<QuejaItem> = await quejaService.getQuejas(
                page,
                limit,
                search,
                estado
            );

            console.log('✅ Quejas cargadas:', {
                cantidad: response.data.length,
                pagination: response.pagination
            });

            setItems(response.data);
            setPagination(response.pagination);
        } catch (err) {
            const errorMsg = 'Error al cargar las quejas. Por favor, intente nuevamente.';
            setError(errorMsg);
            console.error('❌ Error loading quejas:', err);
        } finally {
            setLoading(false);
        }
    };

    // Cargar detalles de la queja
    const loadQuejaDetalles = async (id: number) => {
        try {
            setLoadingDetalles(true);
            console.log('📡 Cargando detalles para queja ID:', id);

            const detalles: QuejaDetallesResponse = await quejaService.getQuejaDetalles(id);

            console.log('✅ Detalles cargados:', {
                queja: detalles.queja.num_reporte,
                pruebas: detalles.pruebas.length,
                trabajos: detalles.trabajos.length
            });

            setQuejaDetalles(detalles.queja);
            setPruebas(detalles.pruebas);
            setTrabajos(detalles.trabajos);
            setShowDetallesModal(true);
        } catch (err) {
            const errorMsg = 'Error al cargar los detalles de la queja';
            setError(errorMsg);
            console.error('❌ Error loading queja detalles:', err);
        } finally {
            setLoadingDetalles(false);
        }
    };

    // Función para refrescar detalles de la queja
    const handleRefreshDetalles = async () => {
        if (quejaDetalles) {
            try {
                console.log('🔄 Refrescando detalles para queja ID:', quejaDetalles.id_queja);

                const detalles: QuejaDetallesResponse = await quejaService.getQuejaDetalles(quejaDetalles.id_queja);

                setQuejaDetalles(detalles.queja);
                setPruebas(detalles.pruebas);
                setTrabajos(detalles.trabajos);

                console.log('✅ Detalles refrescados');
            } catch (err) {
                console.error('❌ Error refrescando detalles:', err);
                setError('Error al actualizar los detalles de la queja');
            }
        }
    };

    // Función para manejar cambio de filtro de estado
    const handleEstadoFilterChange = (estado: string) => {
        console.log('🎯 Cambiando filtro de estado a:', estado);
        setEstadoFilter(estado);
    };

    // Funciones de paginación
    const goToPage = (page: number) => {
        if (page >= 1 && page <= pagination.pages) {
            console.log('📄 Cambiando a página:', page);
            loadQuejas(page, pagination.limit, searchTerm, estadoFilter);
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
        console.log('📊 Cambiando límite por página a:', newLimit);
        loadQuejas(1, newLimit, searchTerm, estadoFilter);
    };

    // Funciones para eliminar con confirmación modal
    const handleDelete = (id: number) => {
        console.log('🗑️ Solicitando eliminación para ID:', id);
        setItemToDelete(id);
        setShowConfirmModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        console.log('✅ Confirmando eliminación para ID:', itemToDelete);

        try {
            setDeleting(true);
            setError('');

            await quejaService.deleteQueja(itemToDelete);
            console.log('🗑️ Eliminación exitosa');

            // Recargar los datos
            await loadQuejas(pagination.page, pagination.limit, searchTerm, estadoFilter);

        } catch (err: unknown) {
            console.error('❌ Error en eliminación:', err);
            setError(getBackendErrorMessage(err, 'Error al eliminar la queja'));
        } finally {
            setDeleting(false);
            setShowConfirmModal(false);
            setItemToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        console.log('❌ Eliminación cancelada por el usuario');
        setShowConfirmModal(false);
        setItemToDelete(null);
    };

    // Funciones para editar y guardar
    const handleEdit = (item: QuejaItem) => {
        console.log('✏️ Editando queja:', item.num_reporte);
        setEditingItem(item);
        setShowModal(true);
    };

    const handleView = (item: QuejaItem) => {
        console.log('👁️ Viendo detalles de queja:', item.num_reporte);
        loadQuejaDetalles(item.id_queja);
    };

    const handleSave = async (formData: FormData) => {
        try {
            setSaving(true);
            setError('');

            console.log('💾 Guardando datos del formulario...');

            const itemData: CreateQuejaRequest = {
                num_reporte: parseInt(formData.get('num_reporte') as string),
                fecha: formData.get('fecha') as string,
                prioridad: formData.get('prioridad') ? parseInt(formData.get('prioridad') as string) : null,
                probador: formData.get('probador') ? parseInt(formData.get('probador') as string) : null,
                fecha_pdte: formData.get('fecha_pdte') as string || null,
                clave_pdte: formData.get('clave_pdte') as string || null,
                claveok: formData.get('claveok') as string || null,
                fechaok: formData.get('fechaok') as string || null,
                red: formData.get('red') === 'true',
                id_telefono: formData.get('id_telefono') ? parseInt(formData.get('id_telefono') as string) : null,
                id_linea: formData.get('id_linea') ? parseInt(formData.get('id_linea') as string) : null,
                id_tipoqueja: formData.get('id_tipoqueja') ? parseInt(formData.get('id_tipoqueja') as string) : null,
                id_clave: formData.get('id_clave') ? parseInt(formData.get('id_clave') as string) : null,
                id_pizarra: formData.get('id_pizarra') ? parseInt(formData.get('id_pizarra') as string) : null,
                reportado_por: formData.get('reportado_por') as string || null,
            };

            console.log('📤 Datos a guardar:', itemData);

            if (editingItem) {
                console.log('🔄 Actualizando queja existente');
                await quejaService.updateQueja(editingItem.id_queja, itemData);
            } else {
                console.log('🆕 Creando nueva queja');
                await quejaService.createQueja(itemData);
            }

            console.log('✅ Operación exitosa, recargando lista...');
            await loadQuejas(pagination.page, pagination.limit, searchTerm, estadoFilter);

            setShowModal(false);
            setEditingItem(null);
        } catch (err: unknown) {
            console.error('❌ Error saving queja:', err);
            setError(getBackendErrorMessage(
                err,
                editingItem ? 'Error al actualizar la queja' : 'Error al crear la queja'
            ));
            throw err;
        } finally {
            setSaving(false);
        }
    };

    const handleCloseModal = () => {
        console.log('🔒 Cerrando modal de queja');
        setShowModal(false);
        setEditingItem(null);
    };

    const handleCloseDetallesModal = () => {
        console.log('🔒 Cerrando modal de detalles');
        setShowDetallesModal(false);
        setQuejaDetalles(null);
        setPruebas([]);
        setTrabajos([]);
    };

    // Manejar refresco desde filtros
    const handleRefresh = () => {
        console.log('🔄 Refrescando lista de quejas');
        loadQuejas(pagination.page, pagination.limit, searchTerm, estadoFilter);
    };

    // Loading state inicial
    if (loading && items.length === 0) {
        return (
            <div className="p-6 flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <i className="ri-loader-4-line animate-spin text-3xl text-blue-600 mb-4"></i>
                    <p className="text-gray-600 text-lg">Cargando quejas...</p>
                    <p className="text-gray-400 text-sm mt-2">Por favor espere</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <QuejaHeader
                title="Gestión de Quejas"
                description="Administra y consulta todas las quejas registradas en el sistema"
                onAdd={() => {
                    console.log('➕ Abriendo modal para nueva queja');
                    setShowModal(true);
                }}
            />

            {/* Error */}
            <QuejaError
                error={error}
                onClose={() => {
                    console.log('❌ Cerrando mensaje de error');
                    setError('');
                }}
            />

            {/* Stats */}
            <QuejaStats
                total={pagination.total}
                showing={items.length}
                page={pagination.page}
                pages={pagination.pages}
                limit={pagination.limit}
            />

            {/* Filters */}
            <QuejaFilters
                searchTerm={searchTerm}
                onSearchChange={(term) => {
                    console.log('🔍 Buscando:', term);
                    setSearchTerm(term);
                }}
                estadoFilter={estadoFilter}
                onEstadoFilterChange={handleEstadoFilterChange}
                onRefresh={handleRefresh}
            />

            {/* Table */}
            <QuejaTable
                items={items}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                loading={loading && items.length > 0}
            />

            {/* Pagination */}
            {pagination.pages > 1 && (
                <QuejaPagination
                    pagination={pagination}
                    onPageChange={goToPage}
                    onLimitChange={handleLimitChange}
                    onNext={nextPage}
                    onPrev={prevPage}
                />
            )}

            {/* Modal de Crear/Editar */}
            <QuejaModal
                show={showModal}
                editingItem={editingItem}
                saving={saving}
                onClose={handleCloseModal}
                onSave={handleSave}
            />

            {/* Modal de Confirmación de Eliminación */}
            <QuejaConfirmModal
                show={showConfirmModal}
                title="Confirmar Eliminación"
                message="¿Está seguro de que desea eliminar esta queja? Esta acción no se puede deshacer."
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                loading={deleting}
            />

            {/* Modal de Detalles */}
            <QuejaDetallesModal
                show={showDetallesModal}
                queja={quejaDetalles}
                pruebas={pruebas}
                trabajos={trabajos}
                loading={loadingDetalles}
                onClose={handleCloseDetallesModal}
                onDataUpdated={handleRefreshDetalles}
            />

            {/* Estado vacío */}
            {!loading && items.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow mt-4">
                    <i className="ri-inbox-line text-4xl text-gray-400 mb-3"></i>
                    <h3 className="text-lg font-medium text-gray-700">No se encontraron quejas</h3>
                    <p className="text-gray-500 mt-1 mb-4">
                        {searchTerm || estadoFilter
                            ? 'Intenta con otros términos de búsqueda o filtros'
                            : 'No hay quejas registradas en el sistema'}
                    </p>
                    {!searchTerm && !estadoFilter && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 mx-auto"
                        >
                            <i className="ri-add-line"></i>
                            <span>Crear primera queja</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}