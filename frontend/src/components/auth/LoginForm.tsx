import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

function validarEmail(email: string): string | null {
    const s = email.trim();
    if (!s) return 'El correo es obligatorio';
    if (s.length > 254) return 'El correo no debe exceder 254 caracteres';
    if (!s.includes('@')) return 'El correo debe contener @';
    const [local, domain] = s.split('@');
    if (!local || !domain || !domain.includes('.')) {
        return 'El correo debe tener un dominio válido (ej: usuario@dominio.com)';
    }
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(s)) return 'El correo contiene caracteres no permitidos o formato inválido';
    return null;
}

function validarPassword(password: string): string | null {
    if (password.length === 0) return 'La contraseña es obligatoria';
    if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    if (password.length > 128) return 'La contraseña no debe exceder 128 caracteres';
    if (/\s/.test(password)) return 'La contraseña no debe contener espacios';
    const tieneMinuscula = /[a-z]/.test(password);
    const tieneMayuscula = /[A-Z]/.test(password);
    const tieneNumero = /[0-9]/.test(password);
    if (!tieneMinuscula || !tieneMayuscula || !tieneNumero) {
        return 'La contraseña debe incluir mayúsculas, minúsculas y números';
    }
    return null;
}

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const { login } = useAuth();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setEmailError(null);
        setPasswordError(null);

        const errEmail = validarEmail(email);
        const errPassword = validarPassword(password);
        if (errEmail) {
            setEmailError(errEmail);
            return;
        }
        if (errPassword) {
            setPasswordError(errPassword);
            return;
        }

        try {
            await login(email.trim(), password);
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
                (err as Error)?.message ||
                'Error en inicio de sesión';
            setError(msg);
        }
    };

    return (
        <form onSubmit={onSubmit} className="max-w-md mx-auto p-4">
            <h2 className="text-2xl mb-4">Iniciar sesión</h2>
            {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
            <div className="mb-3">
                <label className="block mb-1">Correo</label>
                <input
                    type="email"
                    autoComplete="email"
                    className={`w-full border px-2 py-1 ${emailError ? 'border-red-500' : ''}`}
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError(null);
                    }}
                />
                {emailError && <div className="text-red-600 text-sm mt-1">{emailError}</div>}
            </div>
            <div className="mb-3">
                <label className="block mb-1">Contraseña</label>
                <input
                    type="password"
                    autoComplete="current-password"
                    className={`w-full border px-2 py-1 ${passwordError ? 'border-red-500' : ''}`}
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError(null);
                    }}
                />
                {passwordError && <div className="text-red-600 text-sm mt-1">{passwordError}</div>}
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
                Entrar
            </button>
        </form>
    );
}
