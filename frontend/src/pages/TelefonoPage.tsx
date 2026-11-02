import { useState, useEffect } from "react";
import type {
  TelefonoItem,
  RecorridoItem,
  QuejaItem,
  CreateTelefonoRequest,
  PaginatedResponse,
} from "../services/telefonoService";
import { telefonoService } from "../services/telefonoService";
import { movimientoService } from "../services/movimientoService";

// Components
import {
  TelefonoHeader,
  TelefonoError,
  TelefonoStats,
  TelefonoFilters,
  TelefonoTable,
  TelefonoPagination,
  TelefonoModal,
  TelefonoConfirmModal,
  TelefonoDetallesModal,
  TelefonoEliminarMovimientoModal,
} from "../components/telefono";
import { getBackendErrorMessage } from "../utils/apiErrors";

export default function TelefonoPage() {
  // Estados principales
  const [items, setItems] = useState<TelefonoItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TelefonoItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Estados para la confirmación de eliminación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  // estados para dar baja (no borrado fisico)
  const [showBajaModal, setShowBajaModal] = useState(false);
  const [telefonoParaBaja, setTelefonoParaBaja] = useState<TelefonoItem | null>(
    null,
  );

  // Estados para detalles
  const [showDetallesModal, setShowDetallesModal] = useState(false);
  const [telefonoDetalles, setTelefonoDetalles] = useState<TelefonoItem | null>(
    null,
  );
  const [recorridos, setRecorridos] = useState<RecorridoItem[]>([]);
  const [quejas, setQuejas] = useState<QuejaItem[]>([]);
  const [loadingDetalles, setLoadingDetalles] = useState(false);

  // Cargar datos
  useEffect(() => {
    loadTelefonos();
  }, []);

  // Cargar teléfonos cuando cambia el término de búsqueda o el filtro de estado
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadTelefonos(1, pagination.limit, searchTerm, estadoFilter);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, estadoFilter]);

  const loadTelefonos = async (
    page: number = 1,
    limit: number = 10,
    search: string = "",
    estado: string = "",
  ) => {
    try {
      setLoading(true);
      setError("");

      // Construir parámetros de búsqueda
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) {
        params.append("search", search);
      }

      if (estado) {
        params.append("estado", estado);
      }

      const response: PaginatedResponse<TelefonoItem> =
        await telefonoService.getTelefonos(page, limit, search, estado);

      setItems(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError("Error al cargar los teléfonos");
      console.error("Error loading telefonos:", err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar detalles del teléfono
  const loadTelefonoDetalles = async (id: number) => {
    try {
      setLoadingDetalles(true);
      const detalles = await telefonoService.getTelefonoDetalles(id);
      setTelefonoDetalles(detalles.telefono);
      setRecorridos(detalles.recorridos);
      setQuejas(detalles.quejas);
      setShowDetallesModal(true);
    } catch (err) {
      setError("Error al cargar los detalles del teléfono");
      console.error("Error loading telefono detalles:", err);
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
      loadTelefonos(page, pagination.limit, searchTerm, estadoFilter);
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
    loadTelefonos(1, newLimit, searchTerm, estadoFilter);
  };

  // Funciones para eliminar
  const handleDelete = (id: number) => {
    const telefonoToDelete = items.find((t) => t.id_telefono === id);
    if (telefonoToDelete) {
      setItemToDelete(id);
      setShowConfirmModal(true);
    }
  };

  // user confirmed intention to delete, perform deletion
  const handleConfirmBeforeDelete = async () => {
    setShowConfirmModal(false);
    if (!itemToDelete) return;
    try {
      setDeleting(true);
      await telefonoService.deleteTelefono(itemToDelete);
      await loadTelefonos(
        pagination.page,
        pagination.limit,
        searchTerm,
        estadoFilter,
      );
    } catch (err: unknown) {
      console.error("❌ Error en eliminación:", err);
      setError(getBackendErrorMessage(err, "Error al eliminar el teléfono"));
    } finally {
      setDeleting(false);
      setItemToDelete(null);
    }
  };

  const handleBaja = (item: TelefonoItem) => {
    setTelefonoParaBaja(item);
    setShowBajaModal(true);
  };


  const handleCancelDelete = () => {
    console.log("Eliminación cancelada por el usuario");
    setShowConfirmModal(false);
    setItemToDelete(null);
  };

  const handleConfirmBajaWithMovimiento = async (movimientoData: {
    id_tipomovimiento: number;
    fecha: string;
    motivo: string;
  }) => {
    if (!telefonoParaBaja) return;
    const telefonoId = telefonoParaBaja.id_telefono;
    console.log("Confirmando baja para ID:", telefonoId);

    try {
      setDeleting(true);
      setError("");

      // crear movimiento de baja
      await movimientoService.createMovimiento({
        id_tipomovimiento: movimientoData.id_tipomovimiento,
        fecha: movimientoData.fecha,
        motivo: movimientoData.motivo,
        id_telefono: telefonoId,
        id_linea: null,
        id_os: null,
      } as any);

      // marcar teléfono como baja sin borrarlo
      await telefonoService.updateTelefono(telefonoId, { esbaja: true });
      console.log("Baja registrada");

      // recargar datos
      await loadTelefonos(
        pagination.page,
        pagination.limit,
        searchTerm,
        estadoFilter,
      );
    } catch (err: unknown) {
      console.error("Error en baja:", err);
      setError(getBackendErrorMessage(err, "Error al dar baja al teléfono"));
    } finally {
      setDeleting(false);
      setShowBajaModal(false);
      setTelefonoParaBaja(null);
    }
  };

  const handleCancelBaja = () => {
    console.log("Baja cancelada por el usuario");
    setShowBajaModal(false);
    setTelefonoParaBaja(null);
  };

  // Funciones para editar y guardar
  const handleEdit = (item: TelefonoItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleView = (item: TelefonoItem) => {
    loadTelefonoDetalles(item.id_telefono);
  };

  const handleSave = async (formData: FormData) => {
    try {
      setSaving(true);
      setError("");

      const itemData: CreateTelefonoRequest = {
        telefono: (formData.get("telefono") as string) || undefined,
        nombre: (formData.get("nombre") as string) || undefined,
        direccion: (formData.get("direccion") as string) || undefined,
        lic: (formData.get("lic") as string) || undefined,
        zona: (formData.get("zona") as string) || undefined,
        extensiones: formData.get("extensiones")
          ? parseInt(formData.get("extensiones") as string)
          : undefined,
        facturado: (formData.get("facturado") as string) || undefined,
        sector: (formData.get("sector") as string) || undefined,
        id_mando: formData.get("id_mando")
          ? parseInt(formData.get("id_mando") as string)
          : null,
        id_clasificacion: formData.get("id_clasificacion")
          ? parseInt(formData.get("id_clasificacion") as string)
          : null,
        esbaja: formData.get("esbaja") === "true",
      };

      let nuevoTelefonoId: number | undefined;
      if (editingItem) {
        // actualizar y mantener el id para el posible movimiento
        await telefonoService.updateTelefono(editingItem.id_telefono, itemData);
        nuevoTelefonoId = editingItem.id_telefono;
      } else {
        // crear el teléfono por primera vez
        const nuevoTelefono = await telefonoService.createTelefono(itemData);
        nuevoTelefonoId = nuevoTelefono.id_telefono;
      }

      // -- movimiento (si se completaron los campos en el formulario) --
      const rawTipo = (formData.get("id_tipomovimiento") as string) || "";
      const id_tipomovimiento = rawTipo !== "" ? parseInt(rawTipo, 10) : NaN;
      const fecha = (formData.get("fecha") as string) || "";
      const motivo = (formData.get("motivo") as string) || "";

      console.log("Datos capturados del formulario:");
      console.log("  rawTipo=", rawTipo);
      console.log(
        "  id_tipomovimiento=",
        id_tipomovimiento,
        "isNaN?",
        isNaN(id_tipomovimiento),
      );
      console.log("  fecha=", fecha, "vacia?", fecha === "");
      console.log("  motivo=", motivo, "vacia?", motivo === "");
      console.log("  nuevoTelefonoId=", nuevoTelefonoId);

      if (
        nuevoTelefonoId &&
        !isNaN(id_tipomovimiento) &&
        fecha !== "" &&
        motivo !== ""
      ) {
        console.log("Condición de movimiento CUMPLIDA, creando...");
        const payloadMovimiento = {
          id_tipomovimiento,
          fecha,
          motivo,
          id_telefono: nuevoTelefonoId,
          id_linea: null,
          id_os: null,
        };
        console.log("Payload antes de enviar:", payloadMovimiento);
        try {
          const resultMovimiento =
            await movimientoService.createMovimiento(payloadMovimiento);
          console.log(
            "Movimiento de alta creado para teléfono",
            nuevoTelefonoId,
            "- Respuesta:",
            resultMovimiento,
          );
        } catch (movErr) {
          console.error("Error creando movimiento de alta:", movErr);
        }
      } else {
        console.log("Condición de movimiento NO CUMPLIDA:", {
          nuevoTelefonoId,
          id_tipomovimiento,
          fecha,
          motivo,
        });
      }

      loadTelefonos(
        pagination.page,
        pagination.limit,
        searchTerm,
        estadoFilter,
      );
      setShowModal(false);
      setEditingItem(null);
    } catch (err: unknown) {
      setError(
        getBackendErrorMessage(
          err,
          editingItem
            ? "Error al actualizar el teléfono"
            : "Error al crear el teléfono",
        ),
      );
      console.error("Error saving telefono:", err);
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
    setTelefonoDetalles(null);
    setRecorridos([]);
    setQuejas([]);
  };

  // Loading state
  if (loading && items.length === 0) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-2xl text-blue-600 mb-2"></i>
          <p className="text-gray-600">Cargando teléfonos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <TelefonoHeader
        title="Teléfonos"
        description="Gestiona los teléfonos del sistema"
        onAdd={() => setShowModal(true)}
      />

      {/* Error */}
      <TelefonoError error={error} onClose={() => setError("")} />

      {/* Stats */}
      <TelefonoStats
        total={pagination.total}
        showing={items.length}
        page={pagination.page}
        pages={pagination.pages}
        limit={pagination.limit}
      />

      {/* Filters */}
      <TelefonoFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        estadoFilter={estadoFilter}
        onEstadoFilterChange={handleEstadoFilterChange}
        onRefresh={() =>
          loadTelefonos(
            pagination.page,
            pagination.limit,
            searchTerm,
            estadoFilter,
          )
        }
      />

      {/* Table */}
      <TelefonoTable
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
        <TelefonoPagination
          pagination={pagination}
          onPageChange={goToPage}
          onLimitChange={handleLimitChange}
          onNext={nextPage}
          onPrev={prevPage}
        />
      )}

      {/* Modal de Crear/Editar */}
      <TelefonoModal
        show={showModal}
        editingItem={editingItem}
        saving={saving}
        onClose={handleCloseModal}
        onSave={handleSave}
      />

      {/* Modal de Confirmación de Eliminación */}
      <TelefonoConfirmModal
        show={showConfirmModal}
        title="Confirmar Eliminación"
        message="¿Está seguro de que desea eliminar este teléfono? Esta acción no se puede deshacer."
        onConfirm={handleConfirmBeforeDelete}
        onCancel={handleCancelDelete}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        loading={deleting}
      />

      {/* Modal de Baja con movimiento */}
      <TelefonoEliminarMovimientoModal
        show={showBajaModal}
        telefonoNumero={telefonoParaBaja?.telefono || ""}
        loading={deleting}
        onConfirm={handleConfirmBajaWithMovimiento}
        onCancel={handleCancelBaja}
        title="Registrar baja de teléfono"
        confirmText="Dar baja"
        confirmColor="bg-yellow-600"
      />

      {/* Modal de Detalles */}
      <TelefonoDetallesModal
        show={showDetallesModal}
        telefono={telefonoDetalles}
        recorridos={recorridos}
        quejas={quejas}
        loading={loadingDetalles}
        onClose={handleCloseDetallesModal}
      />
    </div>
  );
}
