
import { useState } from 'react';

interface NomencladorItem {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  estado: 'Activo' | 'Inactivo';
  fechaCreacion: string;
}

interface NomencladorModuleProps {
  type: string;
}

export default function NomencladorModule({ type }: NomencladorModuleProps) {
  const nomencladorConfig = {
    cable: { title: 'Cable', icon: 'ri-cable-line' },
    clasificacion: { title: 'Clasificación', icon: 'ri-price-tag-3-line' },
    clave: { title: 'Clave', icon: 'ri-key-line' },
    mandos: { title: 'Mandos', icon: 'ri-remote-control-line' },
    movimientos: { title: 'Movimientos', icon: 'ri-arrow-left-right-line' },
    'pendiente-cable': { title: 'Pendiente Cable Troncal', icon: 'ri-time-line' },
    plantas: { title: 'Plantas', icon: 'ri-building-line' },
    propietarios: { title: 'Propietarios', icon: 'ri-user-line' },
    'resultado-prueba': { title: 'Resultado de la Prueba', icon: 'ri-test-tube-line' },
    senalizaciones: { title: 'Señalizaciones', icon: 'ri-signal-tower-line' },
    sistema: { title: 'Sistema', icon: 'ri-computer-line' },
    'tipo-linea': { title: 'Tipo de Línea', icon: 'ri-git-branch-line' },
    'tipo-pizarra': { title: 'Tipo de Pizarra', icon: 'ri-layout-grid-line' },
    'tipo-queja': { title: 'Tipo de Queja', icon: 'ri-feedback-line' }
  };

  const config = nomencladorConfig[type as keyof typeof nomencladorConfig] || { title: 'Nomenclador', icon: 'ri-settings-line' };

  const [items, setItems] = useState<NomencladorItem[]>([
    {
      id: 1,
      codigo: `${type.toUpperCase()}-001`,
      nombre: `${config.title} Principal`,
      descripcion: `Descripción del ${config.title.toLowerCase()} principal`,
      estado: 'Activo',
      fechaCreacion: '2024-01-15'
    },
    {
      id: 2,
      codigo: `${type.toUpperCase()}-002`,
      nombre: `${config.title} Secundario`,
      descripcion: `Descripción del ${config.title.toLowerCase()} secundario`,
      estado: 'Activo',
      fechaCreacion: '2024-01-10'
    },
    {
      id: 3,
      codigo: `${type.toUpperCase()}-003`,
      nombre: `${config.title} Especial`,
      descripcion: `Descripción del ${config.title.toLowerCase()} especial`,
      estado: 'Inactivo',
      fechaCreacion: '2024-01-05'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<NomencladorItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = items.filter(item =>
    item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (item: NomencladorItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Está seguro de que desea eliminar este elemento?')) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const handleSave = (formData: FormData) => {
    const itemData = {
      codigo: formData.get('codigo') as string,
      nombre: formData.get('nombre') as string,
      descripcion: formData.get('descripcion') as string,
      estado: formData.get('estado') as 'Activo' | 'Inactivo',
      fechaCreacion: formData.get('fechaCreacion') as string,
    };

    if (editingItem) {
      setItems(items.map(i => 
        i.id === editingItem.id 
          ? { ...editingItem, ...itemData }
          : i
      ));
    } else {
      const newItem = {
        id: Math.max(...items.map(i => i.id)) + 1,
        ...itemData
      };
      setItems([...items, newItem]);
    }

    setShowModal(false);
    setEditingItem(null);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Activo': return 'bg-green-100 text-green-800';
      case 'Inactivo': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nomenclador: {config.title}</h1>
          <p className="text-gray-600">Gestiona los elementos del nomenclador {config.title.toLowerCase()}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors whitespace-nowrap"
        >
          <i className="ri-add-line"></i>
          <span>Nuevo Elemento</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-lg p-2 w-10 h-10 flex items-center justify-center">
              <i className={`${config.icon} text-white`}></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-lg font-semibold text-gray-900">{items.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-2 w-10 h-10 flex items-center justify-center">
              <i className="ri-check-line text-white"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Activos</p>
              <p className="text-lg font-semibold text-gray-900">
                {items.filter(i => i.estado === 'Activo').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-red-500 rounded-lg p-2 w-10 h-10 flex items-center justify-center">
              <i className="ri-close-line text-white"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Inactivos</p>
              <p className="text-lg font-semibold text-gray-900">
                {items.filter(i => i.estado === 'Inactivo').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Buscar por código, nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm pr-8">
              <option value="">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Creación
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.codigo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.nombre}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.descripcion}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(item.estado)}`}>
                      {item.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(item.fechaCreacion).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingItem ? 'Editar Elemento' : 'Nuevo Elemento'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSave(new FormData(e.currentTarget));
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código
                  </label>
                  <input
                    type="text"
                    name="codigo"
                    defaultValue={editingItem?.codigo || `${type.toUpperCase()}-${String(items.length + 1).padStart(3, '0')}`}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    defaultValue={editingItem?.nombre || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    defaultValue={editingItem?.descripcion || ''}
                    required
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    name="estado"
                    defaultValue={editingItem?.estado || 'Activo'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm pr-8"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Creación
                  </label>
                  <input
                    type="date"
                    name="fechaCreacion"
                    defaultValue={editingItem?.fechaCreacion || new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors whitespace-nowrap"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap"
                >
                  {editingItem ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
