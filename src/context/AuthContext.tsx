import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { authClient } from '@/lib/auth'

interface User {
  id: string
  email: string
  name?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  signup: (email: string, password: string, name: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!user

  useEffect(() => {
    authClient.getSession().then(({ data, error }) => {
      if (!error && data?.session) {
        setUser(data.user as User)
        setToken(data.session.token)
        localStorage.setItem('auth_token', data.session.token)
      }
      setLoading(false)
    })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await authClient.signIn.email({ email, password })
    if (error) return { error: error.message || 'Login failed' }
    const session = await authClient.getSession()
    if (session.error || !session.data?.session) return { error: 'Failed to get session' }
    setUser(session.data.user as User)
    setToken(session.data.session.token)
    localStorage.setItem('auth_token', session.data.session.token)
    return {}
  }, [])

  const signup = useCallback(async (email: string, password: string, name: string) => {
    const { data, error } = await authClient.signUp.email({ email, password, name })
    if (error) return { error: error.message || 'Signup failed' }
    const session = await authClient.getSession()
    if (session.error || !session.data?.session) return { error: 'Failed to get session' }
    setUser(session.data.user as User)
    setToken(session.data.session.token)
    localStorage.setItem('auth_token', session.data.session.token)
    return {}
  }, [])

  const logout = useCallback(async () => {
    await authClient.signOut()
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
