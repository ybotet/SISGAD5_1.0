import { useState, useEffect } from "react";
import type {
  CategoriaMaterialItem,
  CreateCategoriaMaterialRequest,
  PaginatedResponse,
} from "../../services/categoriaMaterialService";
import { categoriaMaterialService } from "../../services/categoriaMaterialService";
import CategoriaMaterialTable from "../../components/categoriamaterial/CategoriaMaterialTable";
import CategoriaMaterialHeader from "../../components/categoriamaterial/CategoriaMaterialHeader";
import CategoriaMaterialError from "../../components/categoriamaterial/CategoriaMaterialError";
import CategoriaMaterialStats from "../../components/categoriamaterial/CategoriaMaterialStats";
import CategoriaMaterialFilters from "../../components/categoriamaterial/CategoriaMaterialFilters";
import CategoriaMaterialModal from "../../components/categoriamaterial/CategoriaMaterialModal";
import CategoriaMaterialConfirmModal from "../../components/categoriamaterial/CategoriaMaterialConfirmModal";

export default function CategoriaMaterialPage() {
  const [items, setItems] = useState<CategoriaMaterialItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CategoriaMaterialItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCategorias();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadCategorias(1, pagination.limit, searchTerm);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const loadCategorias = async (page: number = 1, limit: number = 10, search: string = "") => {
    try {
      setLoading(true);
      setError("");
      const response: PaginatedResponse<CategoriaMaterialItem> =
        await categoriaMaterialService.getCategoriasMaterial(page, limit, search);
      setItems(response.data || []);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        pages: response.total_pages,
      });
    } catch (err) {
      console.error("Error loading categorías de material:", err);
      setError("Error al cargar las categorías de material");
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.pages) {
      loadCategorias(page, pagination.limit, searchTerm);
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
    loadCategorias(1, newLimit, searchTerm);
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
      await categoriaMaterialService.deleteCategoriaMaterial(itemToDelete);
      await loadCategorias(pagination.page, pagination.limit, searchTerm);
    } catch (err: any) {
      console.error("Error deleting categoría de material:", err);
      setError(err?.message || "Error al eliminar la categoría de material");
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

  const handleEdit = (item: CategoriaMaterialItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleSave = async (formData: FormData) => {
    try {
      setSaving(true);
      setError("");

      const itemData: CreateCategoriaMaterialRequest = {
        nombre: (formData.get("nombre") as string).trim(),
      };

      if (editingItem) {
        await categoriaMaterialService.updateCategoriaMaterial(editingItem.id, itemData);
      } else {
        await categoriaMaterialService.createCategoriaMaterial(itemData);
      }

      await loadCategorias(pagination.page, pagination.limit, searchTerm);
      setShowModal(false);
      setEditingItem(null);
    } catch (err: any) {
      console.error("Error saving categoría de material:", err);
      setError(
        err?.message ||
          (editingItem
            ? "Error al actualizar la categoría de material"
            : "Error al crear la categoría de material"),
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
          <p className="text-gray-600">Cargando categorías de material...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <CategoriaMaterialHeader
        title="Categorías de Material"
        description="Gestiona las categorías de material del sistema"
        onAdd={() => setShowModal(true)}
      />

      <CategoriaMaterialError message={error} onClose={() => setError("")} />

      <CategoriaMaterialStats total={pagination.total} showing={items.length} />

      <CategoriaMaterialFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={() => loadCategorias(pagination.page, pagination.limit, searchTerm)}
      />

      <CategoriaMaterialTable
        items={items}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading && items.length > 0}
      />

      {pagination.pages > 1 && (
        <div className="bg-white rounded-lg shadow p-4 mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700">Mostrar:</label>
            <select
              value={pagination.limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Página {pagination.page} de {pagination.pages} ({pagination.total} total)
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={prevPage}
              disabled={pagination.page === 1}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={nextPage}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      <CategoriaMaterialModal
        showModal={showModal}
        editingItem={editingItem}
        saving={saving}
        onClose={handleCloseModal}
        onSave={handleSave}
      />

      <CategoriaMaterialConfirmModal
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
