import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet'
import { CommandPalette, useCommandPalette } from './CommandPalette'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const { open: paletteOpen, setOpen: setPaletteOpen, openPalette } =
    useCommandPalette()

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

      {/* Drawer mobile (<lg) */}
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
        <main className="flex-1 overflow-y-auto">
          <div
            key={pathname}
            className="mx-auto w-full max-w-screen-2xl animate-page-fade-in p-4 md:p-6 lg:p-8"
          >
            <Outlet />
          </div>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  )
}
