// frontend/src/components/stats/TrabajoModuleStats.tsx
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { trabajadorService, type TrabajadorItem } from "../../services/trabajadorService";
import {
  trabajoStatsService,
  type TrabajoStatsTrabajador,
  type QuejaStatsResponse,
  type Pagination,
} from "../../services/trabajoStatsService";

interface Props {
  fechaDesde?: string;
  fechaHasta?: string;
  periodo?: string;
}

type Modo = "trabajadores" | "queja";

/**
 * Módulo de estadísticas de TRABAJOS (TASK-710-08 — variantes B y E).
 * - Pestaña "Por trabajador": ranking global de trabajadores con sus trabajos/horas.
 * - Pestaña "Por queja": resumen de trabajos de una queja concreta.
 * Cada fila enlaza a la ficha individual del trabajo (vista E).
 */
export default function TrabajoModuleStats({}: Props) {
  const [modo, setModo] = useState<Modo>("trabajadores");

  // --- Estado: vista por trabajadores ---
  const [rows, setRows] = useState<TrabajoStatsTrabajador[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("total_trabajos");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  // --- Estado: vista por queja ---
  const [quejaId, setQuejaId] = useState("");
  const [quejaStats, setQuejaStats] = useState<QuejaStatsResponse | null>(null);

  // --- Estado: filtro rápido por trabajador (client-side sobre la página actual) ---
  const [trabajadores, setTrabajadores] = useState<TrabajadorItem[]>([]);
  const [filtroTrabajador, setFiltroTrabajador] = useState<number | "">("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar combo de trabajadores para el filtro
  useEffect(() => {
    trabajadorService
      .getTrabajadores(1, 500)
      .then((res) => setTrabajadores(res.data ?? []))
      .catch(() => setTrabajadores([]));
  }, []);

  const cargarTrabajadores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await trabajoStatsService.getPorTrabajador({
        page,
        limit: 20,
        sortBy,
        sortOrder,
      });
      setRows(res.data);
      setPagination(res.pagination ?? null);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando estadísticas por trabajador");
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder]);

  useEffect(() => {
    if (modo === "trabajadores") cargarTrabajadores();
  }, [modo, cargarTrabajadores]);

  const cargarQueja = async () => {
    const id = parseInt(quejaId, 10);
    if (!Number.isInteger(id) || id <= 0) {
      setError("Introduce un ID de queja válido");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await trabajoStatsService.getPorQueja(id);
      setQuejaStats(data);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando estadísticas de la queja");
      setQuejaStats(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = (campo: string) => {
    if (sortBy === campo) {
      setSortOrder((o) => (o === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(campo);
      setSortOrder("DESC");
    }
    setPage(1);
  };

  const sortIndicator = (campo: string) =>
    sortBy === campo ? (sortOrder === "ASC" ? " ↑" : " ↓") : "";

  const filasFiltradas = filtroTrabajador
    ? rows.filter((r) => r.id_trabajador === filtroTrabajador)
    : rows;

  return (
    <div className="space-y-4">
      {/* Selector de modo */}
      <div className="flex gap-2">
        <button
          onClick={() => setModo("trabajadores")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            modo === "trabajadores"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          👷 Por trabajador
        </button>
        <button
          onClick={() => setModo("queja")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            modo === "queja"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          ⚠️ Por queja
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {modo === "trabajadores" && (
        <>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Filtrar trabajador:</label>
            <select
              value={filtroTrabajador}
              onChange={(e) =>
                setFiltroTrabajador(e.target.value ? Number(e.target.value) : "")
              }
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="">— Todos —</option>
              {trabajadores.map((t) => (
                <option key={t.id_trabajador} value={t.id_trabajador}>
                  {t.clave_trabajador} · {t.nombre}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="text-gray-500">Cargando…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {(
                      [
                        ["clave_trabajador", "Trabajador"],
                        ["total_trabajos", "Trabajos"],
                        ["horas_totales", "Horas totales"],
                        ["primera_fecha", "Primera fecha"],
                        ["ultima_fecha", "Última fecha"],
                      ] as const
                    ).map(([campo, etiqueta]) => (
                      <th
                        key={campo}
                        onClick={() => toggleSort(campo)}
                        className="px-4 py-2 text-left font-medium text-gray-700 cursor-pointer select-none hover:bg-gray-100"
                      >
                        {etiqueta}
                        {sortIndicator(campo)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filasFiltradas.map((r) => (
                    <tr key={r.id_trabajador} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <span className="font-medium">{r.clave_trabajador}</span>{" "}
                        <span className="text-gray-500">— {r.nombre}</span>
                      </td>
                      <td className="px-4 py-2">{r.total_trabajos}</td>
                      <td className="px-4 py-2">{r.horas_totales.toFixed(2)} h</td>
                      <td className="px-4 py-2">{r.primera_fecha ?? "—"}</td>
                      <td className="px-4 py-2">{r.ultima_fecha ?? "—"}</td>
                    </tr>
                  ))}
                  {filasFiltradas.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                        Sin datos de trabajos asignados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
                  <span>
                    Página {pagination.page} de {pagination.pages} ({pagination.total}{" "}
                    trabajadores)
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="px-3 py-1 border rounded disabled:opacity-40"
                    >
                      ← Anterior
                    </button>
                    <button
                      disabled={page >= pagination.pages}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-3 py-1 border rounded disabled:opacity-40"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {modo === "queja" && (
        <>
          <div className="flex items-end gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">ID de queja</label>
              <input
                value={quejaId}
                onChange={(e) => setQuejaId(e.target.value)}
                placeholder="p. ej. 123"
                className="border border-gray-300 rounded px-3 py-1 text-sm w-40"
                onKeyDown={(e) => e.key === "Enter" && cargarQueja()}
              />
            </div>
            <button
              onClick={cargarQueja}
              disabled={loading}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Cargando…" : "Ver estadísticas"}
            </button>
          </div>

          {quejaStats && (
            <div className="space-y-4">
              {/* Resumen */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <p className="text-xs text-gray-500">Queja</p>
                  <p className="text-lg font-semibold">
                    #{quejaStats.queja.num_reporte}
                  </p>
                  <p className="text-xs text-gray-400">{quejaStats.queja.estado}</p>
                </div>
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <p className="text-xs text-gray-500">Total trabajos</p>
                  <p className="text-lg font-semibold">
                    {quejaStats.resumen.total_trabajos}
                  </p>
                </div>
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <p className="text-xs text-gray-500">Horas totales</p>
                  <p className="text-lg font-semibold">
                    {quejaStats.resumen.horas_totales.toFixed(2)} h
                  </p>
                </div>
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <p className="text-xs text-gray-500">Rango</p>
                  <p className="text-sm font-medium">
                    {quejaStats.resumen.primera_fecha ?? "—"} →{" "}
                    {quejaStats.resumen.ultima_fecha ?? "—"}
                  </p>
                </div>
              </div>

              {/* Trabajos de la queja (enlace a ficha individual — vista E) */}
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Trabajos realizados</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">ID</th>
                        <th className="px-4 py-2 text-left">Fecha</th>
                        <th className="px-4 py-2 text-left">Estado</th>
                        <th className="px-4 py-2 text-left">Horas</th>
                        <th className="px-4 py-2 text-left">Trabajadores</th>
                        <th className="px-4 py-2 text-left">Observaciones</th>
                        <th className="px-4 py-2 text-left">Ficha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quejaStats.trabajos.map((t) => (
                        <tr key={t.id_trabajo} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-2">{t.id_trabajo}</td>
                          <td className="px-4 py-2">{t.fecha ?? "—"}</td>
                          <td className="px-4 py-2">{t.estado ?? "—"}</td>
                          <td className="px-4 py-2">{t.horas.toFixed(2)} h</td>
                          <td className="px-4 py-2">
                            {t.trabajadores.map((w) => w.clave_trabajador).join(", ") || "—"}
                          </td>
                          <td className="px-4 py-2 max-w-xs truncate" title={t.observaciones ?? ""}>
                            {t.observaciones ?? "—"}
                          </td>
                          <td className="px-4 py-2">
                            <Link
                              to={`/sistema/main/trabajos/${t.id_trabajo}`}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Ver ficha →
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {quejaStats.trabajos.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                            Esta queja no tiene trabajos registrados
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Desglose por trabajador dentro de la queja */}
              {quejaStats.por_trabajador.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">
                    Desglose por trabajador
                  </h3>
                  <ul className="text-sm space-y-1">
                    {quejaStats.por_trabajador.map((w) => (
                      <li key={w.id_trabajador} className="flex gap-4">
                        <span className="font-medium w-40">
                          {w.clave_trabajador} — {w.nombre}
                        </span>
                        <span className="text-gray-600">{w.total_trabajos} trabajo(s)</span>
                        <span className="text-gray-600">{w.horas_totales.toFixed(2)} h</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
