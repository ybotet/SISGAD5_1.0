import type { StockTrabajadorItem } from "../../services/materialService";
import type { TrabajadorItem } from "../../services/trabajadorService";

function stockBadgeClass(stock: number): string {
  if (stock < 0) return "bg-red-100 text-red-800";
  if (stock === 0) return "bg-gray-100 text-gray-700";
  return "bg-blue-100 text-blue-800";
}

interface StockDetailsModalProps {
  show: boolean;
  onClose: () => void;
  stockItem: StockTrabajadorItem | null;
  trabajador?: TrabajadorItem | null;
}

export default function StockDetailsModal({
  show,
  onClose,
  stockItem,
  trabajador,
}: StockDetailsModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Detalle de stock por trabajador</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 text-xl">
            ×
          </button>
        </div>

        {stockItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">ID trabajador</p>
                <p className="font-medium">{stockItem.trabajador_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Stock total</p>
                <p className="font-medium">{stockItem.total_stock.toLocaleString()} uds</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Trabajador vinculado</h4>
              {trabajador ? (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="font-medium">{trabajador.nombre || "-"}</p>
                  <p className="text-sm text-gray-600 mt-2">Clave de trabajador</p>
                  <p className="font-medium">{trabajador.clave_trabajador || "-"}</p>
                  <p className="text-sm text-gray-600 mt-2">Cargo</p>
                  <p className="font-medium">{trabajador.cargo || "-"}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No se encontró información del trabajador</p>
              )}
            </div>

            <div>
              <h4 className="font-semibold mb-2">Materiales (asignado − consumido)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left">Código</th>
                      <th className="px-3 py-2 text-left">Material</th>
                      <th className="px-3 py-2 text-right">Asignado</th>
                      <th className="px-3 py-2 text-right">Consumido</th>
                      <th className="px-3 py-2 text-right">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockItem.materiales.length > 0 ? (
                      stockItem.materiales.map((m) => (
                        <tr key={m.material_id} className="border-b">
                          <td className="px-3 py-2">{m.codigo || "-"}</td>
                          <td className="px-3 py-2">{m.nombre}</td>
                          <td className="px-3 py-2 text-right">
                            {m.cantidad_asignada.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {m.cantidad_consumida.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${stockBadgeClass(m.stock)}`}
                            >
                              {m.stock.toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-3 py-4 text-gray-500" colSpan={5}>
                          No hay materiales registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-right">
              <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
