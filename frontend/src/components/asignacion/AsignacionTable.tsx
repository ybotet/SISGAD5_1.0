import type { AsignacionItem } from "../../services/asignacionService";
import type { TrabajadorItem } from "../../services/trabajadorService";

interface AsignacionTableProps {
  items: AsignacionItem[];
  onEdit: (item: AsignacionItem) => void;
  onView?: (item: AsignacionItem) => void;
  onDelete: (id: number) => void;
  trabajadorMap?: Record<number, string> | null;
  startIndex?: number;
  loading?: boolean;
}

export default function AsignacionTable({
  items,
  onEdit,
  onDelete,
  onView,
  trabajadorMap = {},
  startIndex = 0,
  loading = false,
}: AsignacionTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <i className="ri-inbox-line text-4xl text-gray-400 mb-3"></i>
        <p className="text-gray-500">No hay asignaciones registradas</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">No.</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Trabajador</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fecha</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Detalles</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Observaciones
            </th>
            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {items.map((item, idx) => (
            <tr key={item.id} className={`hover:bg-gray-50 ${loading ? "opacity-50" : ""}`}>
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">{startIndex + idx + 1}</td>
              <td className="px-6 py-4 text-sm text-gray-700">
                {trabajadorMap && trabajadorMap[item.id_trabajador]
                  ? trabajadorMap[item.id_trabajador]
                  : `ID ${item.id_trabajador}`}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                {new Date(item.fecha_asignacion).toLocaleDateString("es-ES")}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {item.detalles?.length || 0} item(s)
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                {item.observaciones || "-"}
              </td>
              <td className="px-6 py-4 text-center space-x-2">
                <button
                  onClick={() => onView && onView(item)}
                  disabled={loading}
                  className="text-green-600 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed mr-2"
                  title="Ver detalles"
                >
                  <i className="ri-eye-line"></i>
                </button>

                <button
                  onClick={() => onEdit(item)}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Editar"
                >
                  <i className="ri-edit-line"></i>
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Eliminar"
                >
                  <i className="ri-delete-bin-line"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
