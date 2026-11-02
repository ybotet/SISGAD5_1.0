import { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfilePage() {
    const { usuario, setUser } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        nombre: '',
        apellidos: '',
        email: '',
        activo: true,
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    // Estado para cambio de contraseña
    const [pwdForm, setPwdForm] = useState({
        password_actual: '',
        password_nueva: '',
        password_confirmar: '',
    });
    const [pwdLoading, setPwdLoading] = useState(false);
    const [pwdError, setPwdError] = useState<string>('');
    const [pwdSuccess, setPwdSuccess] = useState<string>('');

    // Cargar perfil al montar
    useEffect(() => {
        if (!usuario) return;
        setLoading(true);
        authService.getPerfil()
            .then((u: any) => {
                setProfile(u);
                setForm({
                    nombre: u.nombre || '',
                    apellidos: u.apellidos || '',
                    email: u.email || '',
                    activo: u.activo ?? true,
                });
            })
            .catch((err: any) => console.error('Error loading perfil', err))
            .finally(() => setLoading(false));
    }, [usuario]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement & { checked?: boolean };
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        setError('');
        setSuccess('');
    };

    const handlePwdInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPwdForm((prev) => ({
            ...prev,
            [name]: value,
        }));
        setPwdError('');
        setPwdSuccess('');
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!usuario) return;

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const updated = await authService.actualizarPerfil(usuario.id_usuario, {
                email: form.email,
                nombre: form.nombre,
                apellidos: form.apellidos,
                activo: form.activo,
            });

            // Refrescar estado global y localStorage
            setUser(updated);
            setProfile(updated);
            setForm({
                nombre: updated.nombre || '',
                apellidos: updated.apellidos || '',
                email: updated.email || '',
                activo: updated.activo ?? true,
            });

            setSuccess('Perfil actualizado correctamente');
            setEditing(false);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                'Error al actualizar el perfil'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!usuario) return;

        setPwdLoading(true);
        setPwdError('');
        setPwdSuccess('');

        if (pwdForm.password_nueva !== pwdForm.password_confirmar) {
            setPwdError('La nueva contraseña y su confirmación no coinciden');
            setPwdLoading(false);
            return;
        }

        try {
            await authService.cambiarPassword({
                password_actual: pwdForm.password_actual,
                password_nueva: pwdForm.password_nueva,
            });

            setPwdSuccess('Contraseña actualizada correctamente. Todas las sesiones activas han sido revocadas.');
            setPwdForm({ password_actual: '', password_nueva: '', password_confirmar: '' });
        } catch (err: any) {
            setPwdError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                'Error al cambiar la contraseña'
            );
        } finally {
            setPwdLoading(false);
        }
    };

    if (loading && !profile) return <div className="p-6">Cargando perfil...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Mi Perfil</h1>

            {/* Mensajes */}
            {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
                    {success}
                </div>
            )}
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                    {error}
                </div>
            )}

            {/* Datos del perfil */}
            <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
                <h2 className="text-lg font-semibold mb-4">
                    {editing ? 'Editar Perfil' : 'Datos del Perfil'}
                </h2>

                {editing ? (
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={form.nombre}
                                    onChange={handleInputChange}
                                    required
                                    disabled={saving}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
                                <input
                                    type="text"
                                    name="apellidos"
                                    value={form.apellidos}
                                    onChange={handleInputChange}
                                    required
                                    disabled={saving}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleInputChange}
                                    required
                                    disabled={saving}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                <select
                                    name="activo"
                                    value={String(form.activo)}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                >
                                    <option value="true">Activo</option>
                                    <option value="false">Inactivo</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setEditing(false)}
                                disabled={saving}
                                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
                            >
                                {saving ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-3">
                        <p><strong>Nombre:</strong> {profile?.nombre ?? usuario?.nombre}</p>
                        <p><strong>Apellidos:</strong> {profile?.apellidos ?? usuario?.apellidos}</p>
                        <p><strong>Email:</strong> {profile?.email ?? usuario?.email}</p>
                        <p><strong>Activo:</strong> {(profile as any)?.activo ?? (usuario as any)?.activo ? 'Sí' : 'No'}</p>
                        <p className="mt-2"><strong>Roles:</strong> {((profile as any)?.tb_rol ?? (usuario as any)?.Rols ?? []).map((r: any) => r.nombre).join(', ')}</p>
                    </div>
                )}

                <div className="mt-4 flex gap-2">
                    <button
                        onClick={() => setEditing(!editing)}
                        disabled={saving}
                        className={`px-4 py-2 rounded font-medium transition-colors ${
                            editing
                                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                        {editing ? 'Cancelar edición' : 'Editar perfil'}
                    </button>
                </div>
            </div>

            {/* Cambio de contraseña */}
            <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <i className="ri-password-line text-blue-500 mt-0.5"></i>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">Cambio de contraseña</h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Actualiza tu contraseña de acceso. Las sesiones activas se revocarán automáticamente.
                        </p>
                        {pwdError && (
                            <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                                {pwdError}
                            </div>
                        )}
                        {pwdSuccess && (
                            <div className="mb-3 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
                                {pwdSuccess}
                            </div>
                        )}
                        <form onSubmit={handleChangePassword} className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Contraseña actual *</label>
                                <input
                                    type="password"
                                    name="password_actual"
                                    value={pwdForm.password_actual}
                                    onChange={handlePwdInputChange}
                                    required
                                    disabled={pwdLoading}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Nueva contraseña *</label>
                                <input
                                    type="password"
                                    name="password_nueva"
                                    value={pwdForm.password_nueva}
                                    onChange={handlePwdInputChange}
                                    required
                                    disabled={pwdLoading}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Confirmar nueva contraseña *</label>
                                <input
                                    type="password"
                                    name="password_confirmar"
                                    value={pwdForm.password_confirmar}
                                    onChange={handlePwdInputChange}
                                    required
                                    disabled={pwdLoading}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={pwdLoading}
                                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
                            >
                                {pwdLoading ? 'Cambiando...' : 'Cambiar contraseña'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}