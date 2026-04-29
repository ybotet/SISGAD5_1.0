import React, { useEffect, useState } from "react";
import { quejaService } from "../../services/quejaService";
import DashboardCards from "../../components/queja/DashboardCards";
import DashboardCharts from "../../components/queja/DashboardCharts";

export default function DashboardQuejaPage() {
  const [summary, setSummary] = useState<any | null>(null);
  const [sankey, setSankey] = useState<any>({ nodes: [], links: [] });
  const [funnel, setFunnel] = useState<any>({ stages: [] });
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [historic, setHistoric] = useState<any>({ counts: [], moving: [], projection: [] });
  const [mttr, setMttr] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const s = await quejaService.getDashboardSummary();
        setSummary(s);
        const sk = await quejaService.getSankey();
        setSankey(sk);
        const fu = await quejaService.getFunnel();
        setFunnel(fu);
        const hm = await quejaService.getHeatmap();
        setHeatmap(hm);
        const hi = await quejaService.getHistoric(90);
        setHistoric(hi);
        const mt = await quejaService.getMttr("tipo_falla");
        setMttr(mt);
      } catch (e) {
        console.error("Error cargando dashboard de quejas", e);
      }
    })();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Dashboard - Quejas</h1>
      {summary && <DashboardCards data={summary} />}

      <DashboardCharts
        sankey={sankey}
        funnel={funnel}
        historic={historic}
        mttr={mttr}
        mttrMeta={6}
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
