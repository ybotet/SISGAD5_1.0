import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { TelefonoItem } from "../../services/telefonoService";
import { telefonoService } from "../../services/telefonoService";

type KpiColor = "blue" | "green" | "orange" | "purple";

interface TelefonoModuleStatsProps {
  fechaDesde?: string;
  fechaHasta?: string;
  periodo?: string;
}

// Componentes auxiliares (KPICard, SimpleBar, HorizontalBarChart se mantienen igual)
// ... (copiar los componentes auxiliares de la versión anterior)

function KPICard({
  title,
  value,
  subtitle,
  trend,
  color = "blue",
}: {
  title: string;
  value: number;
  subtitle?: string;
  trend?: number;
  color?: KpiColor;
}) {
  const colorClasses: Record<KpiColor, string> = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <div className={`bg-gradient-to-r ${colorClasses[color]} rounded-xl shadow-lg p-4 text-white`}>
      <div className="text-sm opacity-90 mb-1">{title}</div>
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
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

function SimpleBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="py-1">
      <div className="flex justify-between text-sm mb-1">
        <div className="text-gray-700">{label}</div>
        <div className="text-gray-700 font-semibold">{value}</div>
      </div>
      <div className="w-full bg-gray-100 rounded h-3 overflow-hidden">
        <div className="bg-blue-500 h-3" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function HorizontalBarChart({
  data,
  title,
  maxValue,
}: {
  data: { name: string; value: number }[];
  title: string;
  maxValue?: number;
}) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-gray-700 text-sm">{title}</h4>
      {data.slice(0, 8).map((item, idx) => (
        <div key={idx}>
          <div className="flex justify-between text-xs text-gray-600 mb-0.5">
            <span className="truncate max-w-[100px]">{item.name}</span>
            <span>{item.value}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Date filtering and grouping is handled server-side for dashboard endpoints

// Componente principal
export default function TelefonoModuleStats({
  fechaDesde,
  fechaHasta,
  periodo: _periodo,
}: TelefonoModuleStatsProps) {
  const [allItems, setAllItems] = useState<TelefonoItem[]>([]);
  const [dashboardState, setDashboardState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos (re-fetch when date range changes)
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const resp = await telefonoService.getDashboard(fechaDesde, fechaHasta);
        const d = (resp && (resp.data !== undefined ? resp.data : resp)) || {};
        // store aggregates in component state
        setDashboardState(d);
        setAllItems([]);
      } catch (err) {
        console.error("Error cargando teléfonos", err);
        setError("Error al cargar los datos");
        setAllItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [fechaDesde, fechaHasta]);

  // Use backend dashboard aggregates when available
  const dashboard = dashboardState || null;
  const totalItems = dashboard ? Number(dashboard.total || 0) : allItems.length;
  const itemsFiltrados = totalItems; // backend already applied date filters

  const topModelosData: { name: string; value: number }[] = (dashboard?.byMando || []).map(
    (m: any) => ({
      name: m.name || "Sin mando",
      value: Number(m.value || 0),
    }),
  );
  const pieData: { name: string; value: number }[] = (dashboard?.byClasif || []).map((c: any) => ({
    name: c.name || "Sin clasificación",
    value: Number(c.value || 0),
  }));
  const lineData: { year: string | number; cantidad: number }[] = (dashboard?.byYear || []).map(
    (y: any) => ({
      year: y.year,
      cantidad: Number(y.cantidad || 0),
    }),
  );
  const barData: { name: string; cantidad: number }[] = (dashboard?.byExtensiones || []).map(
    (e: any) => ({
      name: e.name,
      cantidad: Number(e.value || 0),
    }),
  );

  const maxCount = Math.max(...barData.map((b: { cantidad: number }) => b.cantidad), 1);
  const extGroups: [string, number][] = barData.map(
    (b: { name: string; cantidad: number }) => [b.name, b.cantidad] as [string, number],
  );

  const activos = dashboard
    ? Number(dashboard.activos || 0)
    : allItems.filter((t) => t.extensiones && t.extensiones > 0).length;
  const sinAsignar = dashboard
    ? Number(dashboard.inactivos || 0)
    : allItems.filter((t) => !t.extensiones || t.extensiones === 0).length;
  const tasaActividad = itemsFiltrados > 0 ? (activos / itemsFiltrados) * 100 : 0;

  // Tendencia mensual (solo con datos filtrados)
  const meses = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  const tendenciaMensual = meses.map((mes) => ({ mes, ingresos: 0, bajas: 0 }));

  const PIE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando estadísticas de teléfonos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Indicador del filtro aplicado */}
      {fechaDesde && fechaHasta && (
        <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
          📊 Mostrando datos del período: {fechaDesde} → {fechaHasta}
          {totalItems !== itemsFiltrados && (
            <span className="ml-2 text-blue-600">
              ({itemsFiltrados} de {totalItems} registros)
            </span>
          )}
        </div>
      )}

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-700 text-sm">
          {error}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total en período"
          value={itemsFiltrados}
          subtitle="Teléfonos"
          color="blue"
        />
        <KPICard
          title="Activos"
          value={activos}
          subtitle={`${tasaActividad.toFixed(1)}% del período`}
          trend={3.2}
          color="green"
        />
        <KPICard
          title="En Reparación"
          value={allItems.filter((t) => t.extensiones === 1).length}
          subtitle="Requieren atención"
          color="orange"
        />
        <KPICard title="Sin Asignar" value={sinAsignar} subtitle="Disponibles" color="purple" />
      </div>

      {/* Layout 3 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna izquierda */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">📟 Por Mando</h3>
            <HorizontalBarChart data={topModelosData} title="" maxValue={maxCount} />
          </div>
          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">🏷️ Por Clasificación</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">🔢 Por Extensiones</h3>
            {extGroups.slice(0, 6).map(([k, v]: [string, number]) => (
              <SimpleBar key={k} label={`${k} extensiones`} value={v} max={maxCount} />
            ))}
          </div>
        </div>

        {/* Columna central */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">📈 Tendencia por Año</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="cantidad" stroke="#3b82f6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">📅 Distribución por Mes</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={tendenciaMensual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="ingresos" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Teléfonos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow p-4 border border-blue-100">
            <h3 className="font-semibold text-gray-800 mb-2">📊 Resumen del Período</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Registros:</span>
                <span className="font-semibold">{itemsFiltrados}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tasa ocupación:</span>
                <span className="font-semibold">{tasaActividad.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Modelos distintos:</span>
                <span className="font-semibold">{topModelosData.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Años abarcados:</span>
                <span className="font-semibold">{lineData.length}</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">📋 Clasificaciones</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {(pieData || []).slice(0, 8).map((c) => (
                <div key={c.name} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate max-w-[120px]">{c.name}</span>
                  <span className="font-semibold text-gray-800">{c.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
