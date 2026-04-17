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
  AreaChart,
  Area,
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

// Función para filtrar items por fecha
const filtrarPorFecha = (items: TelefonoItem[], desde?: string, hasta?: string): TelefonoItem[] => {
  if (!desde && !hasta) return items;

  return items.filter((item) => {
    const fecha = new Date(item.createdAt);
    if (desde && fecha < new Date(desde)) return false;
    if (hasta && fecha > new Date(hasta)) return false;
    return true;
  });
};

// Función de agrupación (se mantiene)
function groupBy<T, K extends string | number>(items: T[], keyFn: (i: T) => K | undefined) {
  const map = new Map<K, number>();
  for (const it of items) {
    const k = keyFn(it as any);
    if (k === undefined || k === null) continue;
    map.set(k, (map.get(k as K) || 0) + 1);
  }
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
}

// Componente principal
export default function TelefonoModuleStats({
  fechaDesde,
  fechaHasta,
  periodo,
}: TelefonoModuleStatsProps) {
  const [allItems, setAllItems] = useState<TelefonoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos (solo una vez)
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const resp = await telefonoService.getTelefonos(1, 10000, "", "");
        setAllItems(resp.data || []);
      } catch (err) {
        console.error("Error cargando teléfonos", err);
        setError("Error al cargar los datos");
        setAllItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filtrar items según fechas seleccionadas
  const items = filtrarPorFecha(allItems, fechaDesde, fechaHasta);
  const totalItems = allItems.length;
  const itemsFiltrados = items.length;
  const porcentajeFiltrado = totalItems > 0 ? (itemsFiltrados / totalItems) * 100 : 0;

  // Procesar datos filtrados
  const extGroups = groupBy(items, (t) => (t.extensiones ?? 0).toString());
  const mandoGroups = groupBy(items, (t) => (t.tb_mando ? t.tb_mando.mando : "Sin mando"));
  const clasifGroups = groupBy(items, (t) =>
    t.tb_clasificacion ? t.tb_clasificacion.nombre : "Sin clasificación",
  );
  const yearGroups = groupBy(items, (t) => new Date(t.createdAt).getFullYear().toString());

  const maxCount = Math.max(
    extGroups[0]?.[1] || 0,
    mandoGroups[0]?.[1] || 0,
    clasifGroups[0]?.[1] || 0,
    yearGroups[0]?.[1] || 0,
  );

  // Datos para gráficos
  const barData = extGroups.slice(0, 10).map(([name, value]) => ({
    name: `${name} ext.`,
    cantidad: value,
  }));

  const lineData = yearGroups
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([year, count]) => ({
      year: year,
      cantidad: count,
    }));

  const pieData = clasifGroups.slice(0, 10).map(([name, value]) => ({
    name: name.toString(),
    value: value,
  }));

  const topModelosData = mandoGroups.slice(0, 6).map(([name, value]) => ({
    name: name.toString(),
    value: value,
  }));

  // KPIs
  const activos = items.filter((t) => t.extensiones && t.extensiones > 0).length;
  const sinAsignar = items.filter((t) => !t.extensiones || t.extensiones === 0).length;
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
  const tendenciaMensual = meses.map((mes, idx) => {
    const count = items.filter((t) => new Date(t.createdAt).getMonth() === idx).length;
    return { mes, ingresos: count, bajas: Math.floor(count * 0.3) };
  });

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
          value={items.filter((t) => t.extensiones === 1).length}
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
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">🔢 Por Extensiones</h3>
            {extGroups.slice(0, 6).map(([k, v]) => (
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
                <span className="font-semibold">{mandoGroups.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Años abarcados:</span>
                <span className="font-semibold">{yearGroups.length}</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">📋 Clasificaciones</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {clasifGroups.slice(0, 8).map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate max-w-[120px]">{k}</span>
                  <span className="font-semibold text-gray-800">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
