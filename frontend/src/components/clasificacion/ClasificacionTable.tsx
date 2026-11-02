import type { ClasificacionItem } from '../../services/clasificacionService';
import { Table } from '../../components/ui/Table';

interface ClasificacionTableProps {
    items: ClasificacionItem[];
    searchTerm: string;
    onEdit: (item: ClasificacionItem) => void;
    onDelete: (id: number) => void;
    loading?: boolean;
}

export default function ClasificacionTable({
    items,
    onEdit,
    onDelete,
    loading = false,
}: ClasificacionTableProps) {
  const columns = [
    { key: "no", label: "No." },
    { key: "nombre", label: "Nombre" },
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
    <Table<ClasificacionItem>
      items={items}
      columns={columns}
      cardTitle={(item) => `Clasificación #${item.id_clasificacion}`}
      renderRowActions={(item) => (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(item)}
            className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
            title="Editar"
          >
            <i className="ri-edit-line"></i>
          </button>
          <button
            onClick={() => onDelete(item.id_clasificacion)}
            className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 transition-colors"
            title="Eliminar"
          >
            <i className="ri-delete-bin-line"></i>
          </button>
        </div>
      )}
      loading={loading}
      emptyMessage="No se encontraron clasificaciones"
    />
  );
}
