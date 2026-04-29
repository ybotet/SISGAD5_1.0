import { useEffect, useState } from "react";
import DashboardCards from "../../components/queja/DashboardCards";
import DashboardCharts from "../../components/queja/DashboardCharts";
import { quejaService } from "../../services/quejaService";

type Props = { fechaDesde?: string; fechaHasta?: string; periodo?: string };

export default function QuejaModuleStats({ fechaDesde, fechaHasta }: Props) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any | null>(null);
  const [sankey, setSankey] = useState<any>({ nodes: [], links: [] });
  const [funnel, setFunnel] = useState<any>({ stages: [] });
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [historic, setHistoric] = useState<any>({ counts: [], moving: [], projection: [] });
  const [mttr, setMttr] = useState<any[]>([]);
  const [closeBuckets, setCloseBuckets] = useState<any>(null);

  async function loadDashboard(params: { fecha_desde?: string; fecha_hasta?: string } = {}) {
    try {
      setLoading(true);
      const s = await quejaService.getDashboardSummary(params);
      console.debug("dashboardSummary", s);
      const sk = await quejaService.getSankey(params);
      console.debug("sankey", sk);
      setSankey(sk);

      const fu = await quejaService.getFunnel(params);
      console.debug("funnel", fu);
      setFunnel(fu);

      const hm = await quejaService.getHeatmap(params);
      console.debug("heatmap", hm);
      setHeatmap(hm);

      const hi = await quejaService.getHistoric(90, params);
      console.debug("historic", hi);
      setHistoric(hi);

      const mt = await quejaService.getMttr("tipo_falla", params);
      console.debug("mttr", mt);
      setMttr(mt);

      const cb = await quejaService.getCloseBuckets(30, params);
      console.debug("closeBuckets", cb);
      setCloseBuckets(cb);

      // Build a merged/fallback summary so the UI can show sensible numbers
      const mergedSummary = {
        total: Number(s?.total ?? 0),
        periodo: s?.periodo ?? {},
        telefonos: {
          count: Number(s?.telefonos?.count ?? 0),
          pct: Number(s?.telefonos?.pct ?? 0),
          prev: Number(s?.telefonos?.prev ?? 0),
        },
        lineas: {
          count: Number(s?.lineas?.count ?? 0),
          pct: Number(s?.lineas?.pct ?? 0),
          prev: Number(s?.lineas?.prev ?? 0),
        },
        pizarras: {
          count: Number(s?.pizarras?.count ?? 0),
          pct: Number(s?.pizarras?.pct ?? 0),
          prev: Number(s?.pizarras?.prev ?? 0),
        },
      };

      // If summary has zeros but funnel/heatmap contain data, use them as fallback
      if (mergedSummary.total === 0 && fu?.stages?.[0]?.count) {
        mergedSummary.total = Number(fu.stages[0].count || 0);
      }

      if ((mergedSummary.telefonos.count || 0) === 0 && Array.isArray(hm) && hm.length > 0) {
        mergedSummary.telefonos.count = hm.reduce((acc, r) => acc + Number(r.telefonos || 0), 0);
      }
      if ((mergedSummary.lineas.count || 0) === 0 && Array.isArray(hm) && hm.length > 0) {
        mergedSummary.lineas.count = hm.reduce((acc, r) => acc + Number(r.lineas || 0), 0);
      }
      if ((mergedSummary.pizarras.count || 0) === 0 && Array.isArray(hm) && hm.length > 0) {
        mergedSummary.pizarras.count = hm.reduce((acc, r) => acc + Number(r.pizarras || 0), 0);
      }

      console.debug("mergedSummary", mergedSummary);
      setSummary(mergedSummary);
    } catch (err) {
      console.error("Error cargando dashboard de quejas", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Load when component mounts or when parent date props change (uses global timer/controller)
    const params: any = {};
    if (fechaDesde) params.fecha_desde = fechaDesde;
    if (fechaHasta) params.fecha_hasta = fechaHasta;
    loadDashboard(params);
  }, [fechaDesde, fechaHasta]);

  if (loading) {
    return (
      <div className="p-4 bg-white rounded shadow text-center">
        Cargando estadísticas de quejas...
      </div>
    );
  }

  return (
    <div>
      {/* Date range controlled by parent `StatsPage` - this module uses those props */}
      {summary && <DashboardCards data={summary} />}
      <DashboardCharts
        sankey={sankey}
        funnel={funnel}
        historic={historic}
        mttr={mttr}
        mttrMeta={6}
        closeBuckets={closeBuckets}
      />

      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-2">Matriz Causa Raíz</h3>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th>Tipo</th>
                <th>Teléfonos</th>
                <th>Líneas</th>
                <th>Pizarras</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {heatmap.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2">{r.tipo}</td>
                  <td>{r.telefonos}</td>
                  <td>{r.lineas}</td>
                  <td>{r.pizarras}</td>
                  <td>{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
