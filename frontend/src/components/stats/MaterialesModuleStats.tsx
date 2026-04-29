// frontend/src/components/stats/MaterialesModuleStats.tsx
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

// ============================================================
// TIPOS
// ============================================================
type KpiColor = "blue" | "green" | "orange" | "purple" | "emerald" | "red";

interface MaterialItem {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  unidad: string;
  precio: number;
  stock_actual?: number;
  stock_minimo?: number;
  createdAt: string;
  updatedAt: string;
}

interface MaterialesModuleStatsProps {
  fechaDesde?: string;
  fechaHasta?: string;
  periodo?: string;
}

// ============================================================
// DATOS DE PRUEBA (MOCK) - Reemplazar con llamada real a tu API
// ============================================================
const MOCK_MATERIALES: MaterialItem[] = [
  {
    id: 1,
    codigo: "RT-100",
    nombre: "Router X100",
    descripcion: "Router WiFi 6",
    categoria: "Router",
    unidad: "unidad",
    precio: 89.99,
    stock_actual: 45,
    stock_minimo: 10,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: 2,
    codigo: "RT-200",
    nombre: "Router X200",
    descripcion: "Router WiFi 6 Plus",
    categoria: "Router",
    unidad: "unidad",
    precio: 129.99,
    stock_actual: 32,
    stock_minimo: 8,
    createdAt: "2025-02-20T10:00:00Z",
    updatedAt: "2025-02-20T10:00:00Z",
  },
  {
    id: 3,
    codigo: "CBL-UTP",
    nombre: "Cable UTP Cat6",
    descripcion: "Cable de red 1m",
    categoria: "Cable",
    unidad: "metro",
    precio: 1.5,
    stock_actual: 450,
    stock_minimo: 100,
    createdAt: "2025-01-10T10:00:00Z",
    updatedAt: "2025-01-10T10:00:00Z",
  },
  {
    id: 4,
    codigo: "CON-RJ45",
    nombre: "Conector RJ45",
    descripcion: "Conector para cable UTP",
    categoria: "Conector",
    unidad: "unidad",
    precio: 0.35,
    stock_actual: 1200,
    stock_minimo: 200,
    createdAt: "2025-01-05T10:00:00Z",
    updatedAt: "2025-01-05T10:00:00Z",
  },
  {
    id: 5,
    codigo: "SW-8P",
    nombre: "Switch 8 puertos",
    descripcion: "Switch Gigabit",
    categoria: "Switch",
    unidad: "unidad",
    precio: 45.0,
    stock_actual: 23,
    stock_minimo: 5,
    createdAt: "2025-03-01T10:00:00Z",
    updatedAt: "2025-03-01T10:00:00Z",
  },
  {
    id: 6,
    codigo: "SW-16P",
    nombre: "Switch 16 puertos",
    descripcion: "Switch Gigabit",
    categoria: "Switch",
    unidad: "unidad",
    precio: 89.0,
    stock_actual: 12,
    stock_minimo: 3,
    createdAt: "2025-03-15T10:00:00Z",
    updatedAt: "2025-03-15T10:00:00Z",
  },
  {
    id: 7,
    codigo: "ONT-100",
    nombre: "ONT GPON",
    descripcion: "Terminal de red óptica",
    categoria: "ONT",
    unidad: "unidad",
    precio: 65.0,
    stock_actual: 34,
    stock_minimo: 10,
    createdAt: "2025-04-10T10:00:00Z",
    updatedAt: "2025-04-10T10:00:00Z",
  },
  {
    id: 8,
    codigo: "FB-12F",
    nombre: "Fibra óptica 12F",
    descripcion: "Cable de fibra 12 hilos",
    categoria: "Fibra",
    unidad: "metro",
    precio: 2.5,
    stock_actual: 800,
    stock_minimo: 200,
    createdAt: "2025-04-20T10:00:00Z",
    updatedAt: "2025-04-20T10:00:00Z",
  },
  {
    id: 9,
    codigo: "RT-50",
    nombre: "Router X50",
    descripcion: "Router básico",
    categoria: "Router",
    unidad: "unidad",
    precio: 49.99,
    stock_actual: 67,
    stock_minimo: 15,
    createdAt: "2025-05-05T10:00:00Z",
    updatedAt: "2025-05-05T10:00:00Z",
  },
  {
    id: 10,
    codigo: "PSU-12V",
    nombre: "Fuente poder 12V",
    descripcion: "Fuente de alimentación",
    categoria: "Accesorio",
    unidad: "unidad",
    precio: 18.5,
    stock_actual: 45,
    stock_minimo: 10,
    createdAt: "2025-05-20T10:00:00Z",
    updatedAt: "2025-05-20T10:00:00Z",
  },
  {
    id: 11,
    codigo: "ANT-5G",
    nombre: "Antena 5G",
    descripcion: "Antena externa",
    categoria: "Accesorio",
    unidad: "unidad",
    precio: 35.0,
    stock_actual: 28,
    stock_minimo: 5,
    createdAt: "2025-06-01T10:00:00Z",
    updatedAt: "2025-06-01T10:00:00Z",
  },
  {
    id: 12,
    codigo: "KIT-FIBRA",
    nombre: "Kit fibra óptica",
    descripcion: "Kit instalación fibra",
    categoria: "Kit",
    unidad: "unidad",
    precio: 120.0,
    stock_actual: 15,
    stock_minimo: 3,
    createdAt: "2025-06-15T10:00:00Z",
    updatedAt: "2025-06-15T10:00:00Z",
  },
];

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================
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

function SimpleBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="py-1">
      <div className="flex justify-between text-sm mb-1">
        <div className="text-gray-700 truncate max-w-[120px]">{label}</div>
        <div className="text-gray-700 font-semibold">{value}</div>
      </div>
      <div className="w-full bg-gray-100 rounded h-3 overflow-hidden">
        <div className="bg-emerald-500 h-3" style={{ width: `${pct}%` }} />
      </div>
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

// Función para filtrar por fecha
const filtrarPorFecha = (items: MaterialItem[], desde?: string, hasta?: string): MaterialItem[] => {
  if (!desde && !hasta) return items;

  return items.filter((item) => {
    const fecha = new Date(item.createdAt);
    if (desde && fecha < new Date(desde)) return false;
    if (hasta && fecha > new Date(hasta)) return false;
    return true;
  });
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function MaterialesModuleStats({
  fechaDesde,
  fechaHasta,
  periodo,
}: MaterialesModuleStatsProps) {
  const [items, setItems] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMock, setUseMock] = useState(true); // Cambiar a false cuando la API esté lista

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (useMock) {
          // Datos de prueba
          await new Promise((resolve) => setTimeout(resolve, 500)); // Simular latencia
          setItems(MOCK_MATERIALES);
        } else {
          // TODO: Reemplazar con llamada real a tu API de materiales en Go
          // const response = await fetch('/api/materiales?limit=1000');
          // const data = await response.json();
          // setItems(data);
          setItems(MOCK_MATERIALES); // Fallback a mock mientras tanto
        }
      } catch (err) {
        console.error("Error cargando materiales", err);
        setError("Error al cargar los datos");
        setItems(MOCK_MATERIALES);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [useMock]);

  // Filtrar por fecha
  const filteredItems = filtrarPorFecha(items, fechaDesde, fechaHasta);
  const totalItems = items.length;
  const itemsFiltrados = filteredItems.length;
  const porcentajeFiltrado = totalItems > 0 ? (itemsFiltrados / totalItems) * 100 : 0;

  // ============================================================
  // CÁLCULOS ESTADÍSTICOS
  // ============================================================

  // Valor total del inventario
  const valorTotal = filteredItems.reduce(
    (sum, item) => sum + item.precio * (item.stock_actual || 0),
    0,
  );

  // Materiales con stock crítico (por debajo del mínimo)
  const stockCritico = filteredItems.filter(
    (item) => (item.stock_actual || 0) <= (item.stock_minimo || 0),
  );
  const valorCritico = stockCritico.reduce(
    (sum, item) => sum + item.precio * (item.stock_actual || 0),
    0,
  );

  // Agrupación por categoría
  const porCategoria = new Map<string, { cantidad: number; valor: number; stock: number }>();
  filteredItems.forEach((item) => {
    const cat = item.categoria;
    const existente = porCategoria.get(cat) || { cantidad: 0, valor: 0, stock: 0 };
    existente.cantidad++;
    existente.valor += item.precio * (item.stock_actual || 0);
    existente.stock += item.stock_actual || 0;
    porCategoria.set(cat, existente);
  });

  const categoriaData = Array.from(porCategoria.entries())
    .map(([name, data]) => ({
      name,
      cantidad: data.cantidad,
      valor: data.valor,
      stock: data.stock,
    }))
    .sort((a, b) => b.valor - a.valor);

  // Materiales más costosos
  const masCostosos = [...filteredItems].sort((a, b) => b.precio - a.precio).slice(0, 8);

  // Top stock (materiales con más unidades)
  const topStock = [...filteredItems]
    .sort((a, b) => (b.stock_actual || 0) - (a.stock_actual || 0))
    .slice(0, 8)
    .map((item) => ({ name: item.nombre, value: item.stock_actual || 0 }));

  // Tendencia por mes (simulada - en producción vendría de la API)
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
  const tendenciaMensual = meses.map((mes, idx) => ({
    mes,
    ingresos: Math.floor(150 + Math.random() * 100) + idx * 5,
    valor: Math.floor(8000 + Math.random() * 3000) + idx * 200,
  }));

  // Distribución por unidad de medida
  const porUnidad = new Map<string, number>();
  filteredItems.forEach((item) => {
    const unidad = item.unidad;
    porUnidad.set(unidad, (porUnidad.get(unidad) || 0) + (item.stock_actual || 0));
  });
  const unidadData = Array.from(porUnidad.entries()).map(([name, value]) => ({ name, value }));

  // Alertas de stock bajo (top 5)
  const alertasStock = [...filteredItems]
    .filter((item) => (item.stock_actual || 0) <= (item.stock_minimo || 0))
    .sort(
      (a, b) =>
        (a.stock_actual || 0) -
        (a.stock_minimo || 0) -
        ((b.stock_actual || 0) - (b.stock_minimo || 0)),
    )
    .slice(0, 5);

  const PIE_COLORS = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec489a",
    "#06b6d4",
    "#84cc16",
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <span className="ml-3 text-gray-600">Cargando estadísticas de materiales...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Indicador de filtro */}
      {fechaDesde && fechaHasta && (
        <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded-lg flex justify-between items-center">
          <span>
            📊 Mostrando datos del período: {fechaDesde} → {fechaHasta}
            {totalItems !== itemsFiltrados && (
              <span className="ml-2 text-emerald-600">
                ({itemsFiltrados} de {totalItems} registros)
              </span>
            )}
          </span>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={useMock}
              onChange={(e) => setUseMock(e.target.checked)}
              className="rounded"
            />
            Usar datos de prueba
          </label>
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
          title="Valor Inventario"
          value={`$${valorTotal.toLocaleString()}`}
          subtitle="Total en período"
          color="purple"
        />
        <KPICard
          title="Stock Crítico"
          value={stockCritico.length}
          subtitle="Materiales bajo mínimo"
          color="orange"
        />
        <KPICard
          title="Valor Crítico"
          value={`$${valorCritico.toLocaleString()}`}
          subtitle="En materiales críticos"
          color="green"
        />
        <KPICard
          title="Categorías"
          value={categoriaData.length}
          subtitle="Tipos distintos"
          color="blue"
        />
      </div>

      {/* Layout 3 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUMNA IZQUIERDA */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top stock */}
          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Mayor Stock
            </h3>
            <HorizontalBarChart data={topStock} title="" color="emerald" />
          </div>

          {/* Distribución por categoría (donut) */}
          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Por Categoría
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoriaData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="valor"
                  nameKey="name"
                >
                  {categoriaData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-2 mt-2 text-xs">
              {categoriaData.slice(0, 4).map((entry, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[idx] }}
                  />
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Unidades de medida */}
          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Por Unidad
            </h3>
            {unidadData.slice(0, 5).map((item, idx) => (
              <SimpleBar
                key={idx}
                label={item.name}
                value={item.value}
                max={Math.max(...unidadData.map((d) => d.value))}
              />
            ))}
          </div>
        </div>

        {/* COLUMNA CENTRAL */}
        <div className="lg:col-span-6 space-y-6">
          {/* Tendencia mensual */}
          <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Tendencia de Valor
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={tendenciaMensual}>
                <defs>
                  <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke="#10b981"
                  fill="url(#colorValor)"
                  strokeWidth={2}
                  name="Valor inventario"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Materiales más costosos */}
          <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Materiales Más Costosos
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={masCostosos}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                <YAxis type="category" dataKey="nombre" width={100} tick={{ fontSize: 11 }} />
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <Tooltip formatter={(value) => `$${value}`} />
                <Bar dataKey="precio" fill="#f59e0b" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="lg:col-span-3 space-y-6">
          {/* Resumen */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl shadow p-4 border border-emerald-100">
            <h3 className="font-semibold text-gray-800 mb-2">📊 Resumen</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total materiales:</span>
                <span className="font-semibold">{itemsFiltrados}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Stock total:</span>
                <span className="font-semibold">
                  {filteredItems
                    .reduce((sum, i) => sum + (i.stock_actual || 0), 0)
                    .toLocaleString()}{" "}
                  uds
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Precio promedio:</span>
                <span className="font-semibold">
                  $
                  {(
                    filteredItems.reduce((sum, i) => sum + i.precio, 0) / (itemsFiltrados || 1)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Stock promedio:</span>
                <span className="font-semibold">
                  {(
                    filteredItems.reduce((sum, i) => sum + (i.stock_actual || 0), 0) /
                    (itemsFiltrados || 1)
                  ).toFixed(0)}{" "}
                  uds/material
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Porcentaje filtrado:</span>
                <span className="font-semibold">{porcentajeFiltrado.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Alertas de stock crítico */}
          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              ⚠️ Alertas de Stock
            </h3>
            {alertasStock.length === 0 ? (
              <div className="text-center text-gray-400 py-4 text-sm">
                ✅ No hay alertas activas
              </div>
            ) : (
              <div className="space-y-3">
                {alertasStock.map((item, idx) => (
                  <div key={idx} className="border-l-4 border-red-400 pl-3">
                    <div className="font-medium text-sm">{item.nombre}</div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Stock: {item.stock_actual}</span>
                      <span>Mínimo: {item.stock_minimo}</span>
                      <span className="text-red-500">⚠️ Crítico</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top categorías por valor */}
          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">💰 Valor por Categoría</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {categoriaData.slice(0, 6).map((cat, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600">{cat.name}</span>
                  <span className="font-semibold text-gray-800">${cat.valor.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
