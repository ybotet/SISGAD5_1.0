import { useState, useEffect } from 'react';
import type {
    PizarraItem,
    // TipoPizarra,
    CreatePizarraRequest,
    PaginatedResponse
} from '../services/pizarraService';
import pizarraService from '../services/pizarraService';

// Components
import {
    PizarraHeader,
    PizarraError,
    PizarraStats,
    PizarraFilters,
    PizarraTable,
    PizarraPagination,
    PizarraModal,
    PizarraConfirmModal,
    PizarraDetallesModal
} from '../components/pizarra';
import { getBackendErrorMessage } from '../utils/apiErrors';

export default function PizarraPage() {
    const [items, setItems] = useState<PizarraItem[]>([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<PizarraItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [estadoFilter, setEstadoFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [saving, setSaving] = useState(false);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [showDetallesModal, setShowDetallesModal] = useState(false);
    const [pizarraDetalles, setPizarraDetalles] = useState<PizarraItem | null>(null);
    const [loadingDetalles, setLoadingDetalles] = useState(false);

    useEffect(() => {
        loadPizarras();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadPizarras(1, pagination.limit, searchTerm, estadoFilter);
        }, 400);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, estadoFilter]);

    const loadPizarras = async (page: number = 1, limit: number = 10, search: string = '', estado: string = '') => {
        try {
            setLoading(true);
            setError('');
            const response: PaginatedResponse<PizarraItem> = await pizarraService.getPizarras(page, limit, search, estado);
            setItems(response.data);
            setPagination(response.pagination);
        } catch (err) {
            setError('Error al cargar las pizarras');
            console.error('Error loading pizarras:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadPizarraDetalles = async (id: number) => {
        try {
            setLoadingDetalles(true);
            const detalles = await pizarraService.getPizarraDetalles(id);
            setPizarraDetalles(detalles.pizarra);
            setShowDetallesModal(true);
        } catch (err) {
            setError('Error al cargar los detalles de la pizarra');
            console.error('Error loading pizarra detalles:', err);
        } finally {
            setLoadingDetalles(false);
        }
    };

    const goToPage = (page: number) => {
        if (page >= 1 && page <= pagination.pages) {
            loadPizarras(page, pagination.limit, searchTerm);
        }
    };

    const nextPage = () => { if (pagination.page < pagination.pages) goToPage(pagination.page + 1); };
    const prevPage = () => { if (pagination.page > 1) goToPage(pagination.page - 1); };

    const handleLimitChange = (newLimit: number) => { loadPizarras(1, newLimit, searchTerm); };

    const handleDelete = (id: number) => { setItemToDelete(id); setShowConfirmModal(true); };

    const handleEstadoFilterChange = (estado: string) => {
        setEstadoFilter(estado);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            setDeleting(true);
            setError('');
            await pizarraService.deletePizarra(itemToDelete);
            await loadPizarras(pagination.page, pagination.limit, searchTerm);
        } catch (err: unknown) {
            setError(getBackendErrorMessage(err, 'Error al eliminar la pizarra'));
        } finally {
            setDeleting(false);
            setShowConfirmModal(false);
            setItemToDelete(null);
        }
    };

    const handleEdit = (item: PizarraItem) => { setEditingItem(item); setShowModal(true); };
    const handleView = (item: PizarraItem) => { loadPizarraDetalles(item.id_pizarra); };

    const handleSave = async (formData: FormData) => {
        try {
            setSaving(true);
            setError('');
            const itemData: CreatePizarraRequest = {
                nombre: formData.get('nombre') as string || undefined,
                direccion: formData.get('direccion') as string || undefined,
                observacion: formData.get('observacion') as string || undefined,
                id_tipopizarra: formData.get('id_tipopizarra') ? parseInt(formData.get('id_tipopizarra') as string) : null
            };

            if (editingItem) {
                await pizarraService.updatePizarra(editingItem.id_pizarra, itemData);
            } else {
                await pizarraService.createPizarra(itemData);
            }

            loadPizarras(pagination.page, pagination.limit, searchTerm);
            setShowModal(false);
            setEditingItem(null);
        } catch (err: unknown) {
            setError(getBackendErrorMessage(
                err,
                editingItem ? 'Error al actualizar la pizarra' : 'Error al crear la pizarra'
            ));
            console.error('Error saving pizarra:', err);
            throw err;
        } finally {
            setSaving(false);
        }
    };

    const handleCloseModal = () => { setShowModal(false); setEditingItem(null); };
    const handleCloseDetallesModal = () => { setShowDetallesModal(false); setPizarraDetalles(null); };

    if (loading && items.length === 0) {
        return (
            <div className="p-6 flex justify-center items-center h-64">
                <div className="text-center">
                    <i className="ri-loader-4-line animate-spin text-2xl text-blue-600 mb-2"></i>
                    <p className="text-gray-600">Cargando pizarras...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <PizarraHeader title="Pizarras" description="Gestiona las pizarras del sistema" onAdd={() => setShowModal(true)} />

            <PizarraError error={error} onClose={() => setError('')} />

            <PizarraStats total={pagination.total} showing={items.length} page={pagination.page} pages={pagination.pages} limit={pagination.limit} />

            <PizarraFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                estadoFilter={estadoFilter}
                onEstadoFilterChange={handleEstadoFilterChange}
                onRefresh={() => loadPizarras(pagination.page, pagination.limit, searchTerm, estadoFilter)}
            />

            <PizarraTable items={items} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} loading={loading && items.length > 0} />

            {pagination.pages > 1 && (
                <PizarraPagination pagination={pagination} onPageChange={goToPage} onLimitChange={handleLimitChange} onNext={nextPage} onPrev={prevPage} />
            )}

            <PizarraModal show={showModal} editingItem={editingItem} saving={saving} onClose={handleCloseModal} onSave={handleSave} />

            <PizarraConfirmModal show={showConfirmModal} title="Confirmar Eliminación" message="¿Está seguro de que desea eliminar esta pizarra?" onConfirm={handleConfirmDelete} onCancel={() => setShowConfirmModal(false)} confirmText="Sí, eliminar" cancelText="Cancelar" loading={deleting} />

            <PizarraDetallesModal show={showDetallesModal} pizarra={pizarraDetalles} loading={loadingDetalles} onClose={handleCloseDetallesModal} />
        </div>
    );
}
