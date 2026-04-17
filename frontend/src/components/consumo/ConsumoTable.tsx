import type { ConsumoItem } from "../../services/consumoService";
import type { MaterialItem } from "../../services/materialService";

interface Props {
  items: ConsumoItem[];
  materialesMap?: Record<number, MaterialItem>;
}

export default function ConsumoTable({ items, materialesMap = {} }: Props) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">No hay consumos para este trabajo</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Fecha</th>
            <th className="px-4 py-3 text-left">Trabajador</th>
            <th className="px-4 py-3 text-left">Observaciones</th>
            <th className="px-4 py-3 text-left">Detalles</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">{c.id}</td>
              <td className="px-4 py-3">{new Date(c.fecha_consumo).toLocaleString()}</td>
              <td className="px-4 py-3">{c.id_trabajador}</td>
              <td className="px-4 py-3">{c.observaciones || "-"}</td>
              <td className="px-4 py-3">
                {c.detalles && c.detalles.length > 0 ? (
                  <ul className="text-xs space-y-1">
                    {c.detalles.map((d) => (
                      <li key={d.id}>
                        {materialesMap[d.id_material]?.nombre || `Material ${d.id_material}`} —{" "}
                        {d.cantidad}
                      </li>
                    ))}
                  </ul>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
