import { formatDistanceToNowStrict } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ArrowRight,
  AlertTriangle,
  Check,
  HeartPulse,
  ShieldCheck,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import type {
  AlertaCardiaco,
  TipoAlerta,
} from '@/hooks/useAlertasCardiacos'
import { cn } from '@/lib/utils'

interface AlertasCardiacosProps {
  alertas: AlertaCardiaco[]
  onResolver: (id: string) => void
}

const tomPorTipo: Record<
  TipoAlerta,
  { wrap: string; text: string; label: string; pulse: boolean }
> = {
  alto: {
    wrap: 'bg-amber-500/10 border-amber-500/30',
    text: 'text-amber-600 dark:text-amber-400',
    label: 'BPM alto',
    pulse: false,
  },
  baixo: {
    wrap: 'bg-blue-500/10 border-blue-500/30',
    text: 'text-blue-600 dark:text-blue-400',
    label: 'BPM baixo',
    pulse: false,
  },
  critico: {
    wrap: 'bg-destructive/10 border-destructive/40',
    text: 'text-destructive',
    label: 'Crítico',
    pulse: true,
  },
}

export function AlertasCardiacos({
  alertas,
  onResolver,
}: AlertasCardiacosProps) {
  const navigate = useNavigate()
  const lista = alertas.slice(0, 5)

  return (
    <Card className="transition-shadow duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Alertas de frequência cardíaca
          </CardTitle>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {alertas.length} pendente{alertas.length === 1 ? '' : 's'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {lista.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="Tudo tranquilo por aqui ✓"
            description="Nenhum atleta fora da zona segura no momento."
          />
        ) : (
          <ul className="space-y-2">
            {lista.map((a) => {
              const tom = tomPorTipo[a.tipo]
              return (
                <li
                  key={a.id}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-3',
                    tom.wrap,
                    tom.pulse && 'animate-pulse-slow',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-background',
                      tom.text,
                    )}
                  >
                    {a.tipo === 'critico' ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <HeartPulse className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {a.corredor.nome}
                      </p>
                      <span
                        className={cn(
                          'rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                          tom.text,
                          'bg-background',
                        )}
                      >
                        {tom.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      #{a.corredor.numeroCamisa} ·{' '}
                      <span
                        className={cn(
                          'font-mono font-semibold tabular-nums',
                          tom.text,
                        )}
                      >
                        {a.bpm} bpm
                      </span>{' '}
                      ·{' '}
                      {formatDistanceToNowStrict(new Date(a.timestamp), {
                        locale: ptBR,
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 gap-1 text-xs"
                      onClick={() => navigate(`/espectador/corredor/${a.corredor.id}`)}
                    >
                      Ver
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 text-xs"
                      onClick={() => onResolver(a.id)}
                    >
                      <Check className="h-3 w-3" />
                      Resolver
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
