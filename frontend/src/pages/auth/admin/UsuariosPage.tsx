import { useState, useEffect } from 'react';
import type {
    Usuario,
    CreateUsuarioRequest,
    UpdateUsuarioRequest,
    PaginatedResponse
} from '../../../services/usuariosService';
import { usuariosService } from '../../../services/usuariosService';

// Components
import {
    UsuariosHeader,
    UsuariosError,
    UsuariosStats,
    UsuariosFilters,
    UsuariosTable,
    UsuariosPagination,
    UsuariosModal,
    UsuariosConfirmModal
} from '../../../components/usuarios';

export default function UsuariosPage() {
    // Estados principales
    const [items, setItems] = useState<Usuario[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1,
    });
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Usuario | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [saving, setSaving] = useState(false);

    // Estados para la confirmación de eliminación
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Nuevos estados para eliminación múltiple
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showMultipleConfirmModal, setShowMultipleConfirmModal] = useState(false);
    const [deletingMultiple, setDeletingMultiple] = useState(false);

    // Cargar datos iniciales
    useEffect(() => {
        loadUsuarios();
    }, []);

    // Cargar usuarios cuando cambia el término de búsqueda
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadUsuarios(1, pagination.limit, searchTerm);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Limpiar selección cuando cambian los items
    useEffect(() => {
        if (items.length === 0) {
            setSelectedIds([]);
        }
    }, [items]);

    const loadUsuarios = async (page: number = 1, limit: number = 10, search: string = '') => {
        try {
            setLoading(true);
            setError('');

            console.log('📡 Cargando usuarios con parámetros:', { page, limit, search });

            const response: PaginatedResponse<Usuario> = await usuariosService.getUsuarios(
                page,
                limit,
                search
            );

            console.log('Usuarios cargados:', {
                cantidad: response.data.length,
                pagination: response.pagination
            });

            setItems(response.data);
            setPagination(response.pagination);
        } catch (err: unknown) {
            // Tipar correctamente el error
            let errorMsg = 'Error al cargar los usuarios.';

            // Verificar si es un error de Axios
            if (typeof err === 'object' && err !== null && 'response' in err) {
                const axiosError = err as {
                    response?: {
                        data?: {
                            message?: string;
                        };
                        status?: number;
                    };
                    message?: string;
                };

                if (axiosError.response?.data?.message) {
                    // Usa el mensaje del backend
                    errorMsg = axiosError.response.data.message;
                } else if (axiosError.message) {
                    // Usa el mensaje del error
                    errorMsg = axiosError.message;
                } else if (axiosError.response?.status === 403) {
                    errorMsg = 'No tienes permisos para acceder a esta sección.';
                }
            }
            // Verificar si es un Error estándar
            else if (err instanceof Error) {
                errorMsg = err.message;
            }

            setError(errorMsg);
            console.error('Error loading usuarios:', err);
        } finally {
            setLoading(false);
        }
    };

    // Funciones de paginación
    const goToPage = (page: number) => {
        if (page >= 1 && page <= pagination.pages) {
            console.log('Cambiando a página:', page);
            loadUsuarios(page, pagination.limit, searchTerm);
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

    const handleLimitChange = (newLimit: number) => {
        console.log('Cambiando límite por página a:', newLimit);
        loadUsuarios(1, newLimit, searchTerm);
    };

    // ===== FUNCIONES DE ELIMINACIÓN MÚLTIPLE =====
    const handleSelectionChange = (ids: number[]) => {
        console.log('Cambio en selección:', ids);
        setSelectedIds(ids);
    };

    const handleDeleteMultiple = () => {
        if (selectedIds.length === 0) {
            setError('Por favor, selecciona al menos un usuario para eliminar');
            setTimeout(() => setError(''), 3000);
            return;
        }
        
        console.log('Solicitando eliminación múltiple para IDs:', selectedIds);
        setShowMultipleConfirmModal(true);
    };

    const handleConfirmDeleteMultiple = async () => {
        console.log('Confirmando eliminación múltiple para IDs:', selectedIds);

        try {
            setDeletingMultiple(true);
            setError('');

            const result = await usuariosService.deleteUsuariosMultiple(selectedIds);
            console.log('🗑️ Eliminación múltiple exitosa:', result);

            // Actualizar la lista local
            setItems(prev => prev.filter(user => !selectedIds.includes(user.id_usuario)));
            
            // Actualizar el total
            setPagination(prev => ({
                ...prev,
                total: prev.total - result.eliminados
            }));
            
            // Limpiar selección
            setSelectedIds([]);

            // Mostrar mensaje de éxito
            setError(`✓ Se eliminaron ${result.eliminados} de ${result.totalSolicitados} usuario(s) correctamente`);
            setTimeout(() => setError(''), 3000);

        } catch (err: any) {
            console.error('Error en eliminación múltiple:', err);
            const errorMessage = err?.response?.data?.error || err?.message || 'Error al eliminar los usuarios';
            setError(errorMessage);
        } finally {
            setDeletingMultiple(false);
            setShowMultipleConfirmModal(false);
        }
    };

    const handleCancelDeleteMultiple = () => {
        console.log('Eliminación múltiple cancelada');
        setShowMultipleConfirmModal(false);
    };

    // ===== FUNCIONES DE ELIMINACIÓN INDIVIDUAL =====
    const handleDelete = (id: number) => {
        console.log('Solicitando eliminación individual para ID:', id);
        setItemToDelete(id);
        setShowConfirmModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        console.log('Confirmando eliminación individual para ID:', itemToDelete);

        try {
            setDeleting(true);
            setError('');

            await usuariosService.deleteUsuario(itemToDelete);
            console.log('🗑️ Eliminación individual exitosa');

            // Actualizar la lista local
            setItems(prev => prev.filter(user => user.id_usuario !== itemToDelete));
            
            // Actualizar el total
            setPagination(prev => ({
                ...prev,
                total: prev.total - 1
            }));

        } catch (err: any) {
            console.error('Error en eliminación individual:', err);
            const errorMessage = err?.response?.data?.error || err?.message || 'Error al eliminar el usuario';
            setError(errorMessage);
        } finally {
            setDeleting(false);
            setShowConfirmModal(false);
            setItemToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        console.log('Eliminación individual cancelada');
        setShowConfirmModal(false);
        setItemToDelete(null);
    };

    // Funciones para editar y guardar
    const handleEdit = (item: Usuario) => {
        console.log('✏️ Editando usuario:', item.email);
        setEditingItem(item);
        setShowModal(true);
    };

    const handleSave = async (formData: FormData) => {
        try {
            setSaving(true);
            setError('');

            console.log('Guardando datos del formulario...');

            const roles = formData.getAll('roles').map(role => parseInt(role as string));

            if (editingItem) {
                // Para actualización
                const updateData: UpdateUsuarioRequest = {
                    email: formData.get('email') as string,
                    nombre: formData.get('nombre') as string,
                    apellidos: formData.get('apellidos') as string,
                    activo: formData.get('activo') === 'true',
                    roles: roles.length > 0 ? roles : undefined
                };

                // Solo agregar contraseña si se proporcionó una nueva
                const nuevaPassword = formData.get('password') as string;
                if (nuevaPassword && nuevaPassword.trim() !== '') {
                    updateData.password = nuevaPassword;
                }

                console.log('Datos para actualizar:', updateData);
                const updatedUser = await usuariosService.updateUsuario(editingItem.id_usuario, updateData);
                
                // Actualizar en la lista local
                setItems(prev => prev.map(item => 
                    item.id_usuario === updatedUser.id_usuario ? updatedUser : item
                ));
            } else {
                // Para creación
                const createData: CreateUsuarioRequest = {
                    email: formData.get('email') as string,
                    password: formData.get('password') as string,
                    nombre: formData.get('nombre') as string,
                    apellidos: formData.get('apellidos') as string,
                    activo: formData.get('activo') === 'true',
                    roles: roles.length > 0 ? roles : undefined
                };

                console.log('Datos para crear:', createData);
                const newUser = await usuariosService.createUsuario(createData);
                
                // Agregar a la lista local
                setItems(prev => [newUser, ...prev]);
                setPagination(prev => ({
                    ...prev,
                    total: prev.total + 1
                }));
            }

            setShowModal(false);
            setEditingItem(null);
        } catch (err: any) {
            console.error('Error saving usuario:', err);
            const errorMessage = err?.response?.data?.error || err?.message ||
                (editingItem ? 'Error al actualizar el usuario' : 'Error al crear el usuario');
            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleCloseModal = () => {
        console.log('Cerrando modal de usuario');
        setShowModal(false);
        setEditingItem(null);
    };

    // Manejar refresco desde filtros
    const handleRefresh = () => {
        console.log('Refrescando lista de usuarios');
        loadUsuarios(pagination.page, pagination.limit, searchTerm);
        // Limpiar selección al refrescar
        setSelectedIds([]);
    };

    // Loading state inicial
    if (loading && items.length === 0) {
        return (
            <div className="p-6 flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <i className="ri-loader-4-line animate-spin text-3xl text-blue-600 mb-4"></i>
                    <p className="text-gray-600 text-lg">Cargando usuarios...</p>
                    <p className="text-gray-400 text-sm mt-2">Por favor espere</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
                        <p className="text-gray-600">Administra los usuarios, roles y permisos del sistema</p>
                    </div>
                    
                    <div className="flex space-x-3">
                        <button
                            onClick={() => {
                                console.log('Abriendo modal para nuevo usuario');
                                setShowModal(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors whitespace-nowrap"
                        >
                            <i className="ri-add-line"></i>
                            <span>Nuevo Usuario</span>
                        </button>
                    </div>
                </div>
                
                {/* Barra de selección múltiple */}
                {selectedIds.length > 0 && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <i className="ri-checkbox-multiple-line text-blue-600 mr-3 text-xl"></i>
                                <div>
                                    <p className="font-medium text-blue-800">
                                        {selectedIds.length} usuario(s) seleccionado(s)
                                    </p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleDeleteMultiple}
                                    disabled={deletingMultiple}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded flex items-center space-x-2 disabled:opacity-50"
                                >
                                    {deletingMultiple ? (
                                        <>
                                            <i className="ri-loader-4-line animate-spin"></i>
                                            <span>Eliminando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="ri-delete-bin-line"></i>
                                            <span>Eliminar seleccionados</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setSelectedIds([])}
                                    className="px-4 py-2 border border-blue-300 text-blue-700 bg-white hover:bg-blue-50 rounded"
                                >
                                    <i className="ri-close-line mr-1"></i>
                                    Cancelar selección
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Error */}
            <UsuariosError
                error={error}
                onClose={() => {
                    console.log('Cerrando mensaje de error');
                    setError('');
                }}
            />

            {/* Stats */}
            <UsuariosStats
                total={pagination.total}
                showing={items.length}
                page={pagination.page}
                pages={pagination.pages}
                limit={pagination.limit}
            />

            {/* Filters */}
            <UsuariosFilters
                searchTerm={searchTerm}
                onSearchChange={(term) => {
                    console.log('Buscando por:', term);
                    setSearchTerm(term);
                    // Limpiar selección al buscar
                    setSelectedIds([]);
                }}
                onRefresh={handleRefresh}
            />

            {/* Table - con checkbox de selección múltiple */}
            <UsuariosTable
                items={items}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading && items.length > 0}
                // Pasar props para selección múltiple
                onSelectionChange={handleSelectionChange}
                selectedIds={selectedIds}
            />

            {/* Pagination */}
            {pagination.pages > 1 && (
                <UsuariosPagination
                    pagination={pagination}
                    onPageChange={goToPage}
                    onLimitChange={handleLimitChange}
                    onNext={nextPage}
                    onPrev={prevPage}
                />
            )}

            {/* Modal de Crear/Editar */}
            <UsuariosModal
                show={showModal}
                editingItem={editingItem}
                saving={saving}
                onClose={handleCloseModal}
                onSave={handleSave}
            />

            {/* Modal de Confirmación de Eliminación Individual */}
            <UsuariosConfirmModal
                show={showConfirmModal}
                title="Confirmar Eliminación"
                message="¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer."
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                loading={deleting}
            />

            {/* Modal de Confirmación de Eliminación Múltiple */}
            <UsuariosConfirmModal
                show={showMultipleConfirmModal}
                title={`Eliminar ${selectedIds.length} usuario(s)`}
                message={`¿Está seguro de que desea eliminar los ${selectedIds.length} usuario(s) seleccionado(s)? Esta acción no se puede deshacer.`}
                onConfirm={handleConfirmDeleteMultiple}
                onCancel={handleCancelDeleteMultiple}
                confirmText={deletingMultiple ? "Eliminando..." : `Sí, eliminar ${selectedIds.length} usuario(s)`}
                cancelText="Cancelar"
                loading={deletingMultiple}
            />

            {/* Estado vacío */}
            {!loading && items.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow mt-4">
                    <i className="ri-user-line text-4xl text-gray-400 mb-3"></i>
                    <h3 className="text-lg font-medium text-gray-700">No se encontraron usuarios</h3>
                    <p className="text-gray-500 mt-1 mb-4">
                        {searchTerm
                            ? 'Intenta con otros términos de búsqueda'
                            : 'No hay usuarios registrados en el sistema'}
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 mx-auto"
                        >
                            <i className="ri-add-line"></i>
                            <span>Crear primer usuario</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}