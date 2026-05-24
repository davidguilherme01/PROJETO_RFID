import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type KpiTom = 'verde' | 'amarelo' | 'vermelho' | 'azul'

interface KpiCardProps {
  label: string
  value: ReactNode
  variacao: number // % vs janela anterior
  tom: KpiTom
  icon: LucideIcon
  iconAnimado?: boolean
  comparativoLabel?: string
}

const tomClasses: Record<KpiTom, { wrap: string; text: string }> = {
  verde: { wrap: 'bg-primary/15', text: 'text-primary' },
  amarelo: { wrap: 'bg-amber-500/15', text: 'text-amber-500' },
  vermelho: {
    wrap: 'bg-destructive/15',
    text: 'text-destructive',
  },
  azul: {
    wrap: 'bg-blue-500/15',
    text: 'text-blue-600 dark:text-blue-400',
  },
}

export function KpiCard({
  label,
  value,
  variacao,
  tom,
  icon: Icon,
  iconAnimado = false,
  comparativoLabel = 'vs 1h atrás',
}: KpiCardProps) {
  const t = tomClasses[tom]
  const subiu = variacao >= 0
  const Trend = subiu ? TrendingUp : TrendingDown
  const trendColor = subiu ? 'text-primary' : 'text-destructive'
  const variacaoFmt = `${subiu ? '+' : ''}${variacao.toFixed(1)}%`

  return (
    <Card className="relative overflow-hidden p-6 transition-shadow duration-200 hover:shadow-lg">
      <div
        className={cn(
          'absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full',
          t.wrap,
          t.text,
        )}
      >
        <Icon
          className={cn(
            'h-5 w-5',
            iconAnimado && 'animate-pulse-slow',
          )}
        />
      </div>

      <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </p>

      <p className="mt-3 text-4xl font-bold tabular-nums tracking-tight text-foreground">
        {value}
      </p>

      <div className="mt-4 flex items-center gap-1.5 text-xs">
        <span
          className={cn(
            'inline-flex items-center gap-1 font-semibold',
            trendColor,
          )}
        >
          <Trend className="h-3.5 w-3.5" />
          {variacaoFmt}
        </span>
        <span className="text-muted-foreground">{comparativoLabel}</span>
      </div>
    </Card>
  )
}
