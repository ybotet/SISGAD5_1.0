
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';


type MenuItem = {
  id: string;
  name: string;
  icon: string;
  permission?: string;     // permiso opcional
  children?: MenuItem[];
};

export default function Sidebar() {
  const navigate = useNavigate(); // 👈 hook de navegación
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { usuario, logout, hasPermission } = useAuth();


  const menuItems: MenuItem[] = [
    { id: '', name: 'Dashboard', icon: 'ri-dashboard-line' }, // solo autenticado
    {
      id: 'main',
      name: 'Módulos Principales',
      icon: 'ri-folder-line',
      children: [
        { id: 'telefonos', name: 'Teléfonos', icon: 'ri-phone-line', permission: 'telefonos.ver' },
        { id: 'lineas', name: 'Líneas', icon: 'ri-git-branch-line', permission: 'lineas.ver' },
        { id: 'pizarras', name: 'Pizarras', icon: 'ri-dashboard-line', permission: 'pizarras.ver' },
        { id: 'quejas', name: 'Quejas (Incidencias)', icon: 'ri-error-warning-line', permission: 'quejas.ver' },
      ],
    },
    // {
    //   id: 'operaciones',
    //   name: 'Operaciones',
    //   icon: 'ri-briefcase-line',
    //   children: [
    //     { id: 'movimientos', name: 'Movimientos', icon: 'ri-arrow-left-right-line' },
    //   ]
    // },
    {
      id: 'nomencladores',
      name: 'Nomencladores',
      icon: 'ri-settings-3-line',
      children: [
        { id: 'cable', name: 'Cable', icon: 'ri-git-branch-line', permission: 'nomencladores.gestionar' },
        { id: 'clasificacion', name: 'Clasificación', icon: 'ri-price-tag-3-line', permission: 'nomencladores.gestionar' },
        { id: 'clasificadorclave', name: 'Clasificador de Clave', icon: 'ri-key-line', permission: 'nomencladores.gestionar' },
        { id: 'clasifpizarra', name: 'Clasificador de Pizarra', icon: 'ri-layout-grid-line', permission: 'nomencladores.gestionar' },
        { id: 'clave', name: 'Clave', icon: 'ri-key-line', permission: 'nomencladores.gestionar' },
        { id: 'grupostrabajo', name: 'Grupos de Trabajo', icon: 'ri-group-line', permission: 'nomencladores.gestionar' },
        { id: 'mandos', name: 'Mandos', icon: 'ri-remote-control-line', permission: 'nomencladores.gestionar' },
        { id: 'planta', name: 'Plantas', icon: 'ri-building-line', permission: 'nomencladores.gestionar' },
        { id: 'propietarios', name: 'Propietarios', icon: 'ri-user-line', permission: 'nomencladores.gestionar' },
        { id: 'resultadoprueba', name: 'Resultado de la Prueba', icon: 'ri-test-tube-line', permission: 'nomencladores.gestionar' },
        { id: 'senalizaciones', name: 'Señalizaciones', icon: 'ri-signal-tower-line', permission: 'nomencladores.gestionar' },
        { id: 'sistema', name: 'Sistema', icon: 'ri-computer-line', permission: 'nomencladores.gestionar' },
        { id: 'tipolinea', name: 'Tipo de Línea', icon: 'ri-git-branch-line', permission: 'nomencladores.gestionar' },
        { id: 'tipomovimientos', name: 'Tipo de Movimiento', icon: 'ri-arrow-left-right-line', permission: 'nomencladores.gestionar' },
        { id: 'tipopizarra', name: 'Tipo de Pizarra', icon: 'ri-layout-grid-line', permission: 'nomencladores.gestionar' },
        { id: 'tipoqueja', name: 'Tipo de Queja', icon: 'ri-feedback-line', permission: 'nomencladores.gestionar' },

      ]
    },
    { id: 'operarios', name: 'Trabajadores', icon: 'ri-team-line', permission: 'trabajadores.gestionar' },
    { id: 'stats', name: 'Estadísticas', icon: 'ri-bar-chart-line', permission: 'estadisticas.ver' },
    {
      id: 'admin',
      name: 'Panel administrativo',
      icon: 'ri-admin-line',
      children: [
        { id: 'usuarios', name: 'Gestión de usuarios', icon: 'ri-user-settings-line', permission: 'usuarios.ver' },
        // { id: 'roles', name: 'Lista de roles', icon: 'ri-key-line', permission: 'roles.ver' },
      ],
    },
  ];

  // Cambiar el estado inicial para que no estén expandidos por defecto
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleNavigation = (path: string) => {
    navigate(path); // 👈 navega a la ruta
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Helpers para filtrar por permisos
  const canSeeItem = (item: MenuItem): boolean => {
    if (item.permission && !hasPermission(item.permission)) {
      return false;
    }
    if (item.children && item.children.length > 0) {
      return item.children.some(canSeeItem);
    }
    return true;
  };

  const filteredMenuItems = menuItems.filter(canSeeItem);

  const baseUrl = import.meta.env.VITE_BASE_URL || '/';

  return (
    <div className={`text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} min-h-screen`} style={{ backgroundColor: '#083480' }}>
      {/* Header */}
      <div className="p-4 border-b border-blue-800">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <img
                src={`${baseUrl}etecsa.png`}
                alt="SISGAD5 Logo"
                className="w-10 h-10 object-contain bg-white rounded-full p-1"
              />
              <h2 className="text-lg font-semibold">SISGAD5</h2>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded hover:bg-blue-800 transition-colors"
          >
            <i className={`ri-${isCollapsed ? 'menu-unfold' : 'menu-fold'}-line`}></i>
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="p-2">
        {filteredMenuItems.map((item) => (
          <div key={item.id} className="mb-1">
            <button
              onClick={() => {
                if (item.children) {
                  toggleExpanded(item.id);
                } else {
                  handleNavigation(`/sistema/${item.id}`);
                }
              }}
              className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-blue-800 transition-colors`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className={`${item.icon} text-lg`}></i>
                </div>
                {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
              </div>
              {!isCollapsed && item.children && (
                <i className={`ri-arrow-${expandedItems.includes(item.id) ? 'down' : 'right'}-s-line text-sm`}></i>
              )}
            </button>



            {/* Submenus  */}
            {!isCollapsed && item.children && expandedItems.includes(item.id) && (
              <div className="ml-4 mt-1 space-y-1">
                {item.children
                  .filter(canSeeItem) // aquí también filtramos los hijos
                  .map((child) => (
                    <button
                      key={child.id}
                      onClick={() => handleNavigation(`/sistema/${item.id}/${child.id}`)}
                      className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-800 transition-colors text-sm"
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className={`${child.icon} text-sm`}></i>
                      </div>
                      <span>{child.name}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User / Logout */}
      <div className="p-4 border-t border-blue-800 mt-auto">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-white text-blue-800 rounded-full flex items-center justify-center font-semibold">
                {usuario?.nombre?.charAt(0) ?? usuario?.email?.charAt(0) ?? 'U'}
              </div>
              <div>
                <div className="text-sm font-medium" onClick={() => handleNavigation(`/sistema/profile`)}>{usuario?.nombre ? `${usuario.nombre} ${usuario.apellidos ?? ''}` : usuario?.email ?? 'Usuario'}</div>
                <div className="text-xs text-blue-200">{(usuario as any)?.tb_rol ? ((usuario as any).tb_rol[0]?.nombre ?? '') : (usuario as any)?.Rols?.[0]?.nombre ?? ''}</div>
              </div>
            </div>
            <button onClick={() => { logout(); }} title="Cerrar sesión" className="p-2 rounded hover:bg-blue-800">
              <i className="ri-logout-box-r-line"></i>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <button onClick={() => { logout(); }} title="Cerrar sesión" className="p-2 rounded hover:bg-blue-800">
              <i className="ri-logout-box-r-line"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
