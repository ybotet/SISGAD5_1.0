import React from "react";
import type { ConsumoItem, ConsumoDetalleItem } from "../../services/consumoService";
import type { MaterialItem } from "../../services/materialService";

interface Props {
  show: boolean;
  onClose: () => void;
  consumo: ConsumoItem | null;
  materialesMap?: Record<number, MaterialItem>;
  trabajadorMap?: Record<number, string>;
  loading?: boolean;
}

export default function ConsumoDetailsModal({
  show,
  onClose,
  consumo,
  materialesMap = {},
  trabajadorMap = {},
  loading = false,
}: Props) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Detalles del Consumo</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            ×
          </button>
        </div>

        {loading && (
          <div className="py-6 text-center">
            <i className="ri-loader-4-line animate-spin text-2xl text-blue-600 mb-2"></i>
            <p className="text-gray-600">Cargando detalles...</p>
          </div>
        )}

        {!loading && consumo && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">ID</p>
                <p className="font-medium">{consumo.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha</p>
                <p className="font-medium">{new Date(consumo.fecha_consumo).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trabajador (ID)</p>
                <p className="font-medium">
                  {trabajadorMap && trabajadorMap[consumo.id_trabajador]
                    ? trabajadorMap[consumo.id_trabajador]
                    : `ID ${consumo.id_trabajador}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Observaciones</p>
                <p className="font-medium">{consumo.observaciones || "-"}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Detalles del consumo</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left">ID</th>
                      <th className="px-3 py-2 text-left">Código</th>
                      <th className="px-3 py-2 text-left">Nombre</th>
                      <th className="px-3 py-2 text-right">Cantidad</th>
                      <th className="px-3 py-2 text-right">Costo Unit.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consumo.detalles && consumo.detalles.length > 0 ? (
                      consumo.detalles.map((d: ConsumoDetalleItem) => (
                        <tr key={d.id} className="border-b">
                          <td className="px-3 py-2">{d.id}</td>
                          <td className="px-3 py-2">
                            {materialesMap[d.id_material]?.codigo || "-"}
                          </td>
                          <td className="px-3 py-2">
                            {materialesMap[d.id_material]?.nombre || `Material ${d.id_material}`}
                          </td>
                          <td className="px-3 py-2 text-right">{d.cantidad}</td>
                          <td className="px-3 py-2 text-right">
                            {d.costo_unitario?.toFixed(2) ?? "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-3 py-4 text-gray-500" colSpan={5}>
                          No hay detalles relacionados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-right">
              <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
