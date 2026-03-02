import type { MovimientoItem } from "../../services/movimientoService";

interface Props {
  movimientos: MovimientoItem[];
  loading?: boolean;
}

export default function MovimientoTable({
  movimientos,
  loading = false,
}: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <i className="ri-loader-4-line animate-spin text-2xl text-blue-600 mb-2"></i>
        <p className="text-gray-600">Cargando movimientos...</p>
      </div>
    );
  }

  // Para renderizar el servicio (telefono o linea)
  const renderServicio = (item: MovimientoItem) => {
    // Primero verificar si hay teléfono
    if (item.tb_telefono) {
      return (
        <div className="flex flex-col">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-1">
            <i className="ri-phone-line mr-1"></i>
            Teléfono
          </span>
          <span className="text-xs text-gray-600 font-medium">
            {item.tb_telefono.telefono}
          </span>
        </div>
      );
    }

    // Luego verificar si hay línea
    if (item.tb_linea) {
      return (
        <div className="flex flex-col">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-1">
            <i className="ri-wire-line mr-1"></i>
            Línea
          </span>
          <span className="text-xs text-gray-600 font-medium">
            {item.tb_linea.clavelinea}
          </span>
        </div>
      );
    }

    // Si no hay ningún servicio
    return (
      <div className="flex flex-col">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-1">
          <i className="ri-question-line mr-1"></i>
          Sin servicio
        </span>
        <span className="text-xs text-gray-400 italic">No asignado</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Servicio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Movimiento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Motivo
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {movimientos.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  <i className="ri-inbox-line text-3xl mb-2 block"></i>
                  No se encontraron movimientos
                </td>
              </tr>
            ) : (
              movimientos.map((m) => (
                <tr key={m.id_movimiento} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {renderServicio(m)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {m.tb_tipomovimiento
                      ? m.tb_tipomovimiento.movimiento
                      : "Desconocido"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(m.fecha).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {m.motivo}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
