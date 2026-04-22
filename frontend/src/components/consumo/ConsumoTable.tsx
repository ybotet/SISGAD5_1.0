import type { ConsumoItem } from "../../services/consumoService";
import type { MaterialItem } from "../../services/materialService";

interface Props {
  items: ConsumoItem[];
  materialesMap?: Record<number, MaterialItem>;
  onView?: (item: ConsumoItem) => void;
  trabajadorMap?: Record<number, string>;
}

export default function ConsumoTable({
  items,
  materialesMap = {},
  onView,
  trabajadorMap = {},
}: Props) {
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
            <th className="px-4 py-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">{c.id}</td>
              <td className="px-4 py-3">{new Date(c.fecha_consumo).toLocaleString()}</td>
              <td className="px-4 py-3">
                {trabajadorMap && trabajadorMap[c.id_trabajador]
                  ? trabajadorMap[c.id_trabajador]
                  : `ID ${c.id_trabajador}`}
              </td>
              <td className="px-4 py-3">{c.observaciones || "-"}</td>
              <td className="px-4 py-3">
                <span
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                  title={
                    c.detalles && c.detalles.length > 0
                      ? c.detalles
                          .map(
                            (d) =>
                              `${materialesMap[d.id_material]?.nombre || `Material ${d.id_material}`}: ${d.cantidad}`,
                          )
                          .join("; ")
                      : undefined
                  }
                >
                  {c.detalles?.length || 0} item(s)
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => onView && onView(c)}
                  className="text-green-600 hover:text-green-800"
                  title="Ver detalles"
                >
                  <i className="ri-eye-line"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
