import {
  Sankey,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";

// Definir colores consistentes para cada estado
const STATE_COLORS: Record<string, string> = {
  Abierta: "#FF6B6B", // Rojo suave
  Probada: "#4ECDC4", // Turquesa
  Asignada: "#45B7D1", // Azul cielo
  Pendiente: "#F9CA24", // Amarillo
  Resuelta: "#6AB04C", // Verde
  Cerrada: "#95A5A6", // Gris
};

// Definir interfaces para TypeScript
interface NodeType {
  name: string;
  color: string;
}

interface LinkType {
  source: number;
  target: number;
  value: number;
}

interface SankeyData {
  nodes?: any[];
  links?: any[];
}

interface LegendProps {
  nodes: NodeType[];
  nodeTotals: Record<string, number>;
}

// Componente de leyenda personalizada
const Legend = ({ nodes, nodeTotals }: LegendProps) => {
  return (
    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
      {nodes.map((node: NodeType) => (
        <div
          key={node.name}
          className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200"
        >
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: node.color }} />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-700">{node.name}</span>
            <span className="text-lg font-bold text-gray-900">{nodeTotals[node.name] || 0}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export function SankeyChart({ data }: { data: SankeyData }) {
  console.debug("SankeyChart props", data);

  if (!data || !data.links || data.links.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h3 className="font-semibold mb-2">Flujo de estados (Sankey)</h3>
        <div className="text-sm text-gray-500">No hay datos para mostrar el flujo.</div>
      </div>
    );
  }

  // Procesar nodos con colores
  let nodes: NodeType[] = [];
  let links: LinkType[] = [];

  if (data.nodes && Array.isArray(data.nodes)) {
    // Si los nodos vienen con colores del backend
    nodes = data.nodes.map((node: any) => ({
      name: typeof node === "string" ? node : node.name,
      color:
        typeof node === "string"
          ? STATE_COLORS[node]
          : node.color || STATE_COLORS[node.name] || "#8884d8",
    }));
  } else {
    // Construir nodos desde los links
    const nodeNames = new Set<string>();
    data.links.forEach((link: any) => {
      if (typeof link.source === "string") nodeNames.add(link.source);
      if (typeof link.target === "string") nodeNames.add(link.target);
    });

    const order = ["Abierta", "Probada", "Asignada", "Pendiente", "Resuelta", "Cerrada"];
    const sortedNames = Array.from(nodeNames).sort((a: string, b: string) => {
      const ia = order.indexOf(a) === -1 ? 999 : order.indexOf(a);
      const ib = order.indexOf(b) === -1 ? 999 : order.indexOf(b);
      return ia - ib;
    });

    nodes = sortedNames.map((name: string) => ({
      name,
      color: STATE_COLORS[name] || "#8884d8",
    }));
  }

  // Procesar links con índices de nodos
  links = data.links.map((link: any) => {
    let sourceIndex =
      typeof link.source === "number"
        ? link.source
        : nodes.findIndex((n: NodeType) => n.name === link.source);
    let targetIndex =
      typeof link.target === "number"
        ? link.target
        : nodes.findIndex((n: NodeType) => n.name === link.target);

    if (sourceIndex < 0) sourceIndex = 0;
    if (targetIndex < 0) targetIndex = Math.min(nodes.length - 1, sourceIndex + 1);

    return {
      source: sourceIndex,
      target: targetIndex,
      value: Number(link.value || 0),
    };
  });

  // Calcular totales por nodo para la leyenda
  const nodeTotals: Record<string, number> = {};
  nodes.forEach((node: NodeType) => (nodeTotals[node.name] = 0));
  links.forEach((link: LinkType) => {
    if (nodes[link.source]) nodeTotals[nodes[link.source].name] += link.value;
    if (nodes[link.target]) nodeTotals[nodes[link.target].name] += link.value;
  });

  // Configuración para el Sankey de recharts
  const sankeyData = {
    nodes: nodes.map((node: NodeType) => ({ name: node.name })),
    links: links,
  };

  // Custom node renderer with colors
  const renderSankeyNode = (props: any) => {
    const { x, y, width, height, index } = props;
    const nodeInfo = nodes[index];

    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={nodeInfo?.color || "#8884d8"}
        stroke="#fff"
        strokeWidth={2}
        rx={4}
      />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="font-semibold mb-3">Flujo de estados (Sankey)</h3>

      <div style={{ width: "100%", height: 300, minWidth: 0, minHeight: 200 }}>
        <ResponsiveContainer>
          <Sankey
            data={sankeyData}
            nodePadding={10}
            nodeWidth={15}
            margin={{ top: 20, left: 100, right: 100, bottom: 20 }}
            node={renderSankeyNode}
          >
            <Tooltip />
          </Sankey>
        </ResponsiveContainer>
      </div>

      {/* Leyenda con colores */}
      <Legend nodes={nodes} nodeTotals={nodeTotals} />
    </div>
  );
}

// El resto de tus componentes (LineHistoric, MttrBar, FunnelMini, CloseTimeBuckets, DashboardCharts)
// se mantienen igual, solo asegúrate de agregar las interfaces adecuadas

export function LineHistoric({ counts, moving, projection }: any) {
  const chartData = counts.map((c: any, i: number) => ({
    day: c.day,
    cnt: c.cnt,
    ma: moving[i]?.ma || null,
  }));
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="font-semibold mb-2">Histórico y proyección</h3>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tickFormatter={(d) => new Date(d).toLocaleDateString()} />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="cnt" stroke="#8884d8" fill="#f3f0ff" />
            <Line type="monotone" dataKey="ma" stroke="#ff7300" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function MttrBar({ data, meta = 6 }: { data: any[]; meta?: number }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="font-semibold mb-2">Promedio de horas por tipo de queja</h3>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="dimension" type="category" />
            <Tooltip />
            <Bar dataKey="mttr_hours">
              {data.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.mttr_hours <= meta ? "#2ecc71" : "#e74c3c"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function FunnelMini({ stages }: { stages: any[] }) {
  if (!stages || stages.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h3 className="font-semibold mb-2">Embudo - Tiempos promedio</h3>
        <div className="text-sm text-gray-500">No hay datos de embudo disponibles.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="font-semibold mb-2">Embudo - Tiempos promedio</h3>
      <div className="space-y-2">
        {stages.map((s: any, i: number) => (
          <div key={i} className="flex items-center">
            <div className="w-2/5 text-sm text-gray-600">{s.name}</div>
            <div className="w-3/5">
              <div className="bg-gray-200 rounded h-4 relative">
                <div
                  className="bg-blue-500 h-4 rounded"
                  style={{ width: `${Math.min(100, (s.count / (stages[0]?.count || 1)) * 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-500">
                {s.count} — {s.time_h || "-"} h
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CloseTimeBuckets({ data }: { data: any }) {
  const buckets = data || { le24: 0, btw24_72: 0, gt72: 0, total: 0 };
  const pieData = [
    { name: "≤ 24 h", value: Number(buckets.le24 || 0) },
    { name: "24-72 h", value: Number(buckets.btw24_72 || 0) },
    { name: "> 72 h", value: Number(buckets.gt72 || 0) },
  ];
  const hasData = pieData.some((p) => p.value > 0);

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="font-semibold mb-2">Tiempos de cierre</h3>
      {!hasData ? (
        <div className="text-sm text-gray-500">
          No hay quejas cerradas en el periodo seleccionado.
        </div>
      ) : (
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={pieData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Bar dataKey="value" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default function DashboardCharts(props: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <SankeyChart data={props.sankey} />
        <LineHistoric
          counts={props.historic.counts}
          moving={props.historic.moving}
          projection={props.historic.projection}
        />
      </div>
      <div>
        <FunnelMini stages={props.funnel?.stages || []} />
        <MttrBar data={props.mttr || []} meta={props.mttrMeta} />
        <CloseTimeBuckets data={props.closeBuckets} />
      </div>
    </div>
  );
}
