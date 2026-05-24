import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface CronometroAoVivoProps {
  inicio: Date
  className?: string
}

function formatHHMMSS(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

export function CronometroAoVivo({ inicio, className }: CronometroAoVivoProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <span
      className={cn(
        'font-mono text-sm font-semibold tabular-nums tracking-tight',
        className,
      )}
    >
      {formatHHMMSS(now - inicio.getTime())}
    </span>
  )
}
