import { useState, useEffect } from 'react';
import type {
  ClasificacionItem,
  CreateClasificacionRequest,
  PaginatedResponse
} from '../services/clasificacionService';
import { clasificacionService } from '../services/clasificacionService';

interface ClasificacionModuleProps {
  type: string;
}

export default function ClasificacionModule({ type }: ClasificacionModuleProps) {
  const nomencladorConfig = {
    clasificacion: { title: 'Clasificación', icon: 'ri-price-tag-3-line' },
  };

  const config = nomencladorConfig[type as keyof typeof nomencladorConfig] || { title: 'Clasificacion', icon: 'ri-settings-line' };

  // Estados
  const [items, setItems] = useState<ClasificacionItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ClasificacionItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // Cargar datos desde la API cuando el componente se monta o cambia el tipo
  useEffect(() => {
    loadClasificaciones();
  }, [type]);

  // Función para cargar las clasificaciones desde la API
  const loadClasificaciones = async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      setError('');
      const response: PaginatedResponse<ClasificacionItem> = await clasificacionService.getClasificaciones(type, page, limit);

      console.log('Respuesta de la API:', response); // Para debug

      setItems(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError('Error al cargar las clasificaciones');
      console.error('Error loading classifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Funciones de paginación
  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.pages) {
      loadClasificaciones(page, pagination.limit);
    }
  };

  const nextPage = () => {
    if (pagination.page < pagination.pages) {
      goToPage(pagination.page + 1);
    }
  };

  const prevPage = () => {
    if (pagination.page > 1) {
      goToPage(pagination.page - 1);
    }
  };

  // Filtrar items basado en la búsqueda
  const filteredItems = items.filter(item =>
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para editar un item
  const handleEdit = (item: ClasificacionItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  // Función para eliminar un item
  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de que desea eliminar este elemento?')) {
      try {
        await clasificacionService.deleteClasificacion(id);
        // Recargar la página actual después de eliminar
        loadClasificaciones(pagination.page, pagination.limit);
      } catch (err) {
        setError('Error al eliminar la clasificación');
        console.error('Error deleting classification:', err);
      }
    }
  };

  // Función para guardar
  const handleSave = async (formData: FormData) => {
    try {
      setSaving(true);
      setError('');

      // Crear el objeto con los nombres correctos
      const itemData: CreateClasificacionRequest = {
        nombre: formData.get('nombre') as string, // Cambiado de 'nombre' a 'clasi'
        tipo: type
      };

      if (editingItem) {
        await clasificacionService.updateClasificacion(editingItem.id_clasificacion, itemData);
      } else {
        await clasificacionService.createClasificacion(itemData);
      }

      // Recargar los datos después de guardar
      loadClasificaciones(pagination.page, pagination.limit);
      setShowModal(false);
      setEditingItem(null);
    } catch (err) {
      setError(editingItem ? 'Error al actualizar la clasificación' : 'Error al crear la clasificación');
      console.error('Error saving classification:', err);
    } finally {
      setSaving(false);
    }
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-2xl text-blue-600 mb-2"></i>
          <p className="text-gray-600">Cargando clasificaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clasificacion: {config.title}</h1>
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

      {/* Mostrar error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <i className="ri-error-warning-line text-red-500 mr-2"></i>
            <span className="text-red-700">{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <i className="ri-close-line"></i>
            </button>
          </div>
        </div>
      )}

      {/* Stats - Actualizado para mostrar paginación */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-lg p-2 w-10 h-10 flex items-center justify-center">
              <i className={`${config.icon} text-white`}></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total General</p>
              <p className="text-lg font-semibold text-gray-900">{pagination.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-2 w-10 h-10 flex items-center justify-center">
              <i className="ri-eye-line text-white"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Mostrando</p>
              <p className="text-lg font-semibold text-gray-900">{items.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-purple-500 rounded-lg p-2 w-10 h-10 flex items-center justify-center">
              <i className="ri-file-list-line text-white"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Página</p>
              <p className="text-lg font-semibold text-gray-900">{pagination.page} / {pagination.pages}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search y Controles */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => loadClasificaciones()}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center space-x-2 transition-colors"
              title="Actualizar lista"
            >
              <i className="ri-refresh-line"></i>
              <span>Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
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
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    <i className="ri-inbox-line text-3xl mb-2 block"></i>
                    {items.length === 0 ? 'No hay clasificaciones registradas' : 'No se encontraron resultados'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id_clasificacion} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.nombre} {/* Cambiado de item.nombre a item.nombre */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id_clasificacion)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Eliminar"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Controles de paginación - SOLO si hay más de una página */}
      {pagination.pages > 1 && (
        <div className="bg-white rounded-lg shadow p-4 mt-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600">
              Mostrando {items.length} de {pagination.total} elementos
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={prevPage}
                disabled={pagination.page === 1}
                className={`px-3 py-1 rounded-lg border ${pagination.page > 1
                  ? 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
                  : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                <i className="ri-arrow-left-line"></i>
              </button>

              <span className="text-sm text-gray-600">
                Página {pagination.page} de {pagination.pages}
              </span>

              <button
                onClick={nextPage}
                disabled={pagination.page === pagination.pages}
                className={`px-3 py-1 rounded-lg border ${pagination.page < pagination.pages
                  ? 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
                  : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                <i className="ri-arrow-right-line"></i>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Items por página:</span>
              <select
                value={pagination.limit}
                onChange={(e) => loadClasificaciones(1, parseInt(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear/editar */}
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
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors whitespace-nowrap"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap flex items-center space-x-2"
                  disabled={saving}
                >
                  {saving && <i className="ri-loader-4-line animate-spin"></i>}
                  <span>{editingItem ? 'Actualizar' : 'Crear'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}