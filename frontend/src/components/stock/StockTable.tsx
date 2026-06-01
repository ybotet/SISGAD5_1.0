import type { StockTrabajadorItem } from "../../services/materialService";

function stockBadgeClass(stock: number): string {
  if (stock < 0) return "bg-red-100 text-red-800";
  if (stock === 0) return "bg-gray-100 text-gray-700";
  return "bg-blue-100 text-blue-800";
}

interface StockTableProps {
  items: StockTrabajadorItem[];
  trabajadorMap?: Record<number, string>;
  onView?: (item: StockTrabajadorItem) => void;
  startIndex?: number;
  loading?: boolean;
}

export default function StockTable({
  items,
  trabajadorMap = {},
  onView,
  startIndex = 0,
  loading = false,
}: StockTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <i className="ri-inbox-line text-4xl text-gray-400 mb-3"></i>
        <p className="text-gray-500">No hay stock registrado por trabajador</p>
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
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Materiales</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Stock total</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {items.map((item, idx) => {
            const hasNegative = item.materiales.some((m) => m.stock < 0);
            const trabajadorLabel =
              trabajadorMap[item.trabajador_id] || `ID ${item.trabajador_id}`;

            return (
              <tr
                key={item.trabajador_id}
                className={`hover:bg-gray-50 ${loading ? "opacity-50" : ""}`}
              >
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                  {startIndex + idx + 1}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{trabajadorLabel}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {item.materiales_count} item(s)
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${stockBadgeClass(item.total_stock)}`}
                  >
                    {item.total_stock.toLocaleString()} uds
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {hasNegative ? (
                    <span className="text-red-600 text-xs font-medium">Stock negativo</span>
                  ) : (
                    <span className="text-green-600 text-xs font-medium">OK</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => onView && onView(item)}
                    disabled={loading}
                    className="text-green-600 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Ver detalles"
                  >
                    <i className="ri-eye-line"></i>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
