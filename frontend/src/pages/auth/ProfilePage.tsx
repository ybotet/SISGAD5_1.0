import { useEffect, useState } from 'react'
import { authService } from '../../services/authService'
import { useAuth } from '../../contexts/AuthContext'

export default function ProfilePage() {
    const { usuario } = useAuth()
    const [profile, setProfile] = useState<any>(usuario)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!usuario) return
        setLoading(true)
        authService.getPerfil()
            .then(u => setProfile(u))
            .catch(err => console.error('Error loading perfil', err))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="p-6">Cargando perfil...</div>

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Mi Perfil</h1>
            <div className="bg-white rounded-lg shadow p-4 max-w-md">
                <p><strong>Nombre:</strong> {usuario?.nombre} {profile?.apellidos}</p>
                <p><strong>Email:</strong> {profile?.email}</p>
                <p><strong>Activo:</strong> {profile?.activo ? 'Sí' : 'No'}</p>
                <p className="mt-2"><strong>Roles:</strong> {(profile?.tb_rol ?? profile?.Rols ?? []).map((r: any) => r.nombre).join(', ')}</p>
            </div>
        </div>
    )
}
