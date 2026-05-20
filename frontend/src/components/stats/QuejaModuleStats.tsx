// frontend/src/components/stats/QuejaModuleStats.tsx
import { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { quejaService } from "../../services/quejaService";

type KpiColor = "blue" | "green" | "orange" | "purple" | "red" | "teal";

interface QuejaModuleStatsProps {
  fechaDesde?: string;
  fechaHasta?: string;
  periodo?: string;
}

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

function KPICard({
  title,
  value,
  subtitle,
  trend,
  color = "blue",
  size = "normal",
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: number;
  color?: KpiColor;
  size?: "small" | "normal";
}) {
  const colorClasses: Record<KpiColor, string> = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
    purple: "from-purple-500 to-purple-600",
    red: "from-red-500 to-red-600",
    teal: "from-teal-500 to-teal-600",
  };

  const sizeClasses = size === "small" ? "p-3" : "p-4";
  const textSize = size === "small" ? "text-xl" : "text-2xl";

  return (
    <div
      className={`bg-gradient-to-r ${colorClasses[color]} rounded-xl shadow-lg ${sizeClasses} text-white`}
    >
      <div className="text-xs opacity-90 mb-1">{title}</div>
      <div className={`${textSize} font-bold`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {subtitle && <div className="text-xs opacity-80 mt-1">{subtitle}</div>}
      {trend !== undefined && trend !== 0 && (
        <div className="text-xs mt-2 flex items-center gap-1">
          <span>{trend >= 0 ? "↑" : "↓"}</span>
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
  );
}

function HorizontalBarChart({
  data,
  title,
  color = "blue",
}: {
  data: { name: string; value: number }[];
  title: string;
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-gray-700 text-sm">{title}</h4>
      {data.slice(0, 6).map((item, idx) => (
        <div key={idx}>
          <div className="flex justify-between text-xs text-gray-600 mb-0.5">
            <span className="truncate max-w-[100px]">{item.name}</span>
            <span>{item.value}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className={`bg-gradient-to-r ${color === "blue" ? "from-blue-400 to-blue-600" : "from-orange-400 to-orange-600"} h-2 rounded-full`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Componente Sankey simplificado (si no tienes la librería, lo mostramos como tabla)
function SankeyDiagram({ sankey }: { sankey: any }) {
  const [showTable, setShowTable] = useState(true); // Por defecto tabla hasta que tengamos la librería

  if (!sankey || !sankey.nodes || !sankey.links) {
    return <div className="text-center text-gray-400 py-8">No hay datos de flujo</div>;
  }

  // Crear mapa de nombres por ID
  const nodeNames: Record<number, string> = {};
  sankey.nodes.forEach((node: any) => {
    nodeNames[node.id] = node.name;
  });

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          onClick={() => setShowTable(!showTable)}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          {showTable ? "Mostrar como diagrama" : "Mostrar como tabla"}
        </button>
      </div>

      {showTable ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="py-2">Origen</th>
                <th className="py-2">Destino</th>
                <th className="py-2 text-right">Cantidad</th>
                <th className="py-2 text-right">% del total</th>
              </tr>
            </thead>
            <tbody>
              {sankey.links.map((link: any, idx: number) => {
                const total = sankey.links.reduce((sum: number, l: any) => sum + l.value, 0);
                const percent = total > 0 ? ((link.value / total) * 100).toFixed(1) : 0;
                return (
                  <tr key={idx} className="border-t">
                    <td className="py-2">{nodeNames[link.source] || link.source}</td>
                    <td className="py-2">→ {nodeNames[link.target] || link.target}</td>
                    <td className="py-2 text-right font-semibold">{link.value}</td>
                    <td className="py-2 text-right text-gray-500">{percent}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <p className="text-gray-500 text-sm">
            Para el diagrama Sankey interactivo, instala:{" "}
            <code className="bg-gray-200 px-1 rounded">npm install recharts</code>
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Recharts no incluye Sankey nativo. Puedes usar <strong>react-sankey</strong> o{" "}
            <strong>d3-sankey</strong>
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function QuejaModuleStats({
  fechaDesde,
  fechaHasta,
  periodo: _periodo,
}: QuejaModuleStatsProps) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>({
    total: 0,
    telefonos: { count: 0, pct: 0 },
    lineas: { count: 0, pct: 0 },
    pizarras: { count: 0, pct: 0 },
  });
  const [sankey, setSankey] = useState<any>({ nodes: [], links: [] });
  const [funnel, setFunnel] = useState<any>({ stages: [] });
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [historic, setHistoric] = useState<any>({ counts: [], moving: [], projection: [] });
  const [mttr, setMttr] = useState<any[]>([]);
  const [closeBuckets, setCloseBuckets] = useState<any>(null);

  // Estados para filtros independientes
  const [statusFilter, setStatusFilter] = useState<"hoy" | "semana">("hoy");
  const [trendsPeriod, setTrendsPeriod] = useState<"mes" | "trimestre" | "año">("mes");

  async function loadDashboard(params: { fecha_desde?: string; fecha_hasta?: string } = {}) {
    try {
      setLoading(true);
      // Summary KPIs should always be global (no date range) like in Telefono
      const s = await quejaService.getDashboardSummary();

      // For other endpoints (trends, sankey, heatmap, mttr, closeBuckets)
      // only pass date-range params when the component was explicitly given them.
      const hasRange = params && (params.fecha_desde || params.fecha_hasta);
      const sk = hasRange ? await quejaService.getSankey(params) : await quejaService.getSankey();
      const fu = hasRange ? await quejaService.getFunnel(params) : await quejaService.getFunnel();
      const hm = hasRange ? await quejaService.getHeatmap(params) : await quejaService.getHeatmap();
      const hi = hasRange
        ? await quejaService.getHistoric(90, params)
        : await quejaService.getHistoric(90);
      const mt = hasRange
        ? await quejaService.getMttr("tipo_falla", params)
        : await quejaService.getMttr("tipo_falla");
      const cb = hasRange
        ? await quejaService.getCloseBuckets(30, params)
        : await quejaService.getCloseBuckets(30);

      setSankey(sk);
      setFunnel(fu);
      setHeatmap(hm);
      setHistoric(hi);
      setMttr(mt);
      setCloseBuckets(cb);

      // Construir resumen
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

      // Fallback con datos de funnel si el summary no tiene datos
      if (mergedSummary.total === 0 && fu?.stages?.[0]?.count) {
        mergedSummary.total = Number(fu.stages[0].count || 0);
      }

      setSummary(mergedSummary);
    } catch (err) {
      console.error("Error cargando dashboard de quejas", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const params: any = {};
    if (fechaDesde) params.fecha_desde = fechaDesde;
    if (fechaHasta) params.fecha_hasta = fechaHasta;
    loadDashboard(params);
  }, [fechaDesde, fechaHasta, statusFilter, trendsPeriod]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando estadísticas de quejas...</span>
      </div>
    );
  }

  const totalQuejas = summary?.total || 0;
  const telefonosCount = summary?.telefonos?.count || 0;
  const lineasCount = summary?.lineas?.count || 0;
  const pizarrasCount = summary?.pizarras?.count || 0;

  const tipoDistribucion = [
    { name: "Teléfonos", value: telefonosCount, color: "#3b82f6" },
    { name: "Líneas", value: lineasCount, color: "#10b981" },
    { name: "Pizarras", value: pizarrasCount, color: "#f59e0b" },
  ];

  // Datos para gráfico de tendencias
  let trendData: { name: string; cantidad: number }[] = [];
  let trendTitle = "";

  if (trendsPeriod === "mes") {
    // El backend puede devolver 'month' o 'day'
    trendData = (historic?.counts || []).slice(-12).map((item: any) => ({
      name: item.month || item.day || "Sin fecha",
      cantidad: Number(item.count || item.cnt || 0),
    }));
    trendTitle = "Quejas por mes";
  } else if (trendsPeriod === "trimestre") {
    // Agrupar por trimestre
    const counts = historic?.counts || [];
    const quarterly: { name: string; cantidad: number }[] = [];
    for (let i = 0; i < counts.length; i += 3) {
      const quarterCount = counts
        .slice(i, i + 3)
        .reduce((sum: number, item: any) => sum + item.count, 0);
      if (quarterCount > 0) {
        quarterly.push({ name: `T${Math.floor(i / 3) + 1}`, cantidad: quarterCount });
      }
    }
    trendData = quarterly;
    trendTitle = "Quejas por trimestre";
  } else {
    trendData = (historic?.counts || []).map((item: any) => ({
      name: item.year?.toString() || item.month,
      cantidad: item.count,
    }));
    trendTitle = "Quejas por año";
  }

  // MTTR: el backend puede devolver 'name' o 'dimension' y 'avg_hours' o 'mttr_hours'
  const mttrData = (mttr || []).map((item: any) => ({
    name: item.name || item.dimension || "Sin datos",
    value: Number(item.avg_hours || item.mttr_hours || 0),
  }));

  // closeBuckets puede venir como { buckets: [...] } o directamente con le24, btw24_72, gt72
  let closeData: { name: string; value: number }[] = [];

  if (closeBuckets?.buckets && Array.isArray(closeBuckets.buckets)) {
    // Formato con buckets
    closeData = closeBuckets.buckets.map((bucket: any) => ({
      name: bucket.name || `${bucket.days_min}-${bucket.days_max} días`,
      value: Number(bucket.count || 0),
    }));
  } else if (
    closeBuckets &&
    (closeBuckets.le24 !== undefined || closeBuckets.total_closed !== undefined)
  ) {
    // Formato con le24, btw24_72, gt72
    const total =
      Number(closeBuckets.total_closed) ||
      Number(closeBuckets.le24) + Number(closeBuckets.btw24_72) + Number(closeBuckets.gt72);
    closeData = [
      { name: "≤ 24h", value: Number(closeBuckets.le24 || 0) },
      { name: "24h - 72h", value: Number(closeBuckets.btw24_72 || 0) },
      { name: "> 72h", value: Number(closeBuckets.gt72 || 0) },
    ];
  }

  const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="space-y-8">
      {/* ============================================================ */}
      {/* ZONA 1: MÉTRICAS GENERALES */}
      {/* ============================================================ */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
            📊 Resumen General de Quejas
          </h2>
          <p className="text-sm text-gray-500">
            Estadísticas globales (las tarjetas muestran totales globales)
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KPICard title="Total Quejas" value={totalQuejas} color="blue" size="small" />
          <KPICard
            title="Teléfonos"
            value={telefonosCount}
            subtitle={`${summary?.telefonos?.pct || 0}% del total`}
            color="teal"
            size="small"
          />
          <KPICard
            title="Líneas"
            value={lineasCount}
            subtitle={`${summary?.lineas?.pct || 0}% del total`}
            color="green"
            size="small"
          />
          <KPICard
            title="Pizarras"
            value={pizarrasCount}
            subtitle={`${summary?.pizarras?.pct || 0}% del total`}
            color="orange"
            size="small"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de distribución por tipo */}
          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">Distribución por Tipo de Equipo</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={tipoDistribucion}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {tipoDistribucion.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* MTTR por tipo de falla */}
          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">MTTR por Tipo de Falla (horas)</h3>
            {mttrData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={mttrData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => `${value} horas`} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-400 py-8">No hay datos de MTTR</div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* ZONA 2: FUNNEL Y SANKEY (Flujo de estados) */}
      {/* ============================================================ */}
      <section className="bg-gray-50 rounded-xl p-5">
        <div className="mb-4 flex justify-between items-center flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-1 h-5 bg-purple-500 rounded-full"></span>
              🔄 Flujo de Estados de Quejas
            </h2>
            <p className="text-sm text-gray-500">Seguimiento del ciclo de vida de las quejas</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funnel (embudo) */}
          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">Embudo de Estados</h3>
            {funnel?.stages?.length > 0 ? (
              <div className="space-y-3">
                {funnel.stages.map((stage: any, idx: number) => {
                  const maxValue = Math.max(...funnel.stages.map((s: any) => s.count), 1);
                  const widthPercent = (stage.count / maxValue) * 100;
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{stage.name}</span>
                        <span className="text-gray-500">{stage.count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">No hay datos de embudo</div>
            )}
          </div>

          {/* Sankey (diagrama de flujo) */}
          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">Diagrama de Flujo (Sankey)</h3>
            <SankeyDiagram sankey={sankey} />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* ZONA 3: TENDENCIAS (selector de período independiente) */}
      {/* ============================================================ */}
      <section>
        <div className="mb-4 flex justify-between items-center flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-1 h-5 bg-green-500 rounded-full"></span>
              📈 Evolución Histórica de Quejas
            </h2>
            <p className="text-sm text-gray-500">Análisis de tendencias en el tiempo</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setTrendsPeriod("mes")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                trendsPeriod === "mes"
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              Por Mes
            </button>
            <button
              onClick={() => setTrendsPeriod("trimestre")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                trendsPeriod === "trimestre"
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              Por Trimestre
            </button>
            <button
              onClick={() => setTrendsPeriod("año")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                trendsPeriod === "año"
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              Por Año
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de tendencia */}
          <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">{trendTitle}</h3>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="cantidad" stroke="#3b82f6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-gray-400">
                No hay datos disponibles
              </div>
            )}
          </div>

          {/* Distribución de tiempo de cierre */}
          <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Tiempo de Cierre</h3>
            {closeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={closeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-15}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-gray-400">
                No hay datos de cierre
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* ZONA 4: MATRIZ CAUSA RAÍZ */}
      {/* ============================================================ */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-1 h-5 bg-red-500 rounded-full"></span>
            🔍 Matriz Causa Raíz
          </h2>
          <p className="text-sm text-gray-500">Distribución de quejas por tipo de falla y equipo</p>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="px-4 py-3">Tipo / Causa</th>
                  <th className="px-4 py-3 text-right">Teléfonos</th>
                  <th className="px-4 py-3 text-right">Líneas</th>
                  <th className="px-4 py-3 text-right">Pizarras</th>
                  <th className="px-4 py-3 text-right font-bold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {heatmap.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-800">{row.tipo}</td>
                    <td className="px-4 py-2 text-right text-gray-600">{row.telefonos || 0}</td>
                    <td className="px-4 py-2 text-right text-gray-600">{row.lineas || 0}</td>
                    <td className="px-4 py-2 text-right text-gray-600">{row.pizarras || 0}</td>
                    <td className="px-4 py-2 text-right font-semibold text-gray-900">
                      {row.total || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
              {heatmap.length > 0 && (
                <tfoot className="bg-gray-50 border-t">
                  <tr>
                    <th className="px-4 py-2 text-left">Total</th>
                    <th className="px-4 py-2 text-right">
                      {heatmap.reduce((sum, r) => sum + (Number(r.telefonos) || 0), 0)}
                    </th>
                    <th className="px-4 py-2 text-right">
                      {heatmap.reduce((sum, r) => sum + (r.lineas || 0), 0)}
                    </th>
                    <th className="px-4 py-2 text-right">
                      {heatmap.reduce((sum, r) => sum + (r.pizarras || 0), 0)}
                    </th>
                    <th className="px-4 py-2 text-right">
                      {heatmap.reduce((sum, r) => sum + (r.total || 0), 0)}
                    </th>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
