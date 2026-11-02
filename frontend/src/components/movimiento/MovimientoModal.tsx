import { useState, useEffect } from "react";
import { tipomovimientoService } from "../../services/tipomovimientoService";
import type { TipoMovimientoItem } from "../../services/tipomovimientoService";
import type { CreateMovimientoRequest } from "../../services/movimientoService";
import {
  telefonoService,
  type TelefonoItem,
} from "../../services/telefonoService";
import { lineaService, type LineaItem } from "../../services/lineaService";

type TipoServicio = "telefono" | "linea" | "ninguno";

interface Props {
  show: boolean;
  onClose: () => void;
  onSave: (data: CreateMovimientoRequest) => void;
  saving?: boolean;
}

export default function MovimientoModal({
  show,
  onClose,
  onSave,
  saving = false,
}: Props) {
  const [tipoServicio, setTipoServicio] = useState<TipoServicio>("ninguno");
  const [tipos, setTipos] = useState<TipoMovimientoItem[]>([]);
  const [telefonos, setTelefonos] = useState<TelefonoItem[]>([]);
  const [lineas, setLineas] = useState<LineaItem[]>([]);
  const [form, setForm] = useState({
    id_tipomovimiento: "",
    fecha: new Date().toISOString().split("T")[0],
    motivo: "",
    id_telefono: "",
    id_linea: "",
  });

  useEffect(() => {
    if (show) {
      loadTipos();
      loadTelefonos();
      loadLineas();
      // Reset tipoServicio cuando se abre el modal
      setTipoServicio("ninguno");
    }
  }, [show]);

  const loadTipos = async () => {
    try {
      const res = await tipomovimientoService.getTiposMovimiento(1, 100);
      setTipos(res.data || []);
    } catch (err) {
      console.error("Error cargando tipos:", err);
    }
  };

  const loadTelefonos = async () => {
    try {
      const res = await telefonoService.getTelefonos(1, 100);
      setTelefonos(res.data || []);
    } catch (err) {
      console.error("Error cargando teléfonos:", err);
    }
  };

  const loadLineas = async () => {
    try {
      const res = await lineaService.getLineas(1, 100);
      setLineas(res.data || []);
    } catch (err) {
      console.error("Error cargando líneas:", err);
    }
  };

  const handleTipoServicioChange = (tipo: TipoServicio) => {
    setTipoServicio(tipo);
    // Limpiar los otros campos cuando se cambia el tipo de servicio
    setForm((prev) => ({
      ...prev,
      id_telefono: tipo === "telefono" ? prev.id_telefono : "",
      id_linea: tipo === "linea" ? prev.id_linea : "",
    }));
  };

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target as any;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.id_tipomovimiento ||
      !form.fecha ||
      !form.motivo ||
      tipoServicio === "ninguno"
    ) {
      alert(
        "Por favor complete todos los campos requeridos y seleccione un servicio (teléfono o línea)",
      );
      return;
    }

    const selectedService =
      tipoServicio === "telefono" ? form.id_telefono : form.id_linea;
    if (!selectedService) {
      alert(
        `Por favor seleccione un${
          tipoServicio === "telefono" ? " teléfono" : "a línea"
        }`,
      );
      return;
    }

    const payload: CreateMovimientoRequest = {
      id_tipomovimiento: parseInt(form.id_tipomovimiento, 10),
      fecha: form.fecha,
      motivo: form.motivo,
      id_telefono:
        tipoServicio === "telefono" && form.id_telefono
          ? parseInt(form.id_telefono, 10)
          : undefined,
      id_linea:
        tipoServicio === "linea" && form.id_linea
          ? parseInt(form.id_linea, 10)
          : undefined,
    };
    onSave(payload);
  };

  if (!show) return null;

  const renderServicioSelector = () => {
    switch (tipoServicio) {
      case "telefono":
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Seleccionar Teléfono *
            </label>
            <select
              name="id_telefono"
              value={form.id_telefono}
              onChange={onChange}
              required
              disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Seleccione un teléfono</option>
              {telefonos.map((t) => (
                <option key={t.id_telefono} value={t.id_telefono}>
                  {t.telefono}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              {telefonos.length} teléfonos disponibles
            </p>
          </div>
        );

      case "linea":
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Seleccionar Línea *
            </label>
            <select
              name="id_linea"
              value={form.id_linea}
              onChange={onChange}
              required
              disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Seleccione una línea</option>
              {lineas.map((l) => (
                <option key={l.id_linea} value={l.id_linea}>
                  {l.clavelinea}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              {lineas.length} líneas disponibles
            </p>
          </div>
        );

      case "ninguno":
        return (
          <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
            <i className="ri-question-line text-2xl text-gray-400 mb-2"></i>
            <p className="text-sm text-gray-500">
              Seleccione un tipo de servicio para continuar
            </p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Nuevo movimiento</h3>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tipo de movimiento *
            </label>
            <select
              name="id_tipomovimiento"
              value={form.id_tipomovimiento}
              onChange={onChange}
              required
              disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Seleccionar</option>
              {tipos.map((t) => (
                <option key={t.id_tipomovimiento} value={t.id_tipomovimiento}>
                  {t.movimiento}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha *
            </label>
            <input
              type="date"
              name="fecha"
              value={form.fecha}
              onChange={onChange}
              required
              disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Motivo *
            </label>
            <textarea
              name="motivo"
              value={form.motivo}
              onChange={onChange}
              required
              disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Servicio *
            </label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => handleTipoServicioChange("telefono")}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                  tipoServicio === "telefono"
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <i className="ri-phone-line text-xl mb-1"></i>
                <span className="text-xs font-medium">Teléfono</span>
              </button>
              <button
                type="button"
                onClick={() => handleTipoServicioChange("linea")}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                  tipoServicio === "linea"
                    ? "bg-green-50 border-green-300 text-green-700"
                    : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <i className="ri-wire-line text-xl mb-1"></i>
                <span className="text-xs font-medium">Línea</span>
              </button>
            </div>

            {renderServicioSelector()}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
