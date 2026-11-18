import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Table } from "../../components/ui/Table";
import { notifyError, notifySuccess } from "../../utils/notify";
import { getBackendErrorMessage } from "../../utils/apiErrors";
import { telefonoService } from "../../services/telefonoService";

export interface HistorialEvento {
  tipo: string;
  id: number | null;
  fecha: string | null;
  entidad: string;
  descripcion: string;
  [key: string]: any;
}

interface HistorialResponse {
  entidad: string;
  id: number | string;
  total: number;
  eventos: HistorialEvento[];
}

export default function HistorialTelefonoPage() {
  const { id } = useParams();
  const { usuario, hasPermission } = useAuth();
  const telefonoId = id ? Number(id) : 0;

  const [historial, setHistorial] = useState<HistorialResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const puedeVer = hasPermission("telefonos.ver");

  const loadHistorial = async () => {
    if (!telefonoId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await telefonoService.getHistorial(telefonoId, 1, 50);
      setHistorial(data);
    } catch (err: any) {
      const msg = getBackendErrorMessage(err, "No se pudo cargar el historial del teléfono");
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistorial();
  }, [telefonoId]);

  const columns = [
    { key: "tipo", label: "Tipo", className: "text-sm font-medium text-gray-700" },
    { key: "fecha", label: "Fecha", className: "text-sm text-gray-600" },
    { key: "descripcion", label: "Descripción", className: "text-sm text-gray-600" },
    { key: "entidad", label: "Entidad", className: "text-sm text-gray-600" },
  ];

  const renderCell = (key: string, item: HistorialEvento) => {
    if (key === "tipo") {
      const color =
        item.tipo === "queja"
          ? "text-red-600"
          : item.tipo === "movimiento"
          ? "text-blue-600"
          : "text-green-600";
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${color}`}>
          {item.tipo}
        </span>
      );
    }
    if (key === "fecha") {
      return <span className="text-sm text-gray-600">{item.fecha || "—"}</span>;
    }
    if (key === "descripcion") {
      return <span className="text-sm text-gray-700">{item.descripcion}</span>;
    }
    if (key === "entidad") {
      return <span className="text-sm text-gray-500 capitalize">{item.entidad}</span>;
    }
    return <span className="text-sm text-gray-600">{item[key]}</span>;
  };

  if (!puedeVer) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-800">Acceso denegado</h2>
        <p className="text-gray-600 mt-2">No tiene permiso para ver el historial de teléfonos.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <span className="ri-loader-4-line animate-spin text-2xl text-blue-600"></span>
        <p className="mt-2 text-gray-600">Cargando historial…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 bg-red-50 border border-red-100 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  const eventos = historial?.eventos || [];

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => window.history.back()}
          className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800"
        >
          ← Volver
        </button>
        <h1 className="text-xl font-semibold text-gray-800">
          Historial del teléfono #{telefonoId}
        </h1>
      </div>

      {historial && (
        <div className="mb-2 text-xs text-gray-500">
          {historial.total} evento{historial.total !== 1 ? "s" : ""} encontrado(s)
        </div>
      )}

      <Table
        items={eventos}
        columns={columns}
        loading={loading}
        emptyMessage="No hay eventos en el historial"
        renderRowActions={(_item) => null}
        cardTitle="Evento"
        className=""
      />

      {historial && historial.total > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
          <p className="font-semibold">Resumen:</p>
          <p>
            Teléfono <strong>#{telefonoId}</strong> con{" "}
            {historial.total} evento{historial.total !== 1 ? "s" : ""} en el historial.
          </p>
        </div>
      )}
    </div>
  );
}
