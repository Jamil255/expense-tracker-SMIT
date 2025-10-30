import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import axios from 'axios'

const AuthCtx = createContext(null)

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
export const api = axios.create({ baseURL: apiBase, withCredentials: true })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      setUser(data.user)
      return { ok: true }
    } catch (e) {
      return { ok: false, message: e.response?.data?.message || 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  const signup = async (name, email, password) => {
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/register', {
        name,
        email,
        password,
      })
      localStorage.setItem('token', data.token)
      setUser(data.user)
      return { ok: true }
    } catch (e) {
      return {
        ok: false,
        message: e.response?.data?.message || 'Signup failed',
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await api.post('/api/auth/logout')
    localStorage.removeItem('token')
    setUser(null)
  }

  useEffect(() => {
    // Future: fetch /me
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, signup, logout }),
    [user, loading]
  )

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
