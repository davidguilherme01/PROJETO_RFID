import { useEffect, useState } from 'react'
import { LogoMark } from './Logo'

// Splash de boas-vindas. Aparece só uma vez por sessão (sessionStorage) pra
// não atrapalhar navegação subsequente. Auto-desmonta após 1.6s.
const SPLASH_KEY = 'racetrack:splash-seen'

export function Splash() {
  const [show, setShow] = useState(() => {
    if (typeof window === 'undefined') return false
    return !window.sessionStorage.getItem(SPLASH_KEY)
  })

  useEffect(() => {
    if (!show) return
    const t = window.setTimeout(() => {
      setShow(false)
      window.sessionStorage.setItem(SPLASH_KEY, '1')
    }, 1600)
    return () => window.clearTimeout(t)
  }, [show])

  if (!show) return null

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-[200] flex items-center justify-center bg-background animate-splash-out"
      aria-hidden
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary ring-2 ring-primary/40">
            <LogoMark className="h-8 w-8" />
          </span>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold tracking-tight text-foreground">
            RaceTrack RFID
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            inicializando antenas
          </p>
        </div>
      </div>
    </div>
  )
}
