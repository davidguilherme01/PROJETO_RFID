import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FAIXA_BPM_SEGURA } from '@/lib/constants'

export type BPMTom = 'verde' | 'amarelo' | 'vermelho'

export function bpmTom(bpm: number | undefined): BPMTom {
  if (bpm === undefined) return 'verde'
  if (bpm < FAIXA_BPM_SEGURA.min || bpm > FAIXA_BPM_SEGURA.max) return 'vermelho'
  if (bpm > 160) return 'amarelo'
  return 'verde'
}

const corPorTom: Record<BPMTom, { text: string; bg: string; heart: string }> = {
  verde: {
    text: 'text-primary',
    bg: 'bg-primary/10',
    heart: 'fill-primary text-primary',
  },
  amarelo: {
    text: 'text-amber-500',
    bg: 'bg-amber-500/10',
    heart: 'fill-amber-500 text-amber-500',
  },
  vermelho: {
    text: 'text-destructive',
    bg: 'bg-destructive/10',
    heart: 'fill-destructive text-destructive',
  },
}

interface BPMDisplayProps {
  bpm: number | undefined
  /** 'sm' (line item) | 'md' (card) | 'xl' (hero) */
  size?: 'sm' | 'md' | 'xl'
  className?: string
}

const sizeClass = {
  sm: {
    wrap: 'gap-1',
    number: 'text-base font-mono font-semibold',
    heart: 'h-3.5 w-3.5',
  },
  md: {
    wrap: 'gap-2',
    number: 'text-3xl font-bold tabular-nums',
    heart: 'h-6 w-6',
  },
  xl: {
    wrap: 'gap-3',
    number: 'text-6xl font-bold tabular-nums',
    heart: 'h-10 w-10',
  },
} as const

export function BPMDisplay({ bpm, size = 'md', className }: BPMDisplayProps) {
  const tom = bpmTom(bpm)
  const cor = corPorTom[tom]
  const sz = sizeClass[size]

  // Coração acelera junto com o BPM. Duração de um ciclo (2 batidas)
  // = 60 / bpm * 2; clampada para um intervalo confortável.
  const cycleSec = bpm
    ? Math.max(0.6, Math.min(1.6, (60 / bpm) * 2))
    : 1
  const heartStyle = bpm ? { animationDuration: `${cycleSec.toFixed(2)}s` } : {}

  return (
    <span
      className={cn(
        'inline-flex items-center',
        sz.wrap,
        cor.text,
        className,
      )}
    >
      <Heart
        className={cn(sz.heart, cor.heart, bpm && 'animate-heartbeat')}
        style={heartStyle}
        aria-hidden
      />
      <span className={sz.number}>{bpm ?? '—'}</span>
      {size !== 'sm' && (
        <span className="text-xs font-medium uppercase tracking-wider opacity-70">
          bpm
        </span>
      )}
    </span>
  )
}
