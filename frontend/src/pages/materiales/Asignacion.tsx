import { useState, useEffect } from "react";
import type {
  AsignacionItem,
  CreateAsignacionRequest,
  PaginatedResponse,
} from "../../services/asignacionService";
import { asignacionService } from "../../services/asignacionService";
import { materialService } from "../../services/materialService";
import type { MaterialItem } from "../../services/materialService";
import AsignacionTable from "../../components/asignacion/AsignacionTable";
import AsignacionHeader from "../../components/asignacion/AsignacionHeader";
import AsignacionError from "../../components/asignacion/AsignacionError";
import AsignacionStats from "../../components/asignacion/AsignacionStats";
import AsignacionFilters from "../../components/asignacion/AsignacionFilters";
import AsignacionModal from "../../components/asignacion/AsignacionModal";
import AsignacionConfirmModal from "../../components/asignacion/AsignacionConfirmModal";
import AsignacionDetailsModal from "../../components/asignacion/AsignacionDetailsModal";
import { trabajadorService } from "../../services/trabajadorService";

export default function AsignacionPage() {
  const [items, setItems] = useState<AsignacionItem[]>([]);
  const [materiales, setMateriales] = useState<MaterialItem[]>([]);
  const [trabajadorMap, setTrabajadorMap] = useState<Record<number, string>>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<AsignacionItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsAsignacion, setDetailsAsignacion] = useState<AsignacionItem | null>(null);
  const [detailsTrabajador, setDetailsTrabajador] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadAsignaciones();
    loadMateriales();
    loadTrabajadores();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadAsignaciones(1, pagination.limit, searchTerm);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const loadAsignaciones = async (page: number = 1, limit: number = 10, search: string = "") => {
    try {
      setLoading(true);
      setError("");
      const response: PaginatedResponse<AsignacionItem> = await asignacionService.getAsignaciones(
        page,
        limit,
        search,
      );
      setItems(response.data || []);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        pages: response.total_pages,
      });
    } catch (err) {
      console.error("Error loading asignaciones:", err);
      setError("Error al cargar las asignaciones");
    } finally {
      setLoading(false);
    }
  };

  const loadMateriales = async () => {
    try {
      // Usar getMaterials con límite alto para obtener todos
      const response = await materialService.getMaterials(1, 1000);
      setMateriales(response.data || []);
    } catch (err) {
      console.error("Error loading materiales:", err);
    }
  };

  const loadTrabajadores = async () => {
    try {
      const response = await trabajadorService.getTrabajadores(1, 1000);
      const map: Record<number, string> = {};
      (response.data || []).forEach((t) => {
        // trabajadorService uses id_trabajador field
        // map by numeric id
        // ensure numeric key
        map[Number(t.id_trabajador)] = t.clave_trabajador || "";
      });
      setTrabajadorMap(map);
    } catch (err) {
      console.error("Error loading trabajadores:", err);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.pages) {
      loadAsignaciones(page, pagination.limit, searchTerm);
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
    loadAsignaciones(1, newLimit, searchTerm);
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
      await asignacionService.deleteAsignacion(itemToDelete);
      await loadAsignaciones(pagination.page, pagination.limit, searchTerm);
    } catch (err: any) {
      console.error("Error deleting asignación:", err);
      setError(err?.message || "Error al eliminar la asignación");
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

  const handleEdit = (item: AsignacionItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleView = async (item: AsignacionItem) => {
    try {
      setLoadingDetails(true);
      setDetailsAsignacion(null);
      setDetailsTrabajador(null);

      const full = await asignacionService.getAsignacion(item.id);
      setDetailsAsignacion(full);

      try {
        const trabajador = await trabajadorService.getTrabajador(full.id_trabajador);
        setDetailsTrabajador(trabajador);
      } catch (err) {
        setDetailsTrabajador(null);
      }

      setShowDetailsModal(true);
    } catch (err) {
      console.error("Error loading asignacion detalles:", err);
      setError("Error al cargar los detalles");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSave = async (formData: FormData) => {
    try {
      setSaving(true);
      setError("");

      const detallesStr = formData.get("detalles") as string;
      const detalles = JSON.parse(detallesStr);

      const itemData: CreateAsignacionRequest = {
        id_trabajador: parseInt(formData.get("id_trabajador") as string),
        fecha_asignacion: formData.get("fecha_asignacion") as string,
        observaciones: (formData.get("observaciones") as string) || undefined,
        detalles,
      };

      if (editingItem) {
        await asignacionService.updateAsignacion(editingItem.id, itemData);
      } else {
        await asignacionService.createAsignacion(itemData);
      }

      await loadAsignaciones(pagination.page, pagination.limit, searchTerm);
      setShowModal(false);
      setEditingItem(null);
    } catch (err: any) {
      console.error("Error saving asignación:", err);
      setError(
        err?.message ||
          (editingItem ? "Error al actualizar la asignación" : "Error al crear la asignación"),
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
          <p className="text-gray-600">Cargando asignaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <AsignacionHeader
        title="Asignaciones"
        description="Gestiona las asignaciones de materiales a técnicos"
        onAdd={() => setShowModal(true)}
      />

      <AsignacionError message={error} onClose={() => setError("")} />

      <AsignacionStats total={pagination.total} showing={items.length} />

      <AsignacionFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={() => loadAsignaciones(pagination.page, pagination.limit, searchTerm)}
      />

      <AsignacionTable
        items={items}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        trabajadorMap={trabajadorMap}
        startIndex={(pagination.page - 1) * pagination.limit}
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

      <AsignacionModal
        showModal={showModal}
        editingItem={editingItem}
        saving={saving}
        onClose={handleCloseModal}
        onSave={handleSave}
        materiales={materiales}
      />

      <AsignacionConfirmModal
        showConfirmModal={showConfirmModal}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        loading={deleting}
      />

      <AsignacionDetailsModal
        show={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setDetailsAsignacion(null);
          setDetailsTrabajador(null);
        }}
        asignacion={detailsAsignacion}
        trabajador={detailsTrabajador}
        loading={loadingDetails}
      />
    </div>
  );
}
