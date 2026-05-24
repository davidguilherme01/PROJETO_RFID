import {
  Bell,
  ChevronRight,
  Menu,
  Moon,
  Search,
  Sun,
} from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { UserMenu } from '@/components/shared/UserMenu'
import { menuPorPerfil } from '@/lib/menuConfig'
import { RACE_INICIO, RACE_NOME } from '@/lib/race'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { CronometroAoVivo } from './CronometroAoVivo'

interface HeaderProps {
  onOpenMobileMenu: () => void
  onOpenCommandPalette: () => void
}

function usePageTitle(): string {
  const { pathname } = useLocation()
  const todosItens = Object.values(menuPorPerfil).flat()
  const match = todosItens.find((item) =>
    item.path === '/' ? pathname === '/' : pathname.startsWith(item.path),
  )
  return match?.label ?? 'Página'
}

function iniciais(nome: string) {
  return nome
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

export function Header({
  onOpenMobileMenu,
  onOpenCommandPalette,
}: HeaderProps) {
  const title = usePageTitle()
  const usuario = useAuthStore((s) => s.usuario)
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      {/* ---------- ESQUERDA ---------- */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMobileMenu}
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex items-center gap-1.5 text-sm">
          <li className="hidden text-muted-foreground sm:inline">
            RaceTrack
          </li>
          <li aria-hidden className="hidden text-muted-foreground/50 sm:inline">
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li
            className="truncate font-medium text-foreground"
            aria-current="page"
          >
            {title}
          </li>
        </ol>
      </nav>

      {/* ---------- CENTRO (md+) ---------- */}
      <div className="hidden flex-col items-center leading-tight md:flex">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping-slow rounded-full bg-destructive/80" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-destructive">
            Prova em andamento
          </span>
          <Separator
            orientation="vertical"
            className="h-3 bg-destructive/30"
          />
          <CronometroAoVivo
            inicio={RACE_INICIO}
            className="text-destructive"
          />
        </div>
        <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          {RACE_NOME}
        </p>
      </div>

      {/* ---------- DIREITA ---------- */}
      <div className="ml-auto flex items-center gap-1 md:gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenCommandPalette}
          className="hidden h-9 items-center gap-2 px-3 text-muted-foreground sm:flex"
          aria-label="Abrir busca"
        >
          <Search className="h-4 w-4" />
          <span className="hidden text-sm font-normal lg:inline">
            Buscar...
          </span>
          <kbd className="ml-2 hidden items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground lg:inline-flex">
            ⌘K
          </kbd>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenCommandPalette}
          className="sm:hidden"
          aria-label="Abrir busca"
        >
          <Search className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          <Badge
            variant="secondary"
            className="absolute -right-1 -top-1 h-5 min-w-[1.25rem] justify-center border border-background bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground"
          >
            3
          </Badge>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={
            theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'
          }
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {usuario && (
          <UserMenu
            align="end"
            trigger={
              <button
                type="button"
                className={cn(
                  'flex items-center gap-2 rounded-full pl-1 pr-2 outline-none',
                  'transition-all duration-200 hover:bg-accent',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                )}
                aria-label="Abrir menu do usuário"
              >
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src={usuario.avatar} alt="" />
                  <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                    {iniciais(usuario.nome)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium text-foreground sm:inline">
                  {usuario.nome.split(' ')[0]}
                </span>
              </button>
            }
          />
        )}
      </div>
    </header>
  )
}
