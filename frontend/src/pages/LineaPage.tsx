import { useState, useEffect } from "react";
import type {
  LineaItem,
  RecorridoItem,
  QuejaItem,
  CreateLineaRequest,
  PaginatedResponse,
} from "../services/lineaService";
import { lineaService } from "../services/lineaService";
import { movimientoService } from "../services/movimientoService";

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
  LineaDetallesModal,
  LineaEliminarMovimientoModal,
} from "../components/linea";
import { getBackendErrorMessage } from "../utils/apiErrors";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Estados para la confirmación de eliminación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  // estados para dar baja (no borrado físico)
  const [showBajaModal, setShowBajaModal] = useState(false);
  const [lineaParaBaja, setLineaParaBaja] = useState<LineaItem | null>(null);

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

  const loadLineas = async (
    page: number = 1,
    limit: number = 10,
    search: string = "",
    estado: string = "",
  ) => {
    try {
      setLoading(true);
      setError("");

      const response: PaginatedResponse<LineaItem> =
        await lineaService.getLineas(page, limit, search, estado);

      setItems(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError("Error al cargar las líneas");
      console.error("Error loading lineas:", err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar detalles de la línea
  // En la función loadLineaDetalles de LineaPage.tsx
  const loadLineaDetalles = async (id: number) => {
    try {
      console.log("Cargando detalles para línea ID:", id);
      setLoadingDetalles(true);
      const detalles = await lineaService.getLineaDetalles(id);
      console.log("Detalles recibidos:", detalles);

      setLineaDetalles(detalles.linea);
      setRecorridos(detalles.recorridos);
      setQuejas(detalles.quejas);

      console.log("Abriendo modal de detalles...");
      setShowDetallesModal(true);
    } catch (err) {
      console.error("Error loading linea detalles:", err);
      setError("Error al cargar los detalles de la línea");
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
    console.log("Buscando línea para eliminar ID:", id);
    const lineaToDelete = items.find((l) => l.id_linea === id);
    if (lineaToDelete) {
      setItemToDelete(id);
      setShowConfirmModal(true);
    }
  };

  const handleConfirmBeforeDelete = async () => {
    setShowConfirmModal(false);
    if (!itemToDelete) return;
    try {
      setDeleting(true);
      await lineaService.deleteLinea(itemToDelete);
      await loadLineas(
        pagination.page,
        pagination.limit,
        searchTerm,
        estadoFilter,
      );
    } catch (err: unknown) {
      console.error("❌ Error en eliminación:", err);
      setError(getBackendErrorMessage(err, "Error al eliminar la línea"));
    } finally {
      setDeleting(false);
      setItemToDelete(null);
    }
  };

  const handleBaja = (item: LineaItem) => {
    setLineaParaBaja(item);
    setShowBajaModal(true);
  };

  const handleCancelBaja = () => {
    console.log("Baja cancelada por el usuario");
    setShowBajaModal(false);
    setLineaParaBaja(null);
  };


  const handleCancelDelete = () => {
    console.log("Eliminación cancelada por el usuario");
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
      setError("");

      const itemData: CreateLineaRequest = {
        clavelinea: formData.get("clavelinea") as string,
        clave_n: (formData.get("clave_n") as string) || undefined,
        codificacion: (formData.get("codificacion") as string) || undefined,
        hilos: (formData.get("hilos") as string) || undefined,
        desde: formData.get("desde") as string,
        dirde: formData.get("dirde") as string,
        distdesde: formData.get("distdesde")
          ? parseFloat(formData.get("distdesde") as string)
          : undefined,
        zd: formData.get("zd") as string,
        hasta: formData.get("hasta") as string,
        dirha: formData.get("dirha") as string,
        disthasta: formData.get("disthasta")
          ? parseFloat(formData.get("disthasta") as string)
          : undefined,
        zh: formData.get("zh") as string,
        facturado: (formData.get("facturado") as string) || undefined,
        sector: (formData.get("sector") as string) || undefined,
        id_senalizacion: formData.get("id_senalizacion")
          ? parseInt(formData.get("id_senalizacion") as string)
          : null,
        id_tipolinea: formData.get("id_tipolinea")
          ? parseInt(formData.get("id_tipolinea") as string)
          : null,
        id_propietario: formData.get("id_propietario")
          ? parseInt(formData.get("id_propietario") as string)
          : null,
      };

      let nuevoLineaId: number | undefined;
      if (editingItem) {
        await lineaService.updateLinea(editingItem.id_linea, itemData);
      } else {
        // Crear la línea
        const nuevoLinea = await lineaService.createLinea(itemData);
        nuevoLineaId = nuevoLinea.id_linea;

        // Si es creación (no edición) y hay datos de movimiento, crear el movimiento de alta
        const id_tipomovimiento = formData.get("id_tipomovimiento")
          ? parseInt(formData.get("id_tipomovimiento") as string)
          : null;
        const fecha = formData.get("fecha") as string;
        const motivo = formData.get("motivo") as string;

        if (nuevoLineaId && id_tipomovimiento && fecha && motivo) {
          await movimientoService.createMovimiento({
            id_tipomovimiento,
            fecha,
            motivo,
            id_telefono: null,
            id_linea: nuevoLineaId,
            id_os: null,
          } as any);
        }
      }

      loadLineas(pagination.page, pagination.limit, searchTerm, estadoFilter);
      setShowModal(false);
      setEditingItem(null);
    } catch (err: unknown) {
      setError(
        getBackendErrorMessage(
          err,
          editingItem
            ? "Error al actualizar la línea"
            : "Error al crear la línea",
        ),
      );
      console.error("Error saving linea:", err);
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
      <LineaError error={error} onClose={() => setError("")} />

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
        onRefresh={() =>
          loadLineas(
            pagination.page,
            pagination.limit,
            searchTerm,
            estadoFilter,
          )
        }
      />

      {/* Table */}
      <LineaTable
        items={items}
        searchTerm={searchTerm}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBaja={handleBaja}
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
        onConfirm={handleConfirmBeforeDelete}
        onCancel={handleCancelDelete}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        loading={deleting}
      />

      {/* Modal de Baja con movimiento */}
      <LineaEliminarMovimientoModal
        show={showBajaModal}
        lineaClave={lineaParaBaja?.clavelinea}
        loading={deleting}
        onConfirm={async (movimientoData) => {
          if (!lineaParaBaja) return;
          const id = lineaParaBaja.id_linea;
          try {
            setDeleting(true);
            setError("");
            await movimientoService.createMovimiento({
              id_tipomovimiento: movimientoData.id_tipomovimiento,
              fecha: movimientoData.fecha,
              motivo: movimientoData.motivo,
              id_telefono: null,
              id_linea: id,
              id_os: null,
            } as any);
            await lineaService.updateLinea(id, { esbaja: true } as any);
            await loadLineas(
              pagination.page,
              pagination.limit,
              searchTerm,
              estadoFilter,
            );
          } catch (err: unknown) {
            console.error("❌ Error en baja:", err);
            setError(
              getBackendErrorMessage(err, "Error al dar baja a la línea"),
            );
          } finally {
            setDeleting(false);
            setShowBajaModal(false);
            setLineaParaBaja(null);
          }
        }}
        onCancel={handleCancelBaja}
        title="Registrar baja de línea"
        confirmText="Dar baja"
        confirmColor="bg-yellow-600"
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
