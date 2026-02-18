// src/hooks/useAuth.ts
import { useState, useEffect } from 'react'

// Tipos locales
export type User = {
  id_usuario: string
  password_hash: string
  nombre: string
  apellidos: string
  email?: string
  activo: boolean
  created_at?: string
  updated_at?: string
}

export type Profile = {
  id_usuario: string
  password_hash: string
  nombre: string
  apellidos: string
  email?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar sesión al cargar
    checkSession()
    
    // También puedes verificar cada X tiempo
    const interval = setInterval(checkSession, 5 * 60 * 1000) // 5 minutos
    
    return () => clearInterval(interval)
  }, [])

  const checkSession = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        setLoading(false)
        return
      }

      // Llamar a tu backend Express para verificar sesión
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setProfile(data.profile)
      } else {
        // Token inválido
        localStorage.removeItem('token')
        setUser(null)
        setProfile(null)
      }
    } catch (error) {
      console.error('Error checking session:', error)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (
    email: string, 
    password: string, 
    userData: {
      usuario: string
      nombre: string
      apellidos: string
    }
  ) => {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        ...userData
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Error en registro')
    }

    // Guardar token
    if (data.token) {
      localStorage.setItem('token', data.token)
      setUser(data.user)
      setProfile(data.profile)
    }

    return data
  }

  const signIn = async (email: string, password: string) => {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Error en login')
    }

    // Guardar token
    if (data.token) {
      localStorage.setItem('token', data.token)
      setUser(data.user)
      setProfile(data.profile)
    }

    return data
  }

  const signOut = async () => {
    // Opcional: llamar a backend para logout
    try {
      const token = localStorage.getItem('token')
      if (token) {
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
    } catch (error) {
      console.error('Error in logout:', error)
    } finally {
      // Limpiar siempre
      localStorage.removeItem('token')
      setUser(null)
      setProfile(null)
    }
  }

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
  }
}