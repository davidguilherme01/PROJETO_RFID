import { Suspense, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { PageLoading } from '@/components/shared/PageLoading'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { BottomNav } from './BottomNav'
import { CommandPalette, useCommandPalette } from './CommandPalette'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const { open: paletteOpen, setOpen: setPaletteOpen, openPalette } =
    useCommandPalette()
  const usuario = useAuthStore((s) => s.usuario)

  // Bottom nav só pra perfis públicos. Admin usa sidebar/drawer.
  const showBottomNav =
    usuario?.perfil === 'corredor' || usuario?.perfil === 'espectador'

  // key força um re-mount do <main> em cada navegação para reaplicar a animação
  // de fade-in. Não é caro porque a árvore é leve e libera memory dos antigos.
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Sidebar fixa (lg+) */}
      <div className="hidden flex-shrink-0 lg:flex">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
      </div>

      {/* Drawer mobile (<lg) — sempre disponível como fallback */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-[280px] border-r border-border bg-card p-0"
        >
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <SheetDescription className="sr-only">
            Navegue entre as áreas do sistema RaceTrack RFID.
          </SheetDescription>
          <Sidebar
            collapsed={false}
            onNavigate={() => setMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenCommandPalette={openPalette}
        />
        <main
          className={cn(
            'flex-1 overflow-y-auto',
            // Reserva espaço para o BottomNav (h-16) só em mobile.
            showBottomNav && 'pb-20 lg:pb-0',
          )}
        >
          <div
            key={pathname}
            className="mx-auto w-full max-w-screen-2xl animate-page-fade-in p-4 md:p-6 lg:p-8"
          >
            <Suspense fallback={<PageLoading />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      {showBottomNav && <BottomNav />}
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  )
}
