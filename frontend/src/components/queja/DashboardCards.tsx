// React import not required with new JSX transform

interface CardItem {
  title: string;
  count: number;
  pct?: number;
  prev?: number;
}
type Periodo = { desde?: string; hasta?: string };

export default function DashboardCards({
  data,
}: {
  data: {
    total?: number;
    telefonos?: CardItem;
    lineas?: CardItem;
    pizarras?: CardItem;
    periodo?: Periodo;
  };
}) {
  const safe = {
    total: data?.total ?? 0,
    periodo: data?.periodo ?? {},
    telefonos: {
      title: "Teléfonos",
      count: data?.telefonos?.count ?? 0,
      pct: data?.telefonos?.pct ?? 0,
      prev: data?.telefonos?.prev ?? 0,
    },
    lineas: {
      title: "Líneas",
      count: data?.lineas?.count ?? 0,
      pct: data?.lineas?.pct ?? 0,
      prev: data?.lineas?.prev ?? 0,
    },
    pizarras: {
      title: "Pizarras",
      count: data?.pizarras?.count ?? 0,
      pct: data?.pizarras?.pct ?? 0,
      prev: data?.pizarras?.prev ?? 0,
    },
  };

  const cards = [
    {
      key: "total",
      title: "Total quejas",
      value: safe.total,
      subtitle: `${safe.periodo.desde ? new Date(safe.periodo.desde).toLocaleDateString() : "-"} → ${safe.periodo.hasta ? new Date(safe.periodo.hasta).toLocaleDateString() : "-"}`,
      color: "purple",
    },
    {
      key: "telefonos",
      title: "Teléfonos",
      value: safe.telefonos.count,
      subtitle: `${safe.telefonos.pct}% del total`,
      meta: safe.telefonos.prev,
      color: "blue",
    },
    {
      key: "lineas",
      title: "Líneas",
      value: safe.lineas.count,
      subtitle: `${safe.lineas.pct}% del total`,
      meta: safe.lineas.prev,
      color: "emerald",
    },
    {
      key: "pizarras",
      title: "Pizarras",
      value: safe.pizarras.count,
      subtitle: `${safe.pizarras.pct}% del total`,
      meta: safe.pizarras.prev,
      color: "orange",
    },
  ];

  const colorClasses: Record<string, string> = {
    purple: "from-purple-500 to-purple-600",
    blue: "from-blue-500 to-blue-600",
    emerald: "from-emerald-500 to-emerald-600",
    orange: "from-orange-400 to-orange-600",
  };

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.key}
            className={`bg-gradient-to-r ${colorClasses[c.color] || colorClasses.blue} rounded-xl shadow-lg p-4 text-white`}
          >
            <div className="text-sm opacity-90 mb-1">{c.title}</div>
            <div className="text-2xl font-bold">{Number(c.value || 0).toLocaleString()}</div>
            {c.subtitle && <div className="text-xs opacity-80 mt-1">{c.subtitle}</div>}
            {c.meta !== undefined && (
              <div className="text-xs mt-2 flex items-center gap-2 opacity-90">
                <span className="text-sm">Anterior</span>
                <span className="font-medium">{Number(c.meta || 0).toLocaleString()}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
