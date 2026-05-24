import { ArrowLeft, Lock, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'
import { useAuthStore } from '@/store/authStore'

const labelPerfil = {
  administrador: 'Administrador',
  corredor: 'Corredor',
  espectador: 'Espectador',
} as const

export default function SemAcesso() {
  const navigate = useNavigate()
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const perfilAtual = usuario ? labelPerfil[usuario.perfil] : 'desconhecido'

  const handleSair = () => {
    logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/15 text-destructive ring-1 ring-destructive/30">
          <Lock className="h-8 w-8" aria-hidden />
        </span>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Acesso restrito
          </h1>
          <p className="text-sm text-muted-foreground">
            Esta página não está disponível para o seu perfil
            <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground">
              {perfilAtual}
            </span>
            .
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button
            variant="destructive"
            className="flex-1 gap-2"
            onClick={handleSair}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  )
}
