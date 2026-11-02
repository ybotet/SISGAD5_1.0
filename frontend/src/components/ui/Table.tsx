import { useState } from "react";

/**
 * Columna de tabla con formato opcional.
 */
export interface TableColumn<T = any> {
  key: string;
  label: string;
  className?: string;      // clase Tailwind para la celda/th
  cellClassName?: string;  // clase Tailwind para el th
  format?: (value: any, item: T) => React.ReactNode;
}

/**
 * Props del componente Table compartido.
 *
 * En pantallas >= md se renderiza como tabla HTML tradicional.
 * En pantallas < md se renderiza como lista de tarjetas (cards) apiladas,
 * evitando scroll horizontal y mejorando la usabilidad en móvil.
 */
export interface TableProps<T = any> {
  items: T[];
  columns: TableColumn<T>[];
  renderRowActions?: (item: T) => React.ReactNode;
  cardTitle?: (item: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

/**
 * Tabla compartida con colapso responsive a tarjetas en móvil.
 *
 * Uso típico:
 *   <Table<T>
 *     items={items}
 *     columns={[
 *       { key: "num_reporte", label: "Reporte" },
 *       { key: "fecha", label: "Fecha", format: (v) => formatToDisplay(v) },
 *       ...
 *     ]}
 *     renderRowActions={(item) => (
 *       <>
 *         <button onClick={() => onView(item)}>Ver</button>
 *         <button onClick={() => onEdit(item)}>Editar</button>
 *       </>
 *     )}
 *     cardTitle={(item) => `Queja #${item.num_reporte}`}
 *   />
 */
export default function Table<T = any>({
  items,
  columns,
  renderRowActions,
  cardTitle,
  loading = false,
  emptyMessage = "No se encontraron resultados",
  className,
}: TableProps<T>) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center animate-pulse">
        <div className="flex flex-col items-center gap-3">
          <i className="ri-loader-4-line animate-spin text-2xl text-blue-600"></i>
          <p className="text-sm text-gray-600">Cargando datos…</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <i className="ri-inbox-line text-3xl text-gray-400 mb-3"></i>
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`${className ?? ""}`}>
      {/* ============================================================
          VISTA TARJETAS — móvil (< md)
          ============================================================ */}
      <div className="md:hidden space-y-3">
        {items.map((item) => {
          const title = cardTitle ? cardTitle(item) : String(item[columns[0]?.key ?? "id"]);
          const isExpanded = expandedCard === String(item.id ?? item[columns[0]?.key ?? "id"]);

          return (
            <div
              key={item.id ?? item[columns[0]?.key ?? "id"]}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Encabezado de tarjeta (clic para expandir/colapsar) */}
              <div
                onClick={() =>
                  setExpandedCard(
                    isExpanded
                      ? null
                      : String(item.id ?? item[columns[0]?.key ?? "id"])
                  )
                }
                className="bg-gray-50 px-4 py-3 cursor-pointer flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div className="font-medium text-gray-900 text-sm">{title}</div>
                <i
                  className={`ri-${
                    isExpanded ? "arrow-down-s-line" : "arrow-right-s-line"
                  }-line text-gray-400 text-sm`}
                />
              </div>

              {/* Contenido expandible */}
              {isExpanded && (
                <div className="px-4 py-3 space-y-2 border-t border-gray-100">
                  {columns.map((col) => {
                    const value =
                      col.format?.(
                        (item as any)[col.key],
                        item as T
                      ) ?? (item as any)[col.key];
                    return (
                      <div key={col.key} className="flex justify-between text-sm">
                        <span className="text-gray-500">{col.label}</span>
                        <span className="text-gray-900 font-medium">{value}</span>
                      </div>
                    );
                  })}
                  {renderRowActions && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                      {renderRowActions(item as T)}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ============================================================
          VISTA TABLA — desktop (>= md)
          ============================================================ */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.cellClassName ?? ""}`}
                >
                  {col.label}
                </th>
              ))}
              {renderRowActions && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr
                key={item.id ?? item[columns[0]?.key ?? "id"]}
                className="hover:bg-gray-50 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-6 py-4 text-sm ${col.className ?? ""}`}
                  >
                    {col.format?.(
                      (item as any)[col.key],
                      item as T
                    ) ?? (item as any)[col.key]}
                  </td>
                ))}
                {renderRowActions && (
                  <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                    <div className="flex justify-end space-x-1">
                      {renderRowActions(item as T)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
