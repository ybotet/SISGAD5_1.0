import type { Usuario, Rol } from '../../services/usuariosService';
import { useState, useEffect } from 'react';
import { usuariosService } from '../../services/usuariosService';

interface UsuariosModalProps {
  show: boolean;
  editingItem: Usuario | null;
  saving: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => void;
}

export default function UsuariosModal({
  show,
  editingItem,
  saving,
  onClose,
  onSave
}: UsuariosModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    apellidos: '',
    activo: 'true',
    roles: [] as string[]
  });

  const [roles, setRoles] = useState<Rol[]>([]);
  const [loadingCombos, setLoadingCombos] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar combos al abrir el modal
  useEffect(() => {
    if (show) {
      loadCombos();
    }
  }, [show]);

  // Actualizar formData cuando cambia editingItem
  useEffect(() => {
    if (editingItem) {
      const ids = editingItem.tb_rol?.map(rol => rol.id_rol.toString()) || [];
      const uniqueIds = Array.from(new Set(ids));
      setFormData({
        email: editingItem.email || '',
        password: '', // No mostrar contraseña existente
        confirmPassword: '',
        nombre: editingItem.nombre || '',
        apellidos: editingItem.apellidos || '',
        activo: editingItem.activo ? 'true' : 'false',
        roles: uniqueIds
      });
    } else {
      // Resetear formulario para nuevo usuario
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        nombre: '',
        apellidos: '',
        activo: 'true',
        roles: []
      });
    }
    setErrors({});
  }, [editingItem]);

  const loadCombos = async () => {
    try {
      setLoadingCombos(true);
      const rolesData = await usuariosService.getRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Error cargando combos:', error);
    } finally {
      setLoadingCombos(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!editingItem) {
      if (!formData.password.trim()) {
        newErrors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSave(new FormData(e.currentTarget));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      const checked = checkbox.checked;
      const optionValue = checkbox.value;

      if (name === 'roles') {
        setFormData(prev => ({
          ...prev,
          roles: checked
            ? (prev.roles.includes(optionValue) ? prev.roles : [...prev.roles, optionValue])
            : prev.roles.filter(role => role !== optionValue)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      // Limpiar error cuando el usuario empieza a escribir
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {editingItem ? 'Editar Usuario' : 'Nuevo Usuario'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna 1 - Información personal */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={saving}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="usuario@ejemplo.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {!editingItem && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!editingItem}
                      disabled={saving}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="Mínimo 6 caracteres"
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Contraseña *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required={!editingItem}
                      disabled={saving}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="Repite la contraseña"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  disabled={saving}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.nombre ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Ej: Juan"
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellidos *
                </label>
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleInputChange}
                  required
                  disabled={saving}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.apellidos ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Ej: Pérez García"
                />
                {errors.apellidos && (
                  <p className="mt-1 text-sm text-red-600">{errors.apellidos}</p>
                )}
              </div>

            </div>

            {/* Columna 2 - Información adicional */}
            <div className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  name="activo"
                  value={formData.activo}
                  onChange={handleInputChange}
                  disabled={saving}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>

              {/* Selección de roles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roles
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {loadingCombos ? (
                    <div className="text-center py-2">
                      <i className="ri-loader-4-line animate-spin text-blue-600"></i>
                      <p className="text-sm text-gray-500 mt-1">Cargando roles...</p>
                    </div>
                  ) : roles.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center">No hay roles disponibles</p>
                  ) : (
                    roles.map((rol) => (
                      <div key={rol.id_rol} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`role-${rol.id_rol}`}
                          name="roles"
                          value={rol.id_rol.toString()}
                          checked={formData.roles.includes(rol.id_rol.toString())}
                          onChange={handleInputChange}
                          disabled={saving}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`role-${rol.id_rol}`}
                          className="ml-2 text-sm text-gray-700 flex-1"
                        >
                          <span className="font-medium">{rol.nombre}</span>
                          {rol.descripcion && (
                            <span className="text-gray-500 block text-xs">
                              {rol.descripcion}
                            </span>
                          )}
                        </label>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.roles.length} de {roles.length} roles seleccionados
                </p>
              </div>
            </div>
          </div>

          {/* Nota: los roles se envían desde los checkboxes; no renderizamos inputs hidden para evitar duplicados */}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving && <i className="ri-loader-4-line animate-spin"></i>}
              <span>{editingItem ? 'Actualizar' : 'Crear'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}