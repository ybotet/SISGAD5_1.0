import { useState, useEffect } from "react";
import type { MaterialItem } from "../../services/materialService";
import type { ConsumoItem } from "../../services/consumoService";
import { trabajadorService, type TrabajadorItem } from "../../services/trabajadorService";

interface Props {
  show: boolean;
  onClose: () => void;
  onSave: (payload: any) => void;
  materiales?: MaterialItem[];
  trabajoId: number | null;
}

export default function ConsumoModal({ show, onClose, onSave, materiales = [], trabajoId }: Props) {
  const [fecha, setFecha] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [detalles, setDetalles] = useState<Array<{ id_material: number; cantidad: number }>>([]);
  const [selected, setSelected] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [trabajadores, setTrabajadores] = useState<TrabajadorItem[]>([]);
  const [trabajadorId, setTrabajadorId] = useState<string>("");
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const resp = await trabajadorService.getTrabajadores(1, 1000);
        if (!mounted) return;
        setTrabajadores(resp.data || []);
      } catch (err) {
        console.error("Error cargando trabajadores:", err);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (!show) return null;

  const addDetalle = () => {
    if (!selected || !cantidad) return;
    const idm = Number(selected);
    const cant = Number(cantidad);
    const idx = detalles.findIndex((d) => d.id_material === idm);
    if (idx >= 0) {
      const copy = [...detalles];
      copy[idx].cantidad += cant;
      setDetalles(copy);
    } else setDetalles([...detalles, { id_material: idm, cantidad: cant }]);
    setSelected("");
    setCantidad("1");
  };

  const removeDetalle = (i: number) => setDetalles(detalles.filter((_, idx) => idx !== i));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trabajoId) return alert("Selecciona primero un trabajo");
    if (detalles.length === 0) return alert("Añade al menos un material");

    const fechaIso = fecha ? new Date(fecha).toISOString() : new Date().toISOString();

    const payload = {
      id_trabajo: trabajoId,
      id_trabajador: trabajadorId ? Number(trabajadorId) : null,
      fecha_consumo: fechaIso,
      observaciones,
      detalles: detalles.map((d) => ({ id_material: d.id_material, cantidad: d.cantidad })),
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Nuevo consumo</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            ×
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600">Fecha</label>
            <input
              type="datetime-local"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Observaciones</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Trabajador</label>
            <select
              value={trabajadorId}
              onChange={(e) => setTrabajadorId(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Seleccionar trabajador...</option>
              {trabajadores.map((t) => (
                <option key={t.id_trabajador} value={t.id_trabajador}>
                  {t.clave_trabajador} {t.nombre ? `- ${t.nombre}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600">Material</label>
            <div className="flex gap-2 mt-2">
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="flex-1 px-3 py-2 border rounded"
              >
                <option value="">Seleccionar material...</option>
                {materiales.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
              <input
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="w-24 px-3 py-2 border rounded"
                type="number"
                min={1}
              />
              <button
                type="button"
                onClick={addDetalle}
                className="px-3 py-2 bg-blue-600 text-white rounded"
              >
                Añadir
              </button>
            </div>
          </div>

          {detalles.length > 0 && (
            <div className="bg-gray-50 p-3 rounded">
              {detalles.map((d, i) => (
                <div key={i} className="flex justify-between items-center py-1">
                  <div>
                    {materiales.find((m) => m.id === d.id_material)?.nombre || d.id_material} —{" "}
                    {d.cantidad}
                  </div>
                  <button type="button" onClick={() => removeDetalle(i)} className="text-red-600">
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="text-right">
            <button type="button" onClick={onClose} className="px-3 py-2 border rounded mr-2">
              Cancelar
            </button>
            <button type="submit" className="px-3 py-2 bg-green-600 text-white rounded">
              Guardar consumo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
