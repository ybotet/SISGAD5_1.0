import LoginForm from '../../components/auth/LoginForm'
import { useAuth } from '../../contexts/AuthContext'
// import { Navigate, useNavigate } from 'react-router-dom'
import { Navigate} from 'react-router-dom'

export default function LoginPage() {
    const { isAuthenticated } = useAuth()
    //const navigate = useNavigate()

    if (isAuthenticated) {
        return <Navigate to="/sistema" replace />
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-xl bg-white shadow p-6">
                <LoginForm />
            </div>
        </div>
    )
}
