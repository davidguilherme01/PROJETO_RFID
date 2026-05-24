import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { UserMenu } from '@/components/shared/UserMenu'
import { mockCorredores } from '@/data'
import { menuPorPerfil } from '@/lib/menuConfig'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import type { PerfilUsuario } from '@/types'
import { LogoMark } from './Logo'

interface SidebarProps {
  collapsed: boolean
  // Quando undefined, o botão de colapsar não aparece (usado no drawer mobile,
  // onde a Sheet sempre mostra a versão expandida).
  onToggleCollapse?: () => void
  // Disparado em qualquer click no menu — usado pelo drawer mobile para fechar.
  onNavigate?: () => void
}

const perfilBadgeClass: Record<PerfilUsuario, string> = {
  administrador:
    'bg-blue-500/15 text-blue-600 ring-1 ring-inset ring-blue-500/30 dark:text-blue-400',
  corredor:
    'bg-primary/15 text-primary ring-1 ring-inset ring-primary/30',
  espectador:
    'bg-purple-500/15 text-purple-600 ring-1 ring-inset ring-purple-500/30 dark:text-purple-400',
}

const perfilLabel: Record<PerfilUsuario, string> = {
  administrador: 'Administrador',
  corredor: 'Corredor',
  espectador: 'Espectador',
}

function iniciais(nome: string) {
  return nome
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  onNavigate,
}: SidebarProps) {
  const usuario = useAuthStore((s) => s.usuario)
  const items = usuario ? menuPorPerfil[usuario.perfil] : []

  // Para corredores, encontra o número de camisa para mostrar no badge.
  const corredorVinculado = usuario?.corredorId
    ? mockCorredores.find((c) => c.id === usuario.corredorId)
    : undefined

  const badgeTexto =
    usuario?.perfil === 'corredor' && corredorVinculado
      ? `${perfilLabel.corredor} #${corredorVinculado.numeroCamisa}`
      : usuario
      ? perfilLabel[usuario.perfil]
      : ''

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border bg-card text-card-foreground',
        'transition-[width] duration-300 ease-in-out',
        collapsed ? 'w-[72px]' : 'w-[264px]',
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
          <LogoMark className="h-5 w-5" />
        </span>
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold tracking-tight text-foreground">
              RaceTrack
            </p>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              RFID
            </p>
          </div>
        )}
        {onToggleCollapse && !collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onToggleCollapse}
            aria-label="Colapsar sidebar"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {usuario && (
        <div
          className={cn(
            'flex border-b border-border px-4 py-3',
            collapsed ? 'justify-center' : 'justify-start',
          )}
        >
          {collapsed ? (
            <span
              title={badgeTexto}
              className={cn(
                'h-2 w-2 rounded-full',
                usuario.perfil === 'administrador' && 'bg-blue-500',
                usuario.perfil === 'corredor' && 'bg-primary',
                usuario.perfil === 'espectador' && 'bg-purple-500',
              )}
              aria-label={badgeTexto}
            />
          ) : (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
                perfilBadgeClass[usuario.perfil],
              )}
            >
              {badgeTexto}
            </span>
          )}
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-md text-sm font-medium transition-all duration-200',
                  collapsed
                    ? 'h-10 w-full justify-center px-0'
                    : 'h-10 px-3',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'absolute inset-y-1 left-0 w-[2px] rounded-r-full bg-primary transition-opacity duration-200',
                      isActive ? 'opacity-100' : 'opacity-0',
                    )}
                    aria-hidden
                  />
                  <Icon
                    className={cn(
                      'h-[18px] w-[18px] flex-shrink-0 transition-colors duration-200',
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover:text-foreground',
                    )}
                  />
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {usuario && (
        <div className="border-t border-border p-3">
          {!collapsed ? (
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-background/40 p-3">
              <UserMenu
                align="end"
                side="top"
                trigger={
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-md text-left transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Abrir menu do usuário"
                  >
                    <Avatar className="h-9 w-9 flex-shrink-0 border border-border">
                      <AvatarImage src={usuario.avatar} alt="" />
                      <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                        {iniciais(usuario.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 leading-tight">
                      <p className="truncate text-sm font-medium text-foreground">
                        {usuario.nome}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {usuario.email}
                      </p>
                    </div>
                  </button>
                }
              />
              <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  Status da prova
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inset-0 animate-ping-slow rounded-full bg-destructive/80" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-destructive">
                    Ao Vivo
                  </span>
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-1">
              <UserMenu
                align="end"
                side="right"
                trigger={
                  <button
                    type="button"
                    className="rounded-full transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Abrir menu do usuário"
                  >
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarImage src={usuario.avatar} alt="" />
                      <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                        {iniciais(usuario.nome)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                }
              />
              <span
                className="relative flex h-2 w-2"
                title="Prova ao vivo"
              >
                <span className="absolute inset-0 animate-ping-slow rounded-full bg-destructive/80" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
              </span>
            </div>
          )}
        </div>
      )}

      {onToggleCollapse && collapsed && (
        <div className="border-t border-border p-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={onToggleCollapse}
            aria-label="Expandir sidebar"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </aside>
  )
}
