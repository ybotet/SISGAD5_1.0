import { useState, useEffect } from "react";
import { tipomovimientoService } from "../../services/tipomovimientoService";
import type { TipoMovimientoItem } from "../../services/tipomovimientoService";

interface TelefonoMovimientoModalProps {
  show: boolean;
  telefonoNumero?: string;
  loading?: boolean;
  onConfirm: (movimientoData: {
    id_tipomovimiento: number;
    fecha: string;
    motivo: string;
  }) => void;
  onCancel: () => void;
  // custom text for header and confirm button
  title?: string;
  confirmText?: string;
  confirmColor?: string; // tailwind color class for button bg (e.g. 'bg-red-600')
}

export default function TelefonoEliminarMovimientoModal({
  show,
  telefonoNumero = "N/A",
  loading = false,
  onConfirm,
  onCancel,
  title = "Registrar Movimiento de Baja",
  confirmText = "Eliminar con Movimiento",
  confirmColor = "bg-red-600",
}: TelefonoMovimientoModalProps) {
  const [tiposMovimiento, setTiposMovimiento] = useState<TipoMovimientoItem[]>(
    [],
  );
  const [loadingTipos, setLoadingTipos] = useState(false);
  const [formData, setFormData] = useState({
    id_tipomovimiento: "",
    fecha: new Date().toISOString().split("T")[0],
    motivo: "",
  });

  useEffect(() => {
    if (show) {
      loadTiposMovimiento();
    }
  }, [show]);

  const loadTiposMovimiento = async () => {
    try {
      setLoadingTipos(true);
      const response = await tipomovimientoService.getTiposMovimiento(1, 100);
      setTiposMovimiento(response.data || []);
    } catch (err) {
      console.error("Error al cargar tipos de movimiento:", err);
    } finally {
      setLoadingTipos(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id_tipomovimiento && formData.fecha && formData.motivo) {
      onConfirm({
        id_tipomovimiento: parseInt(formData.id_tipomovimiento, 10),
        fecha: formData.fecha,
        motivo: formData.motivo,
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start mb-4">
          <div className="bg-yellow-100 rounded-full p-2 mr-3">
            <i className="ri-alert-line text-yellow-600 text-lg"></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-gray-600 mt-1 text-sm">
              Teléfono: <span className="font-medium">{telefonoNumero}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Movimiento *
            </label>
            <select
              name="id_tipomovimiento"
              value={formData.id_tipomovimiento}
              onChange={handleChange}
              disabled={loading || loadingTipos}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
            >
              <option value="">Seleccionar tipo de movimiento</option>
              {tiposMovimiento.map((tipo) => (
                <option
                  key={tipo.id_tipomovimiento}
                  value={tipo.id_tipomovimiento}
                >
                  {tipo.movimiento}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha *
            </label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              disabled={loading}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo *
            </label>
            <textarea
              name="motivo"
              value={formData.motivo}
              onChange={handleChange}
              disabled={loading}
              required
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 resize-none"
              placeholder="Ingrese el motivo de la baja"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                !formData.id_tipomovimiento ||
                !formData.fecha ||
                !formData.motivo
              }
              className={`px-4 py-2 ${confirmColor} hover:opacity-90 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading && <i className="ri-loader-4-line animate-spin"></i>}
              <span>{confirmText}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
