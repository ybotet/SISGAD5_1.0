import type { FlujoItem } from "../../services/quejaService";

interface QuejaFlowHistorySectionProps {
  flujo?: FlujoItem[];
  clavesMap?: Map<number, string>;
}

export default function QuejaFlowHistorySection({
  flujo = [],
  clavesMap = new Map(),
}: QuejaFlowHistorySectionProps) {
  const getClaveDescription = (id_clave: number | null | undefined): string => {
    if (!id_clave) return "Sin clave";
    return clavesMap.get(id_clave) || `Clave #${id_clave}`;
  };

  if (!flujo || flujo.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">
        <i className="ri-timeline-view mr-2"></i>
        Historial de Flujo
      </h4>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {flujo.map((item, index) => (
          <div
            key={index}
            className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-sm font-semibold text-blue-600">
                {index + 1}
              </span>
            </div>
            <div className="flex-grow">
              <p className="text-sm text-gray-900 font-medium">
                Clave:{" "}
                <span className="text-blue-600 font-semibold">
                  {getClaveDescription(item.id_clave)}
                </span>
              </p>
              <p className="text-xs text-gray-500">
                {item.fecha
                  ? new Date(item.fecha).toLocaleString()
                  : "Sin fecha"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
