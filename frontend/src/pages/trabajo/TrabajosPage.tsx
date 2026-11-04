import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Table } from "../../components/ui/Table";
import { trabajoService } from "../../services/trabajoService";
import { trabajadorService } from "../../services/trabajadorService";
import { claveService } from "../../services/claveService";
import type { TrabajoItem } from "../../services/trabajoService";
import type { TrabajadorItem } from "../../services/trabajadorService";
import type { ClaveItem } from "../../services/claveService";

/**
 * Página de listado y gestión de Trabajos (órdenes de trabajo).
 *
 * TASK-710-08 — Módulo de Trabajos (frontend).
 * Conecta con backend-mp: GET/POST/PUT/DELETE /api/mp/trabajo.
 *
 * Notas de negocio:
 * - Un trabajo SIEMPRE está asociado a una queja (id_queja obligatorio).
 * * La creación de un trabajo desde esta pantalla requiere indicar id_queja.
 * - La asignación de técnicos se hace mediante el arreglo `trabajadores`
 *   (tabla intermedia trabajo_trabajadores).
 */
export default function TrabajosPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<TrabajoItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Combos para el formulario crear/editar
  const [trabajadores, setTrabajadores] = useState<TrabajadorItem[]>([]);
  const [claves, setClaves] = useState<ClaveItem[]>([]);
  const [combosLoading, setCombosLoading] = useState(true);

  // Modal crear/editar
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TrabajoItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Formulario
  const [form, setForm] = useState({
    fecha: "",
    probador: "",
    estado: "",
    observaciones: "",
    id_queja: "",
    trabajadores: [] as number[],
  });

  // Eliminar
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ------------------------------------------------------------------
  // Carga inicial: datos + catálogos (trabajadores, claves)
  // ------------------------------------------------------------------
  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await trabajoService.getTrabajos(
        pagination.page,
        pagination.limit,
        searchTerm,
        sortBy,
        sortOrder,
      );
      setItems(data.data);
      setPagination(data.pagination);
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Error al cargar los trabajos",
      );
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, sortBy, sortOrder]);

  const loadCombos = useCallback(async () => {
    setCombosLoading(true);
    try {
      const [trabResp, claveResp] = await Promise.all([
        trabajadorService.getTrabajadores(1, 100, ""),
        claveService.getClaves(1, 100, ""),
      ]);
      setTrabajadores(trabResp.data);
      setClaves(claveResp.data);
    } catch (e: unknown) {
      console.error("Error cargando catálogos:", e);
    } finally {
      setCombosLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    void loadCombos();
  }, [loadCombos]);

  // ------------------------------------------------------------------
  // Handlers de listado
  // ------------------------------------------------------------------
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPagination({ ...pagination, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };

  const handleLimitChange = (limit: number) => {
    setPagination({ ...pagination, limit, page: 1 });
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setSortOrder("ASC");
    }
  };

  const handleRefresh = () => {
    void loadData();
  };

  // ------------------------------------------------------------------
  // Formulario crear / editar
  // ------------------------------------------------------------------
  const handleOpenCreate = () => {
    setEditingItem(null);
    setForm({
      fecha: "",
      probador: "",
      estado: "",
      observaciones: "",
      id_queja: "",
      trabajadores: [],
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: TrabajoItem) => {
    setEditingItem(item);
    setForm({
      fecha: item.fecha ?? "",
      probador: String(item.probador ?? ""),
      estado: String(item.estado ?? ""),
      observaciones: item.observaciones ?? "",
      id_queja: String(item.id_queja ?? ""),
      trabajadores: (item.trabajadores ?? []).map((t) => t.id_trabajador),
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target as
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTrabajadorToggle = (idTrabajador: number) => {
    setForm((prev) => {
      const idx = prev.trabajadores.indexOf(idTrabajador);
      if (idx >= 0) {
        return { ...prev, trabajadores: prev.trabajadores.filter((id) => id !== idTrabajador) };
      }
      return { ...prev, trabajadores: [...prev.trabajadores, idTrabajador] };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload: any = {
      fecha: form.fecha,
      probador: Number(form.probador) || undefined,
      estado: Number(form.estado) || undefined,
      observaciones: form.observaciones || undefined,
      id_queja: Number(form.id_queja) || undefined,
      trabajadores: form.trabajadores.map((id) => ({ id_trabajador: id })),
    };

    try {
      if (editingItem) {
        await trabajoService.updateTrabajo(editingItem.id_trabajo, payload);
      } else {
        await trabajoService.createTrabajo(payload);
      }
      await loadData();
      setShowModal(false);
      setEditingItem(null);
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Error al guardar el trabajo",
      );
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------------------------
  // Eliminar
  // ------------------------------------------------------------------
  const handleDeleteClick = (id: number) => {
    setItemToDelete(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await trabajoService.deleteTrabajo(itemToDelete);
      await loadData();
      setShowConfirm(false);
      setItemToDelete(null);
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Error al eliminar el trabajo",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setItemToDelete(null);
  };

  // ------------------------------------------------------------------
  // Columnas de la tabla (usando componente Table compartido)
  // ------------------------------------------------------------------
  const columns = [
    { key: "id_trabajo", label: "ID" },
    {
      key: "fecha",
      label: "Fecha",
      format: (v: any) => (v ? v.slice(0, 16).replace("T", " ") : "—"),
    },
    {
      key: "probador",
      label: "Probador",
      format: (_v: any, item: TrabajoItem) => (
        <span className="text-sm text-gray-700">
          {item.tb_trabajador?.clave_trabajador ?? item.probador ?? "—"}
        </span>
      ),
    },
    {
      key: "estado",
      label: "Estado (clave)",
      format: (_v: any, item: TrabajoItem) => (
        <span className="text-sm text-gray-700">
          {item.tb_clave?.clave ?? item.estado ?? "—"}
        </span>
      ),
    },
    {
      key: "observaciones",
      label: "Observaciones",
      format: (v: any) => (v ? v.slice(0, 40) + (v.length > 40 ? "…" : "") : "—"),
    },
    { key: "id_queja", label: "Queja ID" },
    {
      key: "trabajadores",
      label: "Técnicos",
      format: (_v: any, item: TrabajoItem) => {
        const ts = item.trabajadores ?? [];
        if (ts.length === 0) return <span className="text-gray-400 text-xs">—</span>;
        return (
          <span className="text-sm text-blue-600 font-medium">
            {ts.length} técnico{ts.length > 1 ? "s" : ""}
          </span>
        );
      },
    },
  ];

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  if (loading && items.length === 0) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-3xl text-blue-600 mb-2"></i>
          <p className="text-gray-600">Cargando trabajos…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Órdenes de Trabajo</h1>
          <p className="text-gray-600 text-sm">
            Listado, edición y asignación de técnicos a trabajos de quejas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreate}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center space-x-2 disabled:opacity-50"
          >
            <i className="ri-add-line"></i>
            <span>Nuevo trabajo</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {/* Buscar */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-80">
          <i className="ri-search-line absolute left-3 top-3 text-gray-400"></i>
          <input
            type="text"
            placeholder="Buscar trabajo…"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm"
        >
          <i className="ri-refresh-line mr-1"></i>
          Refrescar
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table<TrabajoItem>
          items={items}
          columns={columns}
          cardTitle={(item) => `Trabajo #${item.id_trabajo}`}
          renderRowActions={(item) => (
            <div className="flex gap-1">
              <button
                onClick={() => navigate(`/sistema/main/trabajos/${item.id_trabajo}`)}
                className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                title="Ver ficha"
              >
                <i className="ri-eye-line"></i>
              </button>
              <button
                onClick={() => handleOpenEdit(item)}
                className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50 transition-colors"
                title="Editar"
              >
                <i className="ri-edit-line"></i>
              </button>
              <button
                onClick={() => handleDeleteClick(item.id_trabajo)}
                className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 transition-colors"
                title="Eliminar"
              >
                <i className="ri-delete-bin-line"></i>
              </button>
            </div>
          )}
          loading={loading}
          emptyMessage="No se encontraron trabajos"
        />
      </div>

      {/* Paginación */}
      {pagination.pages > 1 && (
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-3">
          <div className="text-sm text-gray-600">
            Mostrando {pagination.page} de {pagination.pages} páginas ({pagination.total} trabajos)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal crear/editar */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        style={{ display: showModal ? "flex" : "none" }}
      >
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl sm:w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {editingItem ? "Editar trabajo" : "Crear trabajo"}
            </h2>
            <button
              onClick={handleCloseModal}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="ri-close-line"></i>
            </button>
          </div>

          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                <input
                  type="datetime-local"
                  name="fecha"
                  value={form.fecha}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Probador (trabajador) *</label>
                <select
                  name="probador"
                  value={form.probador}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar probador</option>
                  {trabajadores.map((t) => (
                    <option key={t.id_trabajador} value={t.id_trabajador}>
                      {t.clave_trabajador} — {t.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Estado (clave) *</label>
                <select
                  name="estado"
                  value={form.estado}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar estado/clave</option>
                  {claves.map((c) => (
                    <option key={c.id_clave} value={c.id_clave}>
                      {c.clave} — {c.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">ID Queja *</label>
                <input
                  type="number"
                  name="id_queja"
                  value={form.id_queja}
                  onChange={handleFormChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="ID de la queja"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <textarea
                name="observaciones"
                value={form.observaciones}
                onChange={handleFormChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Observaciones del trabajo"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Técnicos asignados</label>
              <div className="flex flex-wrap gap-2">
                {trabajadores.map((t) => {
                  const selected = form.trabajadores.includes(t.id_trabajador);
                  return (
                    <button
                      key={t.id_trabajador}
                      type="button"
                      onClick={() => handleTrabajadorToggle(t.id_trabajador)}
                      className={`px-3 py-1.5 rounded text-sm border transition-colors ${
                        selected
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {t.clave_trabajador}
                    </button>
                  );
                })}
                {trabajadores.length === 0 && (
                  <span className="text-xs text-gray-400 italic">Sin técnicos disponibles</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Seleccione uno o más técnicos asignados a este trabajo
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              onClick={() => handleSave({ preventDefault: () => {} } as any)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
            >
              {saving ? "Guardando…" : editingItem ? "Actualizar" : "Crear trabajo"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal confirmar eliminar */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        style={{ display: showConfirm ? "flex" : "none" }}
      >
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Eliminar trabajo</h2>
          <p className="text-gray-600 mb-4">
            ¿Está seguro de que desea eliminar el trabajo #{itemToDelete}? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancelDelete}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50"
            >
              {deleting ? "Eliminando…" : "Eliminar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
