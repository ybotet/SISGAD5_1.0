import { useState, useEffect } from 'react';
import type {
    SistemaItem,
    PaginatedResponse,
    Propietario
} from '../../services/sistemaService';
import { sistemaService } from '../../services/sistemaService';
import { propietarioService } from '../../services/propietarioService';

// Components
import {
    SistemaHeader,
    SistemaError,
    SistemaStats,
    SistemaFilters,
    SistemaTable,
    SistemaPagination,
    SistemaModal,
    SistemaConfirmModal
} from '../../components/sistema';

export default function SistemaPage() {
    // Estados
    const [items, setItems] = useState<SistemaItem[]>([]);
    const [propietarios, setPropietarios] = useState<Propietario[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1,
    });
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<SistemaItem | null>(null);
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
        loadSistema();
        loadPropietarios();
    }, []);

    // Cargar sistema cuando cambia el término de búsqueda
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (pagination.page === 1) {
                loadSistema(1, pagination.limit, searchTerm);
            } else {
                loadSistema(1, pagination.limit, searchTerm);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const loadSistema = async (page: number = 1, limit: number = 10, search: string = '') => {
        try {
            setLoading(true);
            setError('');
            const response: PaginatedResponse<SistemaItem> = await sistemaService.getSistema(page, limit, search);

            setItems(response.data);
            setPagination(response.pagination);
        } catch (err) {
            setError('Error al cargar los sistema');
            console.error('Error loading sistema:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadPropietarios = async () => {
        try {
            const response = await propietarioService.getPropietarios();
            // propietarioService devuelve PaginatedResponse, extraemos los datos
            setPropietarios(response.data || []);
        } catch (err) {
            console.error('Error loading propietarios:', err);
        }
    };

    // Funciones de paginación
    const goToPage = (page: number) => {
        if (page >= 1 && page <= pagination.pages) {
            loadSistema(page, pagination.limit, searchTerm);
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
        loadSistema(1, newLimit, searchTerm);
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

            await sistemaService.deleteSistema(itemToDelete);
            console.log('✅ Eliminación exitosa');

            // Recargar los datos
            await loadSistema(pagination.page, pagination.limit, searchTerm);

        } catch (err: any) {
            console.error('❌ Error en eliminación:', err);
            const errorMessage = err?.response?.data?.error || err?.message || 'Error al eliminar el sistema';
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
    const handleEdit = (item: SistemaItem) => {
        setEditingItem(item);
        setShowModal(true);
    };

    const handleSave = async (formData: FormData) => {
        try {
            setSaving(true);
            setError('');

            const itemData: any = {
                sistema: formData.get('sistema') as string,
            };

            // Agregar id_propietario si está seleccionado
            const idPropietario = formData.get('id_propietario');
            if (idPropietario) {
                itemData.id_propietario = parseInt(idPropietario as string);
            }

            const direccion = formData.get('direccion');
            if (direccion) {
                itemData.direccion = direccion as string;
            }

            if (editingItem) {
                await sistemaService.updateSistema(editingItem.id_sistema, itemData);
            } else {
                await sistemaService.createSistema(itemData);
            }



            loadSistema(pagination.page, pagination.limit, searchTerm);
            setShowModal(false);
            setEditingItem(null);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.error || err?.message ||
                (editingItem ? 'Error al actualizar el sistema' : 'Error al crear el sistema');
            setError(errorMessage);
            console.error('Error saving sistema:', err);
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
                    <p className="text-gray-600">Cargando sistema...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <SistemaHeader
                title="Sistema"
                description="Gestiona los sistema del sistema"
                onAdd={() => setShowModal(true)}
            />

            {/* Error */}
            <SistemaError
                error={error}
                onClose={() => setError('')}
            />

            {/* Stats */}
            <SistemaStats
                total={pagination.total}
                showing={items.length}
                page={pagination.page}
                pages={pagination.pages}
                limit={pagination.limit}
            />

            {/* Filters */}
            <SistemaFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onRefresh={() => loadSistema(pagination.page, pagination.limit, searchTerm)}
            />

            {/* Table */}
            <SistemaTable
                items={items}
                searchTerm={searchTerm}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading && items.length > 0}
            />

            {/* Pagination */}
            {pagination.pages > 1 && (
                <SistemaPagination
                    pagination={pagination}
                    onPageChange={goToPage}
                    onLimitChange={handleLimitChange}
                    onNext={nextPage}
                    onPrev={prevPage}
                />
            )}

            {/* Modal de Crear/Editar */}
            <SistemaModal
                show={showModal}
                editingItem={editingItem}
                saving={saving}
                propietarios={propietarios}
                onClose={handleCloseModal}
                onSave={handleSave}
            />

            {/* Modal de Confirmación de Eliminación */}
            <SistemaConfirmModal
                show={showConfirmModal}
                title="Confirmar Eliminación"
                message="¿Está seguro de que desea eliminar este sistema? Esta acción no se puede deshacer."
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                confirmText="Sí, Eliminar"
                cancelText="Cancelar"
                loading={deleting}
            />
        </div>
    );
}

