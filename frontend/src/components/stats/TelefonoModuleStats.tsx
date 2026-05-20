// frontend/src/components/stats/TelefonoModuleStats.tsx
import { useEffect, useState } from "react";
import {
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
  BarChart,
  Bar,
} from "recharts";
import { telefonoService } from "../../services/telefonoService";

type KpiColor = "blue" | "green" | "orange" | "purple" | "red" | "teal";

interface TelefonoModuleStatsProps {
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

function SimpleBar({
  label,
  value,
  max,
  color = "blue",
}: {
  label: string;
  value: number;
  max: number;
  color?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const barColor = color === "blue" ? "bg-blue-500" : "bg-orange-500";
  return (
    <div className="py-1">
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-gray-700 truncate max-w-[120px]">{label}</span>
        <span className="text-gray-700 font-semibold">{value}</span>
      </div>
      <div className="w-full bg-gray-100 rounded h-2 overflow-hidden">
        <div className={`${barColor} h-2 rounded-full`} style={{ width: `${pct}%` }} />
      </div>
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

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function TelefonoModuleStats({
  fechaDesde,
  fechaHasta,
  periodo,
}: TelefonoModuleStatsProps) {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  const [trendsPeriod, setTrendsPeriod] = useState<"mes" | "trimestre" | "año">("mes");

  // Cargar datos
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const resp = await telefonoService.getDashboard(fechaDesde, fechaHasta);
        const d = (resp && (resp.data !== undefined ? resp.data : resp)) || {};
        setDashboard(d);
      } catch (err) {
        console.error("Error cargando teléfonos", err);
        setError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    })();
  }, [fechaDesde, fechaHasta]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando estadísticas...</span>
      </div>
    );
  }

  // Datos desde el dashboard
  const totalTelefonos = dashboard?.total || 0;
  const activos = dashboard?.activos || 0;
  const bajas = totalTelefonos - activos;
  const tasaActividad = totalTelefonos > 0 ? (activos / totalTelefonos) * 100 : 0;

  // Datos de quejas por estado
  const quejasPendientes = dashboard?.quejasPendientes || 0;
  const quejasAsignadas = dashboard?.quejasAsignadas || 0;
  const quejasProbadas = dashboard?.quejasProbadas || 0;
  const quejasResueltas = dashboard?.quejasResueltas || 0;
  const totalQuejas = quejasPendientes + quejasAsignadas + quejasProbadas + quejasResueltas;

  // Datos para gráficos estáticos
  const topModelosData = (dashboard?.byMando || []).map((m: any) => ({
    name: m.name || "Sin mando",
    value: Number(m.value || 0),
  }));

  const pieData = (dashboard?.byClasif || []).map((c: any) => ({
    name: c.name || "Sin clasificación",
    value: Number(c.value || 0),
  }));

  const barData = (dashboard?.byExtensiones || []).map((e: any) => ({
    name: e.name,
    value: Number(e.value || 0),
  }));

  // Datos de tendencias (según el selector de período)
  let trendData: { name: string; cantidad: number }[] = [];
  let trendTitle = "";

  if (trendsPeriod === "mes") {
    trendData = (dashboard?.byMonth || []).map((m: any) => ({
      name: m.month,
      cantidad: Number(m.cantidad || 0),
    }));
    trendTitle = "Teléfonos creados por mes (año actual)";
  } else if (trendsPeriod === "trimestre") {
    trendData = (dashboard?.byQuarter || []).map((q: any) => ({
      name: q.quarter,
      cantidad: Number(q.cantidad || 0),
    }));
    trendTitle = "Teléfonos creados por trimestre";
  } else {
    trendData = (dashboard?.byYear || []).map((y: any) => ({
      name: y.year.toString(),
      cantidad: Number(y.cantidad || 0),
    }));
    trendTitle = "Teléfonos creados por año";
  }

  const topQuejasData = (dashboard?.byMasQuejas || []).map((t: any) => ({
    name: t.telefono,
    value: Number(t.cantidad || 0),
  }));

  const PIE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];
  const QUEJA_COLORS = ["#f59e0b", "#3b82f6", "#8b5cf6", "#10b981"];

  return (
    <div className="space-y-8">
      {/* ============================================================ */}
      {/* ZONA 1: MÉTRICAS ESTÁTICAS (sin filtro temporal) */}
      {/* ============================================================ */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
            📊 Inventario de Teléfonos
          </h2>
          <p className="text-sm text-gray-500">Distribución total del catálogo</p>
        </div>

        {/* Fila de KPIs estáticos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KPICard title="Total Teléfonos" value={totalTelefonos} color="blue" size="small" />
          <KPICard
            title="Activos"
            value={activos}
            subtitle={`${tasaActividad.toFixed(1)}%`}
            color="green"
            size="small"
          />
          <KPICard title="Bajas / Inactivos" value={bajas} color="red" size="small" />
          <KPICard
            title="Modelos distintos"
            value={topModelosData.length}
            color="teal"
            size="small"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tarjeta 1: Por Mando */}
          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">Por Mando</h3>
            {topModelosData.length > 0 ? (
              <HorizontalBarChart data={topModelosData} title="" color="blue" />
            ) : (
              <div className="text-center text-gray-400 py-8">No hay datos</div>
            )}
          </div>

          {/* Tarjeta 2: Por Clasificación */}
          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">Por Clasificación</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {pieData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-400 py-8">No hay datos</div>
            )}
          </div>

          {/* Tarjeta 3: Por Extensiones */}
          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">Por Extensiones</h3>
            {barData.length > 0 ? (
              barData
                .slice(0, 6)
                .map((item: any, idx: number) => (
                  <SimpleBar
                    key={idx}
                    label={item.name}
                    value={item.value}
                    max={Math.max(...barData.map((d: any) => d.value), 1)}
                  />
                ))
            ) : (
              <div className="text-center text-gray-400 py-8">No hay datos</div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* ZONA 2: ESTADO DE QUEJAS (filtro: Hoy / Esta semana) */}
      {/* ============================================================ */}
      <section className="bg-gray-50 rounded-xl p-5">
        <div className="mb-4 flex justify-between items-center flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-1 h-5 bg-orange-500 rounded-full"></span>
              📋 Estado de Quejas de Telefonos
            </h2>
            <p className="text-sm text-gray-500">Seguimiento de quejas por estado</p>
          </div>

          {/* Live view: no temporal filtro necesario */}
        </div>

        {/* Tarjetas de quejas por estado */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KPICard
            title="📝 Pendientes"
            value={quejasPendientes}
            subtitle={`${totalQuejas > 0 ? ((quejasPendientes / totalQuejas) * 100).toFixed(0) : 0}% del total`}
            color="orange"
            size="small"
          />
          <KPICard
            title="👤 Asignadas"
            value={quejasAsignadas}
            subtitle={`${totalQuejas > 0 ? ((quejasAsignadas / totalQuejas) * 100).toFixed(0) : 0}% del total`}
            color="blue"
            size="small"
          />
          <KPICard
            title="🔬 En Prueba"
            value={quejasProbadas}
            subtitle={`${totalQuejas > 0 ? ((quejasProbadas / totalQuejas) * 100).toFixed(0) : 0}% del total`}
            color="purple"
            size="small"
          />
          <KPICard
            title="✅ Resueltas"
            value={quejasResueltas}
            subtitle={`${totalQuejas > 0 ? ((quejasResueltas / totalQuejas) * 100).toFixed(0) : 0}% del total`}
            color="green"
            size="small"
          />
        </div>

        {/* Top teléfonos con más quejas */}
        {topQuejasData.length > 0 && (
          <div className="mt-4 bg-white rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Top teléfonos con más quejas</h3>
            <HorizontalBarChart data={topQuejasData} title="" color="orange" />
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* ZONA 3: TENDENCIAS (selector de período independiente) */}
      {/* ============================================================ */}
      <section>
        <div className="mb-4 flex justify-between items-center flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-1 h-5 bg-green-500 rounded-full"></span>
              📈 Evolución Histórica
            </h2>
            <p className="text-sm text-gray-500">Análisis de tendencias en el tiempo</p>
          </div>

          {/* Selector de período independiente */}
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
          {/* Gráfico de tendencia según período seleccionado */}
          <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">{trendTitle}</h3>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Teléfonos" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-gray-400">
                No hay datos disponibles para el período seleccionado
              </div>
            )}
          </div>

          {/* Resumen del período seleccionado en el selector global */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow p-5 border border-green-100">
            <h3 className="font-semibold text-gray-800 mb-2">Resumen del Período</h3>
            <p className="text-sm text-gray-500 mb-3">
              {trendsPeriod === "mes" && "Datos del año actual por mes"}
              {trendsPeriod === "trimestre" && "Datos por trimestre"}
              {trendsPeriod === "año" && "Datos por año"}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total registros:</span>
                <span className="font-semibold">
                  {trendData.reduce((sum, d) => sum + d.cantidad, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Promedio por período:</span>
                <span className="font-semibold">
                  {trendData.length > 0
                    ? (
                        trendData.reduce((sum, d) => sum + d.cantidad, 0) / trendData.length
                      ).toFixed(1)
                    : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Período con más registros:</span>
                <span className="font-semibold">
                  {trendData.length > 0
                    ? trendData.reduce(
                        (max, d) => (d.cantidad > max.cantidad ? d : max),
                        trendData[0],
                      ).name
                    : "N/A"}
                </span>
              </div>
              {fechaDesde && fechaHasta && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Filtro aplicado:</span>
                    <span className="font-semibold text-xs">
                      {fechaDesde} → {fechaHasta}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
