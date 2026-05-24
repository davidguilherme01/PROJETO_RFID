import {
  LogOut,
  Search,
  Trophy,
  UserPlus,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { ROUTES } from '@/lib/constants'
import { menuPorPerfil } from '@/lib/menuConfig'
import { useAuthStore } from '@/store/authStore'

interface Atalho {
  id: string
  label: string
  icon: LucideIcon
  action: () => void
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate()
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)

  const menuItems = usuario ? menuPorPerfil[usuario.perfil] : []

  const acoesRapidas: Atalho[] = [
    {
      id: 'novo-corredor',
      label: 'Novo corredor',
      icon: UserPlus,
      action: () => navigate(ROUTES.ADMIN.CORREDORES),
    },
    {
      id: 'ver-ranking',
      label: 'Ver ranking',
      icon: Trophy,
      action: () => navigate(ROUTES.ESPECTADOR.RANKING),
    },
    {
      id: 'sair',
      label: 'Sair',
      icon: LogOut,
      action: () => {
        logout()
        navigate(ROUTES.LOGIN, { replace: true })
      },
    },
  ]

  const run = (fn: () => void) => {
    onOpenChange(false)
    // Pequeno delay para o dialog fechar antes da navegação tomar foco.
    requestAnimationFrame(fn)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Paleta de comandos</DialogTitle>
      <DialogDescription className="sr-only">
        Busque por páginas ou execute ações rápidas.
      </DialogDescription>
      <CommandInput placeholder="Busque uma página ou ação..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

        {menuItems.length > 0 && (
          <CommandGroup heading="Navegação">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <CommandItem
                  key={item.path}
                  value={`nav ${item.label}`}
                  onSelect={() => run(() => navigate(item.path))}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </CommandItem>
              )
            })}
          </CommandGroup>
        )}

        <CommandSeparator />

        <CommandGroup heading="Ações rápidas">
          {acoesRapidas.map((a) => {
            const Icon = a.icon
            return (
              <CommandItem
                key={a.id}
                value={`acao ${a.label}`}
                onSelect={() => run(a.action)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {a.label}
                {a.id === 'sair' && (
                  <CommandShortcut>logout</CommandShortcut>
                )}
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

// Hook para registrar o atalho global Ctrl/Cmd + K.
export function useCommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return { open, setOpen, openPalette: () => setOpen(true) }
}

// Re-export do componente de busca em si para o Header.
export { Search }
