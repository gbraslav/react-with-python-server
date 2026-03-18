import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import Dashboard from '@/components/Dashboard'
import LoginPage from '@/components/LoginPage'
import SignUpPage from '@/components/SignUpPage'
import ForgotPasswordPage from '@/components/ForgotPasswordPage'
import SignOutPage from '@/components/SignOutPage'
import type { ReactNode } from 'react'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />
        <Route path="/forgot" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        <Route path="/signout" element={<SignOutPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  )
}

export default App
