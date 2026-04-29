import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { LineaItem } from "../../services/lineaService";
import { lineaService } from "../../services/lineaService";
// quejaService/types not needed for dashboard-only rendering

interface StatsProps {
  fechaDesde?: string;
  fechaHasta?: string;
  periodo?: string;
}

// helper grouping is intentionally omitted here (not used)

const PIE_COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c7c",
  "#8dd1e1",
  "#d084d0",
];

// --- Reuse small UI helpers from MaterialesModuleStats for consistent look
type KpiColor = "blue" | "green" | "orange" | "purple" | "emerald" | "red";
function KPICard({
  title,
  value,
  subtitle,
  trend,
  color = "blue",
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: number;
  color?: KpiColor;
}) {
  const colorClasses: Record<KpiColor, string> = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
    purple: "from-purple-500 to-purple-600",
    emerald: "from-emerald-500 to-emerald-600",
    red: "from-red-500 to-red-600",
  };

  return (
    <div className={`bg-gradient-to-r ${colorClasses[color]} rounded-xl shadow-lg p-4 text-white`}>
      <div className="text-sm opacity-90 mb-1">{title}</div>
      <div className="text-2xl font-bold">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {subtitle && <div className="text-xs opacity-80 mt-1">{subtitle}</div>}
      {trend !== undefined && (
        <div className="text-xs mt-2 flex items-center gap-1">
          <span>{trend >= 0 ? "↑" : "↓"}</span>
          <span>{Math.abs(trend)}% vs período anterior</span>
        </div>
      )}
    </div>
  );
}

function HorizontalBarChart({
  data,
  title,
  color = "emerald",
}: {
  data: { name: string; value: number }[];
  title: string;
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const barColor =
    color === "emerald" ? "from-emerald-400 to-emerald-600" : "from-blue-400 to-blue-600";
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
              className={`bg-gradient-to-r ${barColor} h-2 rounded-full`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// date filtering done server-side; client filter removed

export default function LineaModuleStats({ fechaDesde, fechaHasta }: StatsProps) {
  const [lineas, setLineas] = useState<LineaItem[]>([]);
  const [dashboardState, setDashboardState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // Prefer backend aggregated endpoint for dashboard to avoid loading full lists
        const resp = await lineaService.getDashboard(fechaDesde, fechaHasta);
        const d = (resp && (resp.data !== undefined ? resp.data : resp)) || {};

        // Construct minimal arrays for charts when possible
        const fetchedLineas: LineaItem[] = []; // keep empty — we render from aggregates

        // Map server aggregates into local structures used by the UI
        // byProp -> propBarData
        // topLineasQuejas -> topQuejas
        // bySenal -> senalBarData
        // byYear -> yearLineData

        // Temporarily store aggregates in state via setLineas placeholder
        setLineas(fetchedLineas);
        // Save aggregates in React state (migrated from window global)
        setDashboardState(d);
      } catch (err) {
        console.error("Error cargando líneas/quejas para stats", err);
        setLineas([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [fechaDesde, fechaHasta]);

  if (loading) {
    return (
      <div className="p-4 bg-white rounded shadow text-center">
        Cargando estadísticas de líneas...
      </div>
    );
  }

  // Línea por tipo (pie)
  const dashboard = dashboardState || null;
  // tipoPieData not used for dashboard aggregated view

  // Línea por propietario (barra horizontal)
  const propBarData: { name: string; cantidad: number }[] = (dashboard?.byProp || []).map(
    (p: any) => ({
      name: p.name || "Sin propietario",
      cantidad: Number(p.value || 0),
    }),
  );

  // Líneas creadas por año (línea)
  const yearLineData: { year: string | number; cantidad: number }[] = (dashboard?.byYear || []).map(
    (y: any) => ({
      year: y.year,
      cantidad: Number(y.cantidad || 0),
    }),
  );

  // Líneas por señalización (barra horizontal)
  const senalBarData: { name: string; cantidad: number }[] = (dashboard?.bySenal || []).map(
    (s: any) => ({
      name: s.name || "Sin señalización",
      cantidad: Number(s.value || 0),
    }),
  );

  // Líneas por estado (pie: activas / inactivas)
  const activas = dashboard
    ? Number(dashboard.activas || 0)
    : lineas.filter((l) => !l.esbaja).length;
  const inactivas = dashboard
    ? Number(dashboard.inactivas || 0)
    : lineas.filter((l) => l.esbaja).length;
  const estadoPieData = [
    { name: "Activas", value: activas },
    { name: "Inactivas", value: inactivas },
  ];

  // Top 10 líneas con más quejas (barras verticales)
  const topLineasQuejas: { name: string; cantidad: number }[] = (
    dashboard?.topLineasQuejas || []
  ).map((t: any) => ({
    name: t.name,
    cantidad: Number(t.value || 0),
  }));
  // Build KPI values
  const totalLineas = dashboard ? Number(dashboard.total || 0) : lineas.length;
  const totalActivas = activas;
  const totalInactivas = inactivas;
  const totalQuejas = (dashboard?.topLineasQuejas || []).reduce(
    (s: number, t: any) => s + Number(t.value || 0),
    0,
  );

  // Prepare horizontal charts data
  const topProp = propBarData.map((d: { name: string; cantidad: number }) => ({
    name: d.name,
    value: d.cantidad,
  }));
  const topSeñal = senalBarData.map((d: { name: string; cantidad: number }) => ({
    name: d.name,
    value: d.cantidad,
  }));
  const topQuejas = topLineasQuejas.map((d: { name: string; cantidad: number }) => ({
    name: d.name,
    value: d.cantidad,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Líneas totales" value={totalLineas} color="blue" />
        <KPICard title="Activas" value={totalActivas} color="emerald" />
        <KPICard title="Inactivas" value={totalInactivas} color="orange" />
        <KPICard title="Quejas (periodo)" value={totalQuejas} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="font-semibold mb-3">Histórico: Líneas creadas por año</h4>
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={yearLineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cantidad" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="font-semibold mb-3">Top 10 líneas con más quejas</h4>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={topQuejas} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <HorizontalBarChart data={topProp} title="Por propietario" />
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <HorizontalBarChart data={topSeñal} title="Por señalización" color="blue" />
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="font-semibold text-gray-700 text-sm">Estado</h4>
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={estadoPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                    label
                  />
                  {estadoPieData.map((_, index) => (
                    <Cell
                      key={`cell-estado-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
