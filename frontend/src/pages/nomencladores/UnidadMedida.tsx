import { useState, useEffect } from "react";
import type {
  UnidadMedidaItem,
  CreateUnidadMedidaRequest,
  PaginatedResponse,
} from "../../services/unidadMedidaService";
import { unidadMedidaService } from "../../services/unidadMedidaService";
import { UnidadMedidaTable } from "../../components/unidadmedida/UnidadMedidaTable";
import { UnidadMedidaHeader } from "../../components/unidadmedida/UnidadMedidaHeader";
import { UnidadMedidaError } from "../../components/unidadmedida/UnidadMedidaError";
import { UnidadMedidaStats } from "../../components/unidadmedida/UnidadMedidaStats";
import { UnidadMedidaFilters } from "../../components/unidadmedida/UnidadMedidaFilters";
import { UnidadMedidaPagination } from "../../components/unidadmedida/UnidadMedidaPagination";
import { UnidadMedidaModal } from "../../components/unidadmedida/UnidadMedidaModal";
import { UnidadMedidaConfirmModal } from "../../components/unidadmedida/UnidadMedidaConfirmModal";

export default function UnidadMedidaPage() {
  const [items, setItems] = useState<UnidadMedidaItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<UnidadMedidaItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUnidadesMedida();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadUnidadesMedida(1, pagination.limit, searchTerm);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const loadUnidadesMedida = async (page: number = 1, limit: number = 10, search: string = "") => {
    try {
      setLoading(true);
      setError("");
      const response: PaginatedResponse<UnidadMedidaItem> =
        await unidadMedidaService.getUnidadesMedida(page, limit, search);
      setItems(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error("Error loading unidades de medida:", err);
      setError("Error al cargar las unidades de medida");
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.pages) {
      loadUnidadesMedida(page, pagination.limit, searchTerm);
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
    loadUnidadesMedida(1, newLimit, searchTerm);
  };

  const handleDelete = (id: number) => {
    setItemToDelete(id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setDeleting(true);
      setError("");
      await unidadMedidaService.deleteUnidadMedida(itemToDelete);
      await loadUnidadesMedida(pagination.page, pagination.limit, searchTerm);
    } catch (err: any) {
      console.error("Error deleting unidad de medida:", err);
      setError(err?.message || "Error al eliminar la unidad de medida");
    } finally {
      setDeleting(false);
      setShowConfirmModal(false);
      setItemToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setItemToDelete(null);
  };

  const handleEdit = (item: UnidadMedidaItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleSave = async (formData: FormData) => {
    try {
      setSaving(true);
      setError("");

      const itemData: CreateUnidadMedidaRequest = {
        nombre: (formData.get("nombre") as string).trim(),
      };

      if (editingItem) {
        await unidadMedidaService.updateUnidadMedida(editingItem.id, itemData);
      } else {
        await unidadMedidaService.createUnidadMedida(itemData);
      }

      await loadUnidadesMedida(pagination.page, pagination.limit, searchTerm);
      setShowModal(false);
      setEditingItem(null);
    } catch (err: any) {
      console.error("Error saving unidad de medida:", err);
      setError(
        err?.message ||
          (editingItem
            ? "Error al actualizar la unidad de medida"
            : "Error al crear la unidad de medida"),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  if (loading && items.length === 0) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-2xl text-blue-600 mb-2"></i>
          <p className="text-gray-600">Cargando unidades de medida...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <UnidadMedidaHeader
        title="Unidades de Medida"
        description="Gestiona las unidades de medida del sistema"
        onAdd={() => setShowModal(true)}
      />

      <UnidadMedidaError message={error} onClose={() => setError("")} />

      <UnidadMedidaStats
        total={pagination.total}
        showing={items.length}
        page={pagination.page}
        pages={pagination.pages}
        limit={pagination.limit}
      />

      <UnidadMedidaFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={() => loadUnidadesMedida(pagination.page, pagination.limit, searchTerm)}
      />

      <UnidadMedidaTable
        items={items}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading && items.length > 0}
      />

      {pagination.pages > 1 && (
        <UnidadMedidaPagination
          pagination={pagination}
          onLimitChange={handleLimitChange}
          onNext={nextPage}
          onPrev={prevPage}
        />
      )}

      <UnidadMedidaModal
        showModal={showModal}
        editingItem={editingItem}
        saving={saving}
        onClose={handleCloseModal}
        onSave={handleSave}
      />

      <UnidadMedidaConfirmModal
        showConfirmModal={showConfirmModal}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        loading={deleting}
      />
    </div>
  );
}
