import { useState, useEffect } from "react";
import type { AsignacionItem } from "../../services/asignacionService";
import type { MaterialItem } from "../../services/materialService";

interface AsignacionModalProps {
  showModal: boolean;
  editingItem: AsignacionItem | null;
  saving: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => void;
  materiales?: MaterialItem[];
}

export default function AsignacionModal({
  showModal,
  editingItem,
  saving,
  onClose,
  onSave,
  materiales = [],
}: AsignacionModalProps) {
  const [trabajadorId, setTrabajadorId] = useState("");
  const [fechaAsignacion, setFechaAsignacion] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [detalles, setDetalles] = useState<Array<{ id_material: number; cantidad: number }>>([]);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [cantidad, setCantidad] = useState("1");

  useEffect(() => {
    if (editingItem) {
      setTrabajadorId(editingItem.id_trabajador.toString());
      setFechaAsignacion(editingItem.fecha_asignacion.split("T")[0]);
      setObservaciones(editingItem.observaciones || "");
      setDetalles(
        editingItem.detalles?.map((d) => ({
          id_material: d.id_material,
          cantidad: d.cantidad,
        })) || [],
      );
    } else {
      setTrabajadorId("");
      setFechaAsignacion("");
      setObservaciones("");
      setDetalles([]);
    }
    setSelectedMaterial("");
    setCantidad("1");
  }, [editingItem, showModal]);

  const handleAddDetalle = () => {
    if (!selectedMaterial || !cantidad || parseInt(cantidad) <= 0) {
      return;
    }

    const materialId = parseInt(selectedMaterial);
    const cantidadNum = parseInt(cantidad);

    // Verificar si el material ya existe
    const existingIndex = detalles.findIndex((d) => d.id_material === materialId);
    if (existingIndex >= 0) {
      const newDetalles = [...detalles];
      newDetalles[existingIndex].cantidad += cantidadNum;
      setDetalles(newDetalles);
    } else {
      setDetalles([...detalles, { id_material: materialId, cantidad: cantidadNum }]);
    }

    setSelectedMaterial("");
    setCantidad("1");
  };

  const handleRemoveDetalle = (index: number) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!trabajadorId || !fechaAsignacion || detalles.length === 0) {
      alert("Por favor completa todos los campos y añade al menos un material");
      return;
    }

    const formData = new FormData();
    formData.append("id_trabajador", trabajadorId);
    formData.append("fecha_asignacion", fechaAsignacion);
    formData.append("observaciones", observaciones);
    formData.append("detalles", JSON.stringify(detalles));

    onSave(formData);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-50 border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              {editingItem ? "Editar asignación" : "Nueva asignación"}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Trabajador ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ID Trabajador *</label>
            <input
              type="number"
              value={trabajadorId}
              onChange={(e) => setTrabajadorId(e.target.value)}
              disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              required
            />
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de asignación *
            </label>
            <input
              type="date"
              value={fechaAsignacion}
              onChange={(e) => setFechaAsignacion(e.target.value)}
              disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              required
            />
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              disabled={saving}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          {/* Sección de detalles */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Materiales</h3>

            {/* Selector de material */}
            <div className="flex gap-2 mb-3">
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                disabled={saving}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Seleccionar material...</option>
                {materiales.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre} (${m.precio})
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                disabled={saving}
                min="1"
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Cantidad"
              />
              <button
                type="button"
                onClick={handleAddDetalle}
                disabled={saving || !selectedMaterial}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="ri-add-line"></i>
              </button>
            </div>

            {/* Lista de detalles */}
            {detalles.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                {detalles.map((detalle, index) => {
                  const material = materiales.find((m) => m.id === detalle.id_material);
                  return (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-white p-2 rounded border border-gray-200"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {material?.nombre || `Material #${detalle.id_material}`}
                        </p>
                        <p className="text-xs text-gray-600">
                          Cantidad: {detalle.cantidad} × ${material?.precio?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDetalle(index)}
                        disabled={saving}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {detalles.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <i className="ri-info-line"></i> Añade al menos un material
                </p>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || detalles.length === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="ri-save-line mr-2"></i>
                  Guardar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
