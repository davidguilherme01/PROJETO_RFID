import { LogOut, Settings, UserCog } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ROUTES } from '@/lib/constants'
import { useAuthStore } from '@/store/authStore'
import type { PerfilUsuario } from '@/types'

interface UserMenuProps {
  trigger: ReactNode
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
}

const perfisDemo: { perfil: PerfilUsuario; label: string }[] = [
  { perfil: 'administrador', label: 'Administrador' },
  { perfil: 'corredor', label: 'Corredor' },
  { perfil: 'espectador', label: 'Espectador' },
]

export function UserMenu({ trigger, align = 'end', side = 'bottom' }: UserMenuProps) {
  const navigate = useNavigate()
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const loginDemo = useAuthStore((s) => s.loginDemo)

  if (!usuario) return null

  const handleSair = () => {
    logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  const handleTrocarDemo = (perfil: PerfilUsuario) => {
    loginDemo(perfil)
    navigate(ROUTES.HOME, { replace: true })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={side} className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">
            {usuario.nome}
          </span>
          <span className="text-xs font-normal text-muted-foreground">
            {usuario.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2">
          <Settings className="h-4 w-4" />
          Configurações
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <UserCog className="h-4 w-4" />
            Trocar perfil de demo
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="w-52">
              {perfisDemo.map(({ perfil, label }) => (
                <DropdownMenuItem
                  key={perfil}
                  disabled={perfil === usuario.perfil}
                  onSelect={() => handleTrocarDemo(perfil)}
                >
                  <span className="flex items-center gap-2">
                    {label}
                    {perfil === usuario.perfil && (
                      <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                        atual
                      </span>
                    )}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={handleSair}
          className="gap-2 text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
