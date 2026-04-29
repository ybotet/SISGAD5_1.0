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
import { trabajadorService } from "../../services/trabajadorService";
import type { TrabajadorItem } from "../../services/trabajadorService";

type Periodo = string;

interface StatsProps {
  fechaDesde?: string;
  fechaHasta?: string;
  periodo?: Periodo;
}

// grouping moved to backend; client-side helper removed

const PIE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658"];

export default function TrabajadorModuleStats({ fechaDesde, fechaHasta }: StatsProps) {
  const [trabajadores, setTrabajadores] = useState<TrabajadorItem[]>([]);
  const [asignaciones, setAsignaciones] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // Use backend dashboard endpoint instead of loading full lists
        const resp = await trabajadorService.getDashboard(fechaDesde, fechaHasta);
        const d = (resp && (resp.data !== undefined ? resp.data : resp)) || {};
        setDashboard(d);
        setTrabajadores([]);
        setAsignaciones([]);
      } catch (e) {
        console.error("Error cargando stats de trabajadores", e);
        setTrabajadores([]);
        setAsignaciones([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [fechaDesde, fechaHasta]);

  if (loading) {
    return (
      <div className="p-4 bg-white rounded shadow text-center">
        Cargando estadísticas de trabajadores...
      </div>
    );
  }

  // Active vs inactive
  const activos = dashboard
    ? Number(dashboard.activos || 0)
    : trabajadores.filter((t) => t.activo !== false).length;
  const inactivos = dashboard
    ? Number(dashboard.inactivos || 0)
    : trabajadores.filter((t) => t.activo === false).length;
  const estadoPieData = [
    { name: "Activos", value: activos },
    { name: "Inactivos", value: inactivos },
  ];

  // Top trabajadores por asignaciones
  const topTrab: { name: string; cantidad: number }[] = (dashboard?.topTrabajadores || []).map(
    (t: any) => ({
      name: t.name,
      cantidad: Number(t.value || 0),
    }),
  );

  // Trabajadores creados por año
  const yearLineData = (dashboard?.byYear || []).map((y: any) => ({
    year: y.year,
    cantidad: Number(y.cantidad || 0),
  }));

  // Por grupo de trabajo
  const grupoPieData = (dashboard?.byGroup || []).map((g: any) => ({
    name: g.name || "Sin grupo",
    value: Number(g.value || 0),
  }));

  // KPI values
  const totalTrabajadores = dashboard ? Number(dashboard.total || 0) : trabajadores.length;
  const activosCount = activos;
  const inactivosCount = inactivos;
  const totalAsign = dashboard ? Number(dashboard.totalAsignaciones || 0) : asignaciones.length;

  const topTrabData = topTrab.map((t: { name: string; cantidad: number }) => ({
    name: t.name,
    value: t.cantidad,
  }));

  // Reuse small UI helpers from Materiales for consistent look
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
      <div
        className={`bg-gradient-to-r ${colorClasses[color]} rounded-xl shadow-lg p-4 text-white`}
      >
        <div className="text-sm opacity-90 mb-1">{title}</div>
        <div className="text-2xl font-bold">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        {subtitle && <div className="text-xs opacity-80 mt-1">{subtitle}</div>}
      </div>
    );
  }

  function HorizontalBarChart({
    data,
    title,
  }: {
    data: { name: string; value: number }[];
    title: string;
  }) {
    const max = Math.max(...data.map((d) => d.value), 1);
    return (
      <div>
        <h4 className="font-semibold text-gray-700 text-sm">{title}</h4>
        {data.slice(0, 6).map((item, idx) => (
          <div key={idx} className="py-1">
            <div className="flex justify-between text-sm mb-1">
              <div className="text-gray-700 truncate max-w-[120px]">{item.name}</div>
              <div className="text-gray-700 font-semibold">{item.value}</div>
            </div>
            <div className="w-full bg-gray-100 rounded h-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-3"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Trabajadores" value={totalTrabajadores} color="blue" />
        <KPICard title="Activos" value={activosCount} color="emerald" />
        <KPICard title="Inactivos" value={inactivosCount} color="orange" />
        <KPICard title="Asignaciones" value={totalAsign} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="font-semibold mb-3">Trabajadores creados por año</h4>
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={yearLineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cantidad" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="font-semibold mb-3">Top trabajadores por asignaciones</h4>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={topTrabData} margin={{ top: 5, right: 20, left: 20, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} angle={-35} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <HorizontalBarChart
              data={grupoPieData.map((g) => ({ name: g.name, value: g.value }))}
              title="Por grupo"
            />
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="font-semibold mb-3">Estado</h4>
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
                    <Cell key={`cell-est-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
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
