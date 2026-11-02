import type { QuejaItem } from "../../services/quejaService";
import QuejaEstadoBadge from "./QuejaEstadoBadge";
import { formatToDisplay } from "../../utils/dateFormats";
import { Table } from "../../components/ui/Table";

interface QuejaTableProps {
  items: QuejaItem[];
  onEdit: (item: QuejaItem) => void;
  onDelete: (id: number) => void;
  onView: (item: QuejaItem) => void;
  loading?: boolean;
  claves?: Map<number, string>;
  clavesLoaded?: boolean;
}

/**
 * Renderiza el servicio (teléfono, línea o pizarra) para tarjeta móvil.
 */
function renderServicioCard(item: QuejaItem) {
  if (item.tb_telefono) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <i className="ri-phone-line mr-1"></i>
          Teléfono
        </span>
        <span className="text-xs text-gray-600 font-medium">{item.tb_telefono.telefono}</span>
      </div>
    );
  }
  if (item.tb_linea) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <i className="ri-wire-line mr-1"></i>
          Línea
        </span>
        <span className="text-xs text-gray-600 font-medium">{item.tb_linea.clavelinea}</span>
      </div>
    );
  }
  if (item.tb_pizarra) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <i className="ri-layout-line mr-1"></i>
          Pizarra
        </span>
        <span className="text-xs text-gray-600 font-medium">{item.tb_pizarra.nombre || "Sin nombre"}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <i className="ri-question-line mr-1"></i>
        Sin servicio
      </span>
      <span className="text-xs text-gray-400 italic">No asignado</span>
    </div>
  );
}

export default function QuejaTable({
  items,
  onEdit,
  onDelete,
  onView,
  loading = false,
  claves = new Map(),
  clavesLoaded = false,
}: QuejaTableProps) {
  const getClaveDescription = (id_clave: number | null | undefined): string => {
    if (!id_clave) return "Sin clave";
    if (!clavesLoaded) return "Cargando...";
    return claves.get(id_clave) || `Clave #${id_clave}`;
  };

  const columns = [
    { key: "num_reporte", label: "Reporte" },
    { key: "fecha", label: "Fecha", format: (v: any) => formatToDisplay(v) },
    {
      key: "servicio",
      label: "Servicio",
      format: (_v: any, item: QuejaItem) => renderServicioCard(item),
    },
    {
      key: "tipo",
      label: "Tipo",
      format: (_v: any, item: QuejaItem) => (
        item.tb_tipoqueja ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            <i className="ri-file-list-line mr-1"></i>
            {item.tb_tipoqueja.tipoqueja}
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <i className="ri-question-line mr-1"></i>
            Sin tipo
          </span>
        )
      ),
    },
    {
      key: "estado",
      label: "Estado",
      format: (_v: any, item: QuejaItem) => <QuejaEstadoBadge estado={item.estado} size="sm" />,
    },
    {
      key: "reportado_por",
      label: "Reportado por",
      format: (_v: any, item: QuejaItem) => (
        <div className="text-sm text-gray-900">
          {item.reportado_por || "Sin datos"}
          <div className="text-xs text-gray-500 mt-1">
            Probador: {item.tb_trabajador?.clave_trabajador || "Sin datos"}
          </div>
        </div>
      ),
    },
    {
      key: "clave",
      label: "Clave",
      format: (_v: any, item: QuejaItem) => (
        <span className={item.id_clave ? "text-blue-600 font-medium" : "text-gray-400 italic text-sm"}>
          {item.id_clave ? getClaveDescription(item.id_clave) : "Sin clave"}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <i className="ri-loader-4-line animate-spin text-2xl text-blue-600 mb-2"></i>
        <p className="text-gray-600">Actualizando datos…</p>
      </div>
    );
  }

  return (
    <Table<QuejaItem>
      items={items}
      columns={columns}
      cardTitle={(item) => `Queja #${item.num_reporte}`}
      renderRowActions={(item) => (
        <div className="flex gap-2">
          <button
            onClick={() => onView(item)}
            className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50 transition-colors"
            title="Ver detalles"
          >
            <i className="ri-eye-line"></i>
          </button>
          <button
            onClick={() => onEdit(item)}
            className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
            title="Editar"
          >
            <i className="ri-edit-line"></i>
          </button>
          <button
            onClick={() => onDelete(item.id_queja)}
            className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 transition-colors"
            title="Eliminar"
          >
            <i className="ri-delete-bin-line"></i>
          </button>
        </div>
      )}
      loading={loading}
      emptyMessage="No se encontraron quejas"
    />
  );
}
