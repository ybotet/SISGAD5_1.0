import { useState, useEffect } from "react";
import { consumoService } from "../../services/consumoService";
import { quejaService } from "../../services/quejaService";
import { materialService } from "../../services/materialService";
import ConsumoTable from "../../components/consumo/ConsumoTable";
import ConsumoModal from "../../components/consumo/ConsumoModal";
import ConsumoDetailsModal from "../../components/consumo/ConsumoDetailsModal";
import type { ConsumoItem } from "../../services/consumoService";
// imports for assignment UI not used in this page removed
import { trabajadorService } from "../../services/trabajadorService";

export default function ConsumoPage() {
  const [numReporte, setNumReporte] = useState("");
  const [trabajos, setTrabajos] = useState<any[]>([]);
  const [selectedTrabajo, setSelectedTrabajo] = useState<any | null>(null);
  const [consumos, setConsumos] = useState<any[]>([]);
  const [materiales, setMateriales] = useState<any[]>([]);
  const [trabajadorMap, setTrabajadorMap] = useState<Record<number, string>>({});
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsConsumo, setDetailsConsumo] = useState<ConsumoItem | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Global consumos list
  const [allConsumos, setAllConsumos] = useState<ConsumoItem[]>([]);
  const [allPagination, setAllPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loadingAll, setLoadingAll] = useState(false);
  const [allError, setAllError] = useState<string>("");
  const [allSearch, setAllSearch] = useState<string>("");
  const [allFechaDesde, setAllFechaDesde] = useState<string | undefined>(undefined);
  const [allFechaHasta, setAllFechaHasta] = useState<string | undefined>(undefined);
  const [allClaveTrabajador, setAllClaveTrabajador] = useState<string | undefined>(undefined);

  const buscarQueja = async () => {
    try {
      const resp = await quejaService.getQuejas(1, 10, numReporte);
      if (resp.data && resp.data.length > 0) {
        const q = resp.data[0];
        const detalles = await quejaService.getQuejaDetalles(q.id_queja);
        setTrabajos(detalles.trabajos || []);
      } else {
        setTrabajos([]);
      }
    } catch (err) {
      console.error("Error buscando queja:", err);
    }
  };

  const seleccionarTrabajo = async (t: any) => {
    setSelectedTrabajo(t);
    try {
      const c = await consumoService.getConsumosPorTrabajo(t.id_trabajo);
      setConsumos(c || []);
    } catch (err) {
      console.error("Error cargando consumos:", err);
    }
  };

  const loadAllConsumos = async (
    page: number = 1,
    limit: number = 10,
    search: string = "",
    fechaDesde?: string,
    fechaHasta?: string,
    claveTrabajador?: string,
  ) => {
    try {
      setLoadingAll(true);
      setAllError("");
      const all = await consumoService.listAllConsumos();

      let filtered = (all || []).slice();

      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            (c.observaciones || "").toLowerCase().includes(s) ||
            c.id_trabajador.toString().includes(s),
        );
      }

      if (fechaDesde || fechaHasta) {
        const desde = fechaDesde ? new Date(fechaDesde) : null;
        const hasta = fechaHasta ? new Date(fechaHasta) : null;
        filtered = filtered.filter((c) => {
          const d = new Date(c.fecha_consumo);
          if (desde && d < desde) return false;
          if (hasta && d > hasta) return false;
          return true;
        });
      }

      if (claveTrabajador) {
        try {
          const resp = await trabajadorService.getTrabajadores(1, 50, claveTrabajador);
          const ids = (resp.data || []).map((t) => t.id_trabajador);
          const claveLower = claveTrabajador.toLowerCase();
          filtered = filtered.filter(
            (c) =>
              ids.includes(c.id_trabajador) ||
              (String(c.id_trabajador) || "").toLowerCase().includes(claveLower),
          );
        } catch (e) {
          // ignore
        }
      }

      const sorted = filtered
        .slice()
        .sort((a, b) => new Date(b.fecha_consumo).getTime() - new Date(a.fecha_consumo).getTime());

      const total = sorted.length;
      const pages = Math.max(1, Math.ceil(total / limit));
      const offset = (page - 1) * limit;
      const pageItems = sorted.slice(offset, offset + limit);

      setAllConsumos(pageItems);
      setAllPagination({ page, limit, total, pages });
    } catch (err) {
      console.error("Error cargando todos los consumos:", err);
      setAllError("Error al cargar consumos");
    } finally {
      setLoadingAll(false);
    }
  };

  const loadMateriales = async () => {
    try {
      const r = await materialService.getMaterials(1, 1000);
      setMateriales(r.data || []);
    } catch (err) {
      console.error("Error cargando materiales:", err);
    }
  };

  const loadTrabajadores = async () => {
    try {
      const resp = await trabajadorService.getTrabajadores(1, 1000);
      const map: Record<number, string> = {};
      (resp.data || []).forEach((t) => {
        map[Number(t.id_trabajador)] = t.clave_trabajador || String(t.id_trabajador);
      });
      setTrabajadorMap(map);
    } catch (err) {
      console.error("Error cargando trabajadores:", err);
    }
  };

  const handleCreateConsumo = async (payload: any) => {
    try {
      await consumoService.createConsumo(payload);
      if (selectedTrabajo) seleccionarTrabajo(selectedTrabajo);
      await loadAllConsumos(
        allPagination.page,
        allPagination.limit,
        allSearch,
        allFechaDesde,
        allFechaHasta,
        allClaveTrabajador,
      );
      setShowModal(false);
    } catch (err) {
      console.error("Error creando consumo:", err);
      alert("Error creando consumo");
    }
  };

  useEffect(() => {
    loadMateriales();
    loadAllConsumos(allPagination.page, allPagination.limit);
    loadTrabajadores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      loadAllConsumos(
        1,
        allPagination.limit,
        allSearch,
        allFechaDesde,
        allFechaHasta,
        allClaveTrabajador,
      );
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSearch, allFechaDesde, allFechaHasta, allClaveTrabajador]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Consumos</h2>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex gap-2">
          <input
            value={numReporte}
            onChange={(e) => setNumReporte(e.target.value)}
            placeholder="Buscar por num_reporte"
            className="px-3 py-2 border rounded flex-1"
          />
          <button onClick={buscarQueja} className="px-4 py-2 bg-blue-600 text-white rounded">
            Buscar
          </button>
        </div>

        {trabajos.length > 0 && (
          <div className="mt-3">
            <p className="text-sm text-gray-600">Trabajos encontrados:</p>
            <ul className="mt-2 space-y-2">
              {trabajos.map((t) => (
                <li
                  key={t.id_trabajo}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded"
                >
                  <div>
                    <div className="font-medium">
                      Trabajo {t.id_trabajo} — {new Date(t.fecha).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">Probador: {t.probador}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => seleccionarTrabajo(t)}
                      className="px-3 py-1 bg-green-600 text-white rounded"
                    >
                      Seleccionar
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTrabajo(t);
                        loadMateriales();
                        setShowModal(true);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
                      Nuevo consumo
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {selectedTrabajo && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Consumos para trabajo {selectedTrabajo.id_trabajo}</h3>
            <div>
              <button
                onClick={() => {
                  loadMateriales();
                  setShowModal(true);
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Añadir consumo
              </button>
            </div>
          </div>

          <ConsumoTable
            items={consumos}
            materialesMap={Object.fromEntries((materiales || []).map((m: any) => [m.id, m]))}
            trabajadorMap={trabajadorMap}
          />
        </div>
      )}

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Todos los consumos</h3>
        <ConsumoTable
          items={allConsumos}
          materialesMap={Object.fromEntries((materiales || []).map((m: any) => [m.id, m]))}
          trabajadorMap={trabajadorMap}
          onView={(item) => {
            setLoadingDetails(true);
            setDetailsConsumo(item);
            setLoadingDetails(false);
            setShowDetailsModal(true);
          }}
        />

        {allPagination.pages > 1 && (
          <div className="bg-white rounded-lg shadow p-4 mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700">Mostrar:</label>
              <select
                value={allPagination.limit}
                onChange={(e) => loadAllConsumos(1, Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              Página {allPagination.page} de {allPagination.pages} ({allPagination.total} total)
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  loadAllConsumos(Math.max(1, allPagination.page - 1), allPagination.limit)
                }
                disabled={allPagination.page === 1}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() =>
                  loadAllConsumos(
                    Math.min(allPagination.pages, allPagination.page + 1),
                    allPagination.limit,
                  )
                }
                disabled={allPagination.page === allPagination.pages}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      <ConsumoModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleCreateConsumo}
        trabajoId={selectedTrabajo?.id_trabajo ?? null}
        materiales={materiales}
      />

      <ConsumoDetailsModal
        show={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setDetailsConsumo(null);
        }}
        consumo={detailsConsumo}
        materialesMap={Object.fromEntries((materiales || []).map((m: any) => [m.id, m]))}
        trabajadorMap={trabajadorMap}
        loading={loadingDetails}
      />
    </div>
  );
}
