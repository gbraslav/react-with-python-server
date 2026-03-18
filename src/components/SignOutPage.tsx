import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function SignOutPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    logout().then(() => navigate('/login', { replace: true }))
  }, [logout, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Signing out...</p>
    </div>
  )
}
