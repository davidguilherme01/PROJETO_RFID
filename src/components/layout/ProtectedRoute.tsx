import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { useAuthStore } from '@/store/authStore'
import type { PerfilUsuario } from '@/types'

interface ProtectedRouteProps {
  allowedPerfis: PerfilUsuario[]
}

export function ProtectedRoute({ allowedPerfis }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (!isAuthenticated || !usuario) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (!allowedPerfis.includes(usuario.perfil)) {
    return <Navigate to={ROUTES.SEM_ACESSO} replace />
  }

  return <Outlet />
}
