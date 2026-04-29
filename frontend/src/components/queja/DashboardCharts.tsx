// React import not required with new JSX transform
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
  Legend,
} from "recharts";

export function SankeyChart({ data }: { data: any }) {
  // expects { nodes: string[]|{name:string}[], links: {source,target,value}[] }
  // defensive: accept nodes as strings or objects, links with names or indices
  console.debug("SankeyChart props", data);
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h3 className="font-semibold mb-2">Flujo de estados (Sankey)</h3>
        <div className="text-sm text-gray-500">No hay datos para mostrar el flujo.</div>
      </div>
    );
  }

  // If nodes are empty but links exist, build nodes from links
  const incomingLinks = Array.isArray(data.links) ? data.links : [];
  const rawNodes = Array.isArray(data.nodes) ? data.nodes : [];
  if (rawNodes.length === 0 && incomingLinks.length > 0) {
    const names = new Set<string>();
    incomingLinks.forEach((l: any) => {
      if (typeof l.source === "string") names.add(l.source);
      if (typeof l.target === "string") names.add(l.target);
    });
    // fallback order if missing: common states
    const order = ["Abierta", "Probada", "Asignada", "Pendiente", "Resuelta", "Cerrada"];
    const nodesFromLinks = Array.from(names).sort((a, b) => {
      const ia = order.indexOf(a) === -1 ? 999 : order.indexOf(a);
      const ib = order.indexOf(b) === -1 ? 999 : order.indexOf(b);
      return ia - ib;
    });
    // use these as nodes
    data = { ...data, nodes: nodesFromLinks };
  }
  if (!Array.isArray(data.nodes) || data.nodes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h3 className="font-semibold mb-2">Flujo de estados (Sankey)</h3>
        <div className="text-sm text-gray-500">No hay datos para mostrar el flujo.</div>
      </div>
    );
  }
  const nodes = data.nodes.map((n: any) =>
    typeof n === "string"
      ? { name: n, color: "#8884d8" }
      : { ...(n as any), color: n.color || "#8884d8" },
  );
  const links = (data.links || []).map((l: any) => {
    let sourceIndex =
      typeof l.source === "number" ? l.source : nodes.findIndex((nn: any) => nn.name === l.source);
    let targetIndex =
      typeof l.target === "number" ? l.target : nodes.findIndex((nn: any) => nn.name === l.target);
    if (sourceIndex < 0) sourceIndex = 0;
    if (targetIndex < 0) targetIndex = Math.min(nodes.length - 1, sourceIndex + 1);
    return { source: sourceIndex, target: targetIndex, value: Number(l.value || 0) };
  });
  // build simple totals per node for a legend (sum of attached link values)
  const nodeTotals: Record<string, number> = {};
  nodes.forEach((n: any) => (nodeTotals[n.name] = 0));
  links.forEach((l: any) => {
    const s = nodes[l.source]?.name;
    const t = nodes[l.target]?.name;
    if (s) nodeTotals[s] = (nodeTotals[s] || 0) + Number(l.value || 0);
    if (t) nodeTotals[t] = (nodeTotals[t] || 0) + Number(l.value || 0);
  });
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="font-semibold mb-2">Flujo de estados (Sankey)</h3>
      <div style={{ width: "100%", height: 250, minWidth: 0, minHeight: 200 }}>
        <ResponsiveContainer>
          <Sankey data={{ nodes, links }} nodePadding={10} nodeWidth={12} />
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {nodes.map((n: any) => (
          <div key={n.name} className="text-xs px-2 py-1 bg-gray-100 rounded">
            <strong className="mr-2">{n.name}</strong>
            <span className="text-gray-600">{nodeTotals[n.name] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LineHistoric({ counts, moving }: any) {
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
            <Legend />
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
      <h3 className="font-semibold mb-2">MTTR por dimensión</h3>
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
        {stages.map((s, i) => (
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
        <FunnelMini stages={props.funnel.stages} />
        <MttrBar data={props.mttr} meta={props.mttrMeta} />
        <CloseTimeBuckets data={props.closeBuckets} />
      </div>
    </div>
  );
}
