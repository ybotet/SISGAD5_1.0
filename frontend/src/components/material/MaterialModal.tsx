import type { MaterialItem } from "../../services/materialService";
import { useEffect, useState } from "react";

interface MaterialModalProps {
  show: boolean;
  editingItem: MaterialItem | null;
  saving: boolean;
  unidadOptions: Array<{ id: number; nombre: string }>;
  categoriaOptions: Array<{ id: number; nombre: string }>;
  onClose: () => void;
  onSave: (formData: FormData) => void;
}

export default function MaterialModal({
  show,
  editingItem,
  saving,
  unidadOptions,
  categoriaOptions,
  onClose,
  onSave,
}: MaterialModalProps) {
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    categoria: "",
    unidad: "",
    precio: "0",
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        codigo: editingItem.codigo,
        nombre: editingItem.nombre,
        descripcion: editingItem.descripcion || "",
        categoria: editingItem.categoria.toString(),
        unidad: editingItem.unidad.toString(),
        precio: editingItem.precio.toString(),
      });
    } else {
      setFormData({
        codigo: "",
        nombre: "",
        descripcion: "",
        categoria: "",
        unidad: "",
        precio: "0",
      });
    }
  }, [editingItem]);

  if (!show) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(new FormData(e.currentTarget));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
        <h3 className="text-lg font-semibold mb-4">
          {editingItem ? "Editar Material" : "Nuevo Material"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
              <input
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                required
                disabled={saving}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                disabled={saving}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                disabled={saving}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                required
                disabled={saving}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione una categoría</option>
                {categoriaOptions.map((categoria, index) => (
                  <option key={`${categoria.id}-${index}`} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidad *</label>
              <select
                name="unidad"
                value={formData.unidad}
                onChange={handleChange}
                required
                disabled={saving}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione una unidad</option>
                {unidadOptions.map((unidad, index) => (
                  <option key={`${unidad.id}-${index}`} value={unidad.id}>
                    {unidad.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
              <input
                name="precio"
                type="number"
                min="0"
                step="0.01"
                value={formData.precio}
                onChange={handleChange}
                required
                disabled={saving}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
            >
              {saving && <i className="ri-loader-4-line animate-spin"></i>}
              <span>{editingItem ? "Guardar cambios" : "Crear material"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
