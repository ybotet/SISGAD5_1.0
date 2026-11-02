// frontend/src/pages/trabajos/TrabajoFichaPage.tsx
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  trabajoStatsService,
  type TrabajoDetalleStats,
} from "../../services/trabajoStatsService";
import type { ConsumoItem } from "../../services/consumoService";

type Ficha = TrabajoDetalleStats & { consumos: ConsumoItem[] };

/**
 * Ficha individual de un trabajo (TASK-710-08 — variante E).
 * Solo lectura: muestra estadísticas del trabajo, trabajadores asignados
 * y los materiales/consumos registrados (backend-materiales).
 */
export default function TrabajoFichaPage() {
  const { id_trabajo } = useParams<{ id_trabajo: string }>();
  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const id = Number(id_trabajo);
    if (!Number.isInteger(id) || id <= 0) {
      setError("ID de trabajo inválido");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await trabajoStatsService.getTrabajoDetalle(id);
      setFicha(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al cargar la ficha del trabajo";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id_trabajo]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  if (loading) {
    return <div className="p-6 text-gray-500">Cargando ficha del trabajo…</div>;
  }

  if (error || !ficha) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error ?? "Trabajo no encontrado"}
        </div>
        <Link to="/sistema/stats" className="mt-4 inline-block text-blue-600 hover:underline">
          ← Volver a Estadísticas
        </Link>
      </div>
    );
  }

  const totalUnidades = ficha.consumos.reduce(
    (acc, c) =>
      acc + (c.detalles ?? []).reduce((a, d) => a + Number(d.cantidad || 0), 0),
    0,
  );

  const totalCosto = ficha.consumos.reduce(
    (acc, c) =>
      acc +
      (c.detalles ?? []).reduce(
        (a, d) => a + Number(d.cantidad || 0) * Number(d.costo_unitario || 0),
        0,
      ),
    0,
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            🔧 Ficha del Trabajo #{ficha.id_trabajo}
          </h1>
          <p className="text-gray-600">
            {ficha.fecha ?? "Sin fecha"} · Estado: {ficha.estado_clave ?? ficha.estado ?? "—"}
          </p>
        </div>
        <Link to="/sistema/stats" className="text-blue-600 hover:underline text-sm mt-1 shrink-0">
          ← Volver a Estadísticas
        </Link>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg bg-white border p-4 shadow-sm">
          <div className="text-sm text-gray-500">Horas totales</div>
          <div className="text-2xl font-bold text-gray-900">{ficha.horas.toFixed(2)} h</div>
        </div>
        <div className="rounded-lg bg-white border p-4 shadow-sm">
          <div className="text-sm text-gray-500">Trabajadores</div>
          <div className="text-2xl font-bold text-gray-900">{ficha.trabajadores.length}</div>
        </div>
        <div className="rounded-lg bg-white border p-4 shadow-sm">
          <div className="text-sm text-gray-500">Unidades consumidas</div>
          <div className="text-2xl font-bold text-gray-900">{totalUnidades}</div>
        </div>
        <div className="rounded-lg bg-white border p-4 shadow-sm">
          <div className="text-sm text-gray-500">Coste estimado</div>
          <div className="text-2xl font-bold text-gray-900">${totalCosto.toFixed(2)}</div>
        </div>
      </div>

      {/* Queja asociada y probador */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg bg-white border p-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-2">⚠️ Queja asociada</h2>
          {ficha.queja ? (
            <div className="text-sm text-gray-600">
              <div>
                Reporte: <span className="font-medium">{ficha.queja.num_reporte}</span>
              </div>
              <div>
                ID queja: <span className="font-medium">{ficha.queja.id_queja}</span>
              </div>
              <div>
                Estado: <span className="font-medium">{ficha.queja.estado ?? "—"}</span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-400">Sin queja asociada</div>
          )}
        </div>
        <div className="rounded-lg bg-white border p-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-2">👤 Probador</h2>
          {ficha.probador ? (
            <div className="text-sm text-gray-600">
              <div>{ficha.probador.nombre}</div>
              <div className="text-gray-400">Clave: {ficha.probador.clave_trabajador}</div>
            </div>
          ) : (
            <div className="text-sm text-gray-400">Sin probador asignado</div>
          )}
        </div>
      </div>

      {/* Observaciones */}
      {ficha.observaciones && (
        <div className="rounded-lg bg-white border p-4 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-800 mb-2">📝 Observaciones</h2>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{ficha.observaciones}</p>
        </div>
      )}

      {/* Trabajadores asignados */}
      <div className="rounded-lg bg-white border shadow-sm mb-6 overflow-hidden">
        <h2 className="font-semibold text-gray-800 p-4 pb-2">👥 Trabajadores asignados</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2">Clave</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2 text-right">Horas asignadas</th>
            </tr>
          </thead>
          <tbody>
            {ficha.trabajadores.map((t) => (
              <tr key={t.id_trabajador} className="border-t">
                <td className="px-4 py-2">{t.clave_trabajador}</td>
                <td className="px-4 py-2">{t.nombre}</td>
                <td className="px-4 py-2 text-right">{t.horas_asignadas.toFixed(2)} h</td>
              </tr>
            ))}
            {ficha.trabajadores.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-4 text-center text-gray-400">
                  Sin trabajadores asignados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Materiales / consumos */}
      <div className="rounded-lg bg-white border shadow-sm overflow-hidden">
        <h2 className="font-semibold text-gray-800 p-4 pb-2">📦 Materiales utilizados</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2">Consumo #</th>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Material</th>
              <th className="px-4 py-2 text-right">Cantidad</th>
              <th className="px-4 py-2 text-right">Costo unit.</th>
              <th className="px-4 py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {ficha.consumos.flatMap((c) =>
              (c.detalles ?? []).map((d) => (
                <tr key={`${c.id}-${d.id}`} className="border-t">
                  <td className="px-4 py-2">{c.id}</td>
                  <td className="px-4 py-2">{c.fecha_consumo ?? "—"}</td>
                  <td className="px-4 py-2">Material #{d.id_material}</td>
                  <td className="px-4 py-2 text-right">{d.cantidad}</td>
                  <td className="px-4 py-2 text-right">${Number(d.costo_unitario).toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">
                    ${(Number(d.cantidad) * Number(d.costo_unitario)).toFixed(2)}
                  </td>
                </tr>
              )),
            )}
            {ficha.consumos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  Este trabajo no registra consumos de materiales
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
