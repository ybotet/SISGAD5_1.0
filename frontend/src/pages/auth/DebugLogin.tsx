import { useState } from 'react'
import { authService } from '../../services/authService'
import { useNavigate } from 'react-router-dom'

export default function DebugLogin() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<string | null>(null)
    const navigate = useNavigate()

    const run = async () => {
        setLoading(true)
        setResult(null)
        try {
            const resp = await authService.login({ email: 'test@sisgad.com', password: 'admin123' })
            // backend responde { success, data: { usuario, token } }
            const { usuario, token } = resp.data.data
            authService.setAuthData(token, usuario)
            setResult('Login OK — token guardado en localStorage')
            // navegar a /sistema para comprobar providers
            setTimeout(() => navigate('/sistema'), 600)
        } catch (err: any) {
            setResult('Error: ' + (err?.response?.data?.message || err.message || String(err)))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h2 className="text-xl mb-4">Debug Login</h2>
            <p className="mb-4">Esta página intentará iniciar sesión como <code>test@sisgad.com</code> y guardar el token en <code>localStorage</code>.</p>
            <button onClick={run} className="bg-green-600 text-white px-4 py-2 rounded" disabled={loading}>
                {loading ? 'Probando...' : 'Ejecutar login de prueba'}
            </button>
            {result && <div className="mt-4">{result}</div>}
        </div>
    )
}
