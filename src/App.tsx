import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { Splash } from '@/components/layout/Splash'
import { Toaster } from '@/components/ui/sonner'
import { useThemeStore } from '@/store/themeStore'
import { router } from './router'

export default function App() {
  // Mantém document.documentElement.classList sincronizado com o tema persistido.
  // O bootstrap em index.html já aplica a classe ANTES do React montar (sem FOUC);
  // este efeito cobre mudanças em tempo de execução (clique no toggle).
  const theme = useThemeStore((s) => s.theme)
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [theme])

  return (
    <>
      <Splash />
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors closeButton />
    </>
  )
}
