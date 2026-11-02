import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import UsuariosPage from './UsuariosPage';
import RolesPage from './RolesPage';
import PermisosPage from './PermisosPage';

type Tab = 'usuarios' | 'roles' | 'permisos';

const TABS: { id: Tab; label: string; permission: string }[] = [
    { id: 'usuarios', label: 'Usuarios', permission: 'usuarios.ver' },
    { id: 'roles', label: 'Roles', permission: 'roles.ver' },
    { id: 'permisos', label: 'Permisos', permission: 'permisos.ver' },
];

export default function AdminPage() {
    const { hasPermission } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('usuarios');

    // Filtrar tabs según permisos del usuario actual
    const availableTabs = TABS.filter(t => hasPermission(t.permission));

    // Si la pestaña actual no tiene permiso, ir a la primera disponible
    useEffect(() => {
        if (!availableTabs.some(t => t.id === activeTab) && availableTabs.length > 0) {
            setActiveTab(availableTabs[0].id);
        }
    }, [availableTabs, activeTab]);

    if (availableTabs.length === 0) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <i className="ri-lock-line text-4xl text-gray-400 mb-3"></i>
                    <h3 className="text-lg font-medium text-gray-700">Acceso denegado</h3>
                    <p className="text-gray-500 mt-1">No tienes permisos para acceder al panel de administración.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-gray-600">Gestión integral de usuarios, roles y permisos</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <nav className="border-b border-gray-200" aria-label="Pestañas de administración">
                    <ul className="flex -mb-px overflow-x-auto" role="tablist">
                        {availableTabs.map(tab => (
                            <li key={tab.id} role="presentation">
                                <button
                                    role="tab"
                                    aria-selected={activeTab === tab.id}
                                    aria-controls={`panel-${tab.id}`}
                                    id={`tab-${tab.id}`}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                        activeTab === tab.id
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Paneles de contenido */}
                <div className="p-6" role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
                    {activeTab === 'usuarios' && <UsuariosPage />}
                    {activeTab === 'roles' && <RolesPage />}
                    {activeTab === 'permisos' && <PermisosPage />}
                </div>
            </div>
        </div>
    );
}