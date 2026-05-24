import { ChevronRight, HeartPulse, Medal, Trophy } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RankingLiveItem } from '@/hooks/useRankingLive'
import { mockFrequencia } from '@/data'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface Top3PodioProps {
  ranking: RankingLiveItem[]
}

const podioConfig = [
  {
    bgGradient:
      'bg-gradient-to-br from-amber-400/35 via-amber-400/10 to-transparent',
    ring: 'ring-1 ring-amber-400/40',
    medalColor: 'text-amber-400',
    medalIcon: Trophy,
  },
  {
    bgGradient:
      'bg-gradient-to-br from-slate-300/30 via-slate-300/5 to-transparent dark:from-slate-400/25',
    ring: 'ring-1 ring-slate-300/30',
    medalColor: 'text-slate-300 dark:text-slate-200',
    medalIcon: Medal,
  },
  {
    bgGradient:
      'bg-gradient-to-br from-orange-700/30 via-orange-700/5 to-transparent',
    ring: 'ring-1 ring-orange-700/30',
    medalColor: 'text-orange-700 dark:text-orange-500',
    medalIcon: Medal,
  },
]

function formatTempo(seg: number) {
  const h = Math.floor(seg / 3600)
  const m = Math.floor((seg % 3600) / 60)
  const s = seg % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

function iniciais(nome: string) {
  return nome
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

export function Top3Podio({ ranking }: Top3PodioProps) {
  // Pega o BPM mais recente conhecido por corredor (pode ser undefined).
  const bpmPorCorredor = useMemo(() => {
    const map = new Map<string, number>()
    for (const fc of mockFrequencia) {
      map.set(fc.corredorId, fc.bpm)
    }
    return map
  }, [])

  const top3 = ranking.slice(0, 3)

  return (
    <Card className="flex h-full flex-col transition-shadow duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Top 3 atual</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 pt-0">
        {top3.map((item, idx) => {
          const cfg = podioConfig[idx]
          const Medal = cfg.medalIcon
          const bpm = bpmPorCorredor.get(item.corredor.id)
          return (
            <div
              key={item.corredor.id}
              className={cn(
                'relative overflow-hidden rounded-xl border border-border p-3',
                cfg.bgGradient,
                cfg.ring,
                idx === 0 && 'p-4',
              )}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar
                    className={cn(
                      'flex-shrink-0 border border-border',
                      idx === 0 ? 'h-14 w-14' : 'h-11 w-11',
                    )}
                  >
                    <AvatarImage src={item.corredor.foto} alt="" />
                    <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                      {iniciais(item.corredor.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={cn(
                      'absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-card text-xs font-bold',
                      cfg.medalColor,
                    )}
                  >
                    {idx + 1}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        'truncate font-semibold text-foreground',
                        idx === 0 ? 'text-base' : 'text-sm',
                      )}
                    >
                      {item.corredor.nome}
                    </p>
                    <Medal
                      className={cn(
                        'h-4 w-4 flex-shrink-0',
                        cfg.medalColor,
                        idx === 0 && 'animate-pulse-slow',
                      )}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    #{item.corredor.numeroCamisa} · {item.corredor.categoria}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-[11px]">
                    <span className="font-mono font-semibold tabular-nums text-foreground">
                      {formatTempo(item.tempoAtual)}
                    </span>
                    {bpm !== undefined && (
                      <span className="inline-flex items-center gap-1 text-destructive">
                        <HeartPulse className="h-3 w-3 animate-pulse-slow" />
                        <span className="font-mono tabular-nums">
                          {bpm} bpm
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
      <div className="border-t border-border p-3">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-full justify-center gap-1 text-xs"
        >
          <Link to={ROUTES.ESPECTADOR.RANKING}>
            Ver ranking completo
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </Card>
  )
}
