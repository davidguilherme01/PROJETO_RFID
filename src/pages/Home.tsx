import { Navigate } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { useAuthStore } from '@/store/authStore'

// Roteador inteligente de boas-vindas: cada perfil tem uma rota inicial diferente.
const homePorPerfil = {
  administrador: ROUTES.ADMIN.DASHBOARD,
  corredor: ROUTES.CORREDOR.DESEMPENHO,
  espectador: ROUTES.ESPECTADOR.RANKING,
} as const

export default function Home() {
  const usuario = useAuthStore((s) => s.usuario)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (!isAuthenticated || !usuario) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return <Navigate to={homePorPerfil[usuario.perfil]} replace />
}
