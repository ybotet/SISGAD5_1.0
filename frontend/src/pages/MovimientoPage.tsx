import { useState, useEffect } from "react";
import { movimientoService } from "../services/movimientoService";

import type {
  MovimientoItem,
  CreateMovimientoRequest,
  PaginatedResponse,
} from "../services/movimientoService";

//Components
import MovimientoHeader from "../components/movimiento/MovimientoHeader";
import MovimientoError from "../components/movimiento/MovimientoError";
import MovimientoTable from "../components/movimiento/MovimientoTable";
import MovimientoPagination from "../components/movimiento/MovimientoPagination";
import MovimientoModal from "../components/movimiento/MovimientoModal";
import { getBackendErrorMessage } from "../utils/apiErrors";

export default function MovimientoPage() {
  const [movimientos, setMovimientos] = useState<MovimientoItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  // editingMovimiento currently not used; keep simple listing/creation flow

  // cargar lista inicial
  useEffect(() => {
    loadMovimientos();
  }, []);

  const loadMovimientos = async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      setError("");
      const response: PaginatedResponse<MovimientoItem> =
        await movimientoService.getMovimientos(page, limit);
      setMovimientos(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error("Error cargando movimientos:", err);
      setError(getBackendErrorMessage(err, "Error cargando movimientos"));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMovimiento = async (data: CreateMovimientoRequest) => {
    try {
      setSaving(true);
      await movimientoService.createMovimiento(data);
      setShowModal(false);
      loadMovimientos(pagination.page, pagination.limit);
    } catch (err: any) {
      console.error("Error creando movimiento:", err);
      alert(getBackendErrorMessage(err, "Error creando movimiento"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <MovimientoHeader onCreate={() => setShowModal(true)} />
      {error && <MovimientoError message={error} />}
      <MovimientoTable movimientos={movimientos} loading={loading} />
      <MovimientoPagination
        page={pagination.page}
        pages={pagination.pages}
        onPageChange={(newPage: number) =>
          loadMovimientos(newPage, pagination.limit)
        }
      />
      <MovimientoModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleCreateMovimiento}
        saving={saving}
      />
    </div>
  );
}
