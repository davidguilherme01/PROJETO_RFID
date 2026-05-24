import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { RealTimeMetrics } from '@/hooks/useRealTimeMetrics'

type TabValue = 'bpm' | 'leituras' | 'velocidade'

interface TabConfig {
  label: string
  // hex direto para o gradient/stroke (cores fora do tema, intencional —
  // identidade da métrica precisa ser estável entre dark/light)
  cor: string
  unit: string
  formatValor: (v: number) => string
}

const tabs: Record<TabValue, TabConfig> = {
  bpm: {
    label: 'BPM Médio',
    cor: '#ef4444',
    unit: 'bpm',
    formatValor: (v) => `${Math.round(v)} bpm`,
  },
  leituras: {
    label: 'Leituras RFID',
    cor: '#3b82f6',
    unit: '/min',
    formatValor: (v) => `${v.toFixed(1)} /min`,
  },
  velocidade: {
    label: 'Velocidade Média',
    cor: '#22c55e',
    unit: 'km/h',
    formatValor: (v) => `${v.toFixed(1)} km/h`,
  },
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: number
  config: TabConfig
}

function CustomTooltip({
  active,
  payload,
  label,
  config,
}: CustomTooltipProps) {
  if (!active || !payload?.length || typeof label !== 'number') return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-popover-foreground shadow-md">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
        {format(label, 'HH:mm:ss')}
      </p>
      <p
        className="mt-1 text-sm font-semibold tabular-nums"
        style={{ color: config.cor }}
      >
        {config.formatValor(payload[0].value)}
      </p>
    </div>
  )
}

interface AtividadeChartProps {
  metrics: RealTimeMetrics
}

export function AtividadeChart({ metrics }: AtividadeChartProps) {
  const [tab, setTab] = useState<TabValue>('bpm')
  const config = tabs[tab]

  const data = useMemo(() => {
    const source =
      tab === 'bpm'
        ? metrics.bpmMedio.historico
        : tab === 'leituras'
        ? metrics.leiturasMin.historico
        : metrics.velocidadeMedia.historico
    return source
  }, [tab, metrics])

  return (
    <Card className="h-full transition-shadow duration-200 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-base">
            Atividade da prova em tempo real
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Últimos 30 minutos · atualiza a cada 5s
          </p>
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
          <TabsList>
            <TabsTrigger value="bpm">BPM Médio</TabsTrigger>
            <TabsTrigger value="leituras">Leituras RFID</TabsTrigger>
            <TabsTrigger value="velocidade">Velocidade Média</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id={`grad-${tab}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={config.cor} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={config.cor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="timestamp"
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(t) =>
                  format(new Date(t), 'HH:mm', { locale: ptBR })
                }
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                minTickGap={48}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                width={48}
                tickFormatter={(v) =>
                  tab === 'leituras' || tab === 'velocidade'
                    ? v.toFixed(0)
                    : v.toString()
                }
              />
              <Tooltip content={<CustomTooltip config={config} />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={config.cor}
                strokeWidth={2}
                fill={`url(#grad-${tab})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
