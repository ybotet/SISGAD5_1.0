// frontend/src/components/stats/LineaModuleStats.tsx
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
import { lineaService } from "../../services/lineaService";

type KpiColor = "blue" | "green" | "orange" | "purple" | "red" | "teal";

interface LineaModuleStatsProps {
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

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function LineaModuleStats({
  fechaDesde,
  fechaHasta,
  periodo: _periodo,
}: LineaModuleStatsProps) {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  // Estado para filtros independientes
  const [statusFilter, setStatusFilter] = useState<"hoy" | "semana">("hoy");
  const [trendsPeriod, setTrendsPeriod] = useState<"mes" | "trimestre" | "año">("mes");

  // Cargar datos
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const resp = await lineaService.getDashboard(fechaDesde, fechaHasta);
        const d = (resp && (resp.data !== undefined ? resp.data : resp)) || {};
        setDashboard(d);
      } catch (err) {
        console.error("Error cargando líneas", err);
        setError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    })();
  }, [fechaDesde, fechaHasta, statusFilter, trendsPeriod]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando estadísticas...</span>
      </div>
    );
  }

  // Datos desde el dashboard
  const totalLineas = dashboard?.total || 0;
  const activas = dashboard?.activas || 0;
  const bajas = totalLineas - activas;
  const tasaActividad = totalLineas > 0 ? (activas / totalLineas) * 100 : 0;

  // Datos de quejas por estado
  const quejasPendientes = dashboard?.quejasPendientes || 0;
  const quejasAsignadas = dashboard?.quejasAsignadas || 0;
  const quejasProbadas = dashboard?.quejasProbadas || 0;
  const quejasResueltas = dashboard?.quejasResueltas || 0;
  const totalQuejas = quejasPendientes + quejasAsignadas + quejasProbadas + quejasResueltas;

  // Datos para gráficos estáticos
  const byPropietarioData = (dashboard?.byProp || []).map((p: any) => ({
    name: p.name || "Sin propietario",
    value: Number(p.value || 0),
  }));

  const byTipoData = (dashboard?.byTipolinea || []).map((t: any) => ({
    name: t.name || "Sin tipo",
    value: Number(t.value || 0),
  }));

  const bySenalData = (dashboard?.bySenal || []).map((s: any) => ({
    name: s.name || "Sin señalización",
    value: Number(s.value || 0),
  }));

  const estadoPieData = [
    { name: "Activas", value: activas },
    { name: "Inactivas", value: bajas },
  ];

  // Datos de tendencias (según el selector de período)
  let trendData: { name: string; cantidad: number }[] = [];
  let trendTitle = "";

  if (trendsPeriod === "mes") {
    trendData = (dashboard?.byMonth || []).map((m: any) => ({
      name: m.month,
      cantidad: Number(m.cantidad || 0),
    }));
    trendTitle = "Líneas creadas por mes (año actual)";
  } else if (trendsPeriod === "trimestre") {
    trendData = (dashboard?.byQuarter || []).map((q: any) => ({
      name: q.quarter,
      cantidad: Number(q.cantidad || 0),
    }));
    trendTitle = "Líneas creadas por trimestre";
  } else {
    trendData = (dashboard?.byYear || []).map((y: any) => ({
      name: y.year.toString(),
      cantidad: Number(y.cantidad || 0),
    }));
    trendTitle = "Líneas creadas por año";
  }

  const topQuejasData = (dashboard?.topLineasQuejas || []).map((t: any) => ({
    name: t.name,
    value: Number(t.value || 0),
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
            📊 Inventario de Líneas
          </h2>
          <p className="text-sm text-gray-500">Distribución total del catálogo de líneas</p>
        </div>

        {/* Fila de KPIs estáticos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KPICard title="Total Líneas" value={totalLineas} color="blue" size="small" />
          <KPICard
            title="Activas"
            value={activas}
            subtitle={`${tasaActividad.toFixed(1)}%`}
            color="green"
            size="small"
          />
          <KPICard title="Inactivas / Bajas" value={bajas} color="red" size="small" />
          <KPICard title="Tipos distintos" value={byTipoData.length} color="teal" size="small" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tarjeta 1: Por Tipo */}
          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">Por Tipo</h3>
            {byTipoData.length > 0 ? (
              <HorizontalBarChart data={byTipoData} title="" color="blue" />
            ) : (
              <div className="text-center text-gray-400 py-8">No hay datos</div>
            )}
          </div>

          {/* Tarjeta 2: Por Propietario */}
          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">Por Propietario</h3>
            {byPropietarioData.length > 0 ? (
              <HorizontalBarChart data={byPropietarioData} title="" color="blue" />
            ) : (
              <div className="text-center text-gray-400 py-8">No hay datos</div>
            )}
          </div>

          {/* Tarjeta 3: Por Señalización */}
          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">Por Señalización</h3>
            {bySenalData.length > 0 ? (
              <HorizontalBarChart data={bySenalData} title="" color="blue" />
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
              📋 Estado de Quejas de Líneas
            </h2>
            <p className="text-sm text-gray-500">Seguimiento de quejas por estado</p>
          </div>
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

        {/* Top líneas con más quejas */}
        {topQuejasData.length > 0 && (
          <div className="mt-4 bg-white rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Top líneas con más quejas</h3>
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
                  <Bar dataKey="cantidad" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Líneas" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-gray-400">
                No hay datos disponibles para el período seleccionado
              </div>
            )}
          </div>

          {/* Resumen del período seleccionado */}
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
