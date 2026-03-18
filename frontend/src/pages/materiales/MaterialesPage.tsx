import { useEffect, useState } from "react";
import { materialService } from "../../services/materialService";
import type {
  CreateMaterialRequest,
  MaterialItem,
} from "../../services/materialService";
import {
  MaterialHeader,
  MaterialError,
  MaterialStats,
  MaterialFilters,
  MaterialTable,
  MaterialPagination,
  MaterialModal,
  MaterialConfirmModal,
} from "../../components/material";

export default function MaterialesPage() {
  const [items, setItems] = useState<MaterialItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MaterialItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    loadMaterials(1, limit, "");
  }, []);

  const loadMaterials = async (
    pageNumber: number = 1,
    pageSize: number = limit,
    search: string = searchTerm,
  ) => {
    try {
      setLoading(true);
      setError("");
      const result = await materialService.getMaterials(
        pageNumber,
        pageSize,
        search,
      );
      setItems(result.data);
      setPage(result.page);
      setLimit(result.limit);
      setTotal(result.total);
      setPages(result.total_pages);
    } catch (err) {
      setError("Error cargando materiales");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: FormData) => {
    try {
      setSaving(true);
      setError("");
      const payload: CreateMaterialRequest = {
        codigo: (formData.get("codigo") as string)?.trim() || "",
        nombre: (formData.get("nombre") as string)?.trim() || "",
        descripcion: (formData.get("descripcion") as string)?.trim() || "",
        categoria: (formData.get("categoria") as string)?.trim() || "",
        unidad: (formData.get("unidad") as string)?.trim() || "",
        precio: Number(formData.get("precio") || 0),
      };

      if (editingItem) {
        await materialService.updateMaterial(editingItem.id, payload);
      } else {
        await materialService.createMaterial(payload);
      }
      await loadMaterials();
      setShowModal(false);
      setEditingItem(null);
    } catch (err: any) {
      setError(err?.message || "Error al guardar el material");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    setItemToDelete(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setDeleting(true);
      await materialService.deleteMaterial(itemToDelete);
      await loadMaterials();
      setShowConfirmModal(false);
      setItemToDelete(null);
    } catch (err: any) {
      setError(err?.message || "Error al eliminar el material");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const closeConfirm = () => {
    setShowConfirmModal(false);
    setItemToDelete(null);
  };

  return (
    <div className="p-6">
      <MaterialHeader
        title="Materiales"
        description="Gestiona los materiales del sistema"
        onAdd={() => setShowModal(true)}
      />

      <MaterialError error={error} onClose={() => setError("")} />

      <MaterialStats
        total={total}
        showing={items.length}
        page={page}
        pages={pages}
        limit={limit}
      />

      <MaterialFilters
        searchTerm={searchTerm}
        onSearchChange={(value: string) => {
          setSearchTerm(value);
          loadMaterials(1, limit, value);
        }}
        onRefresh={() => loadMaterials(page, limit, searchTerm)}
      />

      <MaterialTable
        items={items}
        onEdit={(item: MaterialItem) => {
          setEditingItem(item);
          setShowModal(true);
        }}
        onDelete={handleDelete}
        loading={loading && items.length === 0}
      />

      <MaterialPagination
        pagination={{
          page,
          limit,
          total,
          pages,
        }}
        onPageChange={(newPage: number) => {
          setPage(newPage);
          loadMaterials(newPage, limit, searchTerm);
        }}
        onLimitChange={(value: number) => {
          setLimit(value);
          loadMaterials(1, value, searchTerm);
        }}
      />

      <MaterialModal
        show={showModal}
        editingItem={editingItem}
        saving={saving}
        onClose={() => {
          setShowModal(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
      />

      <MaterialConfirmModal
        show={showConfirmModal}
        title="Confirmar eliminación"
        message="¿Seguro que deseas eliminar este material?"
        onConfirm={confirmDelete}
        onCancel={closeConfirm}
        loading={deleting}
      />
    </div>
  );
}
