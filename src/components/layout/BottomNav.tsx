import { NavLink } from 'react-router-dom'
import { menuPorPerfil } from '@/lib/menuConfig'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

// Renderiza só para corredor/espectador. Visível apenas em mobile/tablet (<lg).
// Para admin, o sidebar drawer já cobre essa função.
export function BottomNav() {
  const usuario = useAuthStore((s) => s.usuario)
  if (!usuario) return null
  if (usuario.perfil === 'administrador') return null

  const items = menuPorPerfil[usuario.perfil]

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md lg:hidden"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <ul
        className="mx-auto grid"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'relative flex h-16 min-h-[3.5rem] flex-col items-center justify-center gap-1 transition-colors duration-200',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'h-5 w-5 transition-transform duration-200',
                        isActive && 'scale-110',
                      )}
                    />
                    <span className="text-[10px] font-medium leading-tight">
                      {item.label}
                    </span>
                    {isActive && (
                      <span
                        aria-hidden
                        className="absolute -top-px h-0.5 w-10 rounded-full bg-primary"
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
