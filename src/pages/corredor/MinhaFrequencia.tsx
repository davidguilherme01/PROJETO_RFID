import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowDown, ArrowUp, HeartPulse, Timer } from 'lucide-react'
import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BPMDisplay } from '@/components/shared/BPMDisplay'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { mockCheckpoints, mockCorredores, mockCronometragem, mockFrequencia } from '@/data'
import { FAIXA_BPM_SEGURA } from '@/lib/constants'
import { useAuthStore } from '@/store/authStore'

const checkpointPorId = new Map(mockCheckpoints.map((c) => [c.id, c]))

interface TooltipPayload {
  value: number
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayload[]
  label?: number
}) {
  if (!active || !payload?.length || typeof label !== 'number') return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {format(label, 'HH:mm:ss')}
      </p>
      <p className="mt-1 text-sm font-bold tabular-nums text-destructive">
        {payload[0].value} bpm
      </p>
    </div>
  )
}

export default function MinhaFrequenciaPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const corredor = mockCorredores.find((c) => c.id === usuario?.corredorId)

  const dados = useMemo(() => {
    if (!corredor) return null
    const bpms = mockFrequencia
      .filter((f) => f.corredorId === corredor.id)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    if (!bpms.length) return null

    const valores = bpms.map((f) => f.bpm)
    const max = Math.max(...valores)
    const min = Math.min(...valores)
    const medio = Math.round(
      valores.reduce((s, v) => s + v, 0) / valores.length,
    )
    const naFaixa = valores.filter(
      (v) => v >= FAIXA_BPM_SEGURA.min && v <= FAIXA_BPM_SEGURA.max,
    ).length
    const tempoZonaSegura = Math.round((naFaixa / valores.length) * 100)

    const serie = bpms.map((f) => ({
      timestamp: new Date(f.timestamp).getTime(),
      bpm: f.bpm,
    }))
    const tempoInicial = serie[0].timestamp
    const tempoFinal = serie[serie.length - 1].timestamp

    // Marcações dos checkpoints cruzados ao longo do tempo.
    const cronos = mockCronometragem.filter(
      (c) => c.corredorId === corredor.id,
    )
    const cpMarcadores = cronos
      .map((c) => {
        const cp = checkpointPorId.get(c.checkpoint)
        if (!cp) return null
        // Tempo do checkpoint = race_start + tempoTotal*1000.
        // Aproximamos race_start como o primeiro ponto de BPM.
        return {
          x: tempoInicial + c.tempoTotal * 1000,
          label: cp.nome,
          posicaoKm: cp.posicaoKm,
        }
      })
      .filter((m): m is NonNullable<typeof m> => m !== null && m.x <= tempoFinal)

    // Picos: pontos com BPM no top 10% (zonas de pico)
    const limiarPico = Math.max(...valores) - 5
    const picos = serie.filter((p) => p.bpm >= limiarPico)

    return {
      serie,
      bpmAtual: valores[valores.length - 1],
      max,
      min,
      medio,
      tempoZonaSegura,
      cpMarcadores,
      picos,
    }
  }, [corredor])

  if (!corredor) {
    return (
      <EmptyState
        icon={HeartPulse}
        title="Perfil sem corredor vinculado"
        description="Não há dados de frequência cardíaca disponíveis."
      />
    )
  }
  if (!dados) {
    return (
      <EmptyState
        icon={HeartPulse}
        title="Sem dados cardíacos"
        description="Sua cinta cardíaca ainda não enviou nenhuma leitura."
      />
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Minha Frequência"
        description={`${dados.serie.length} amostras coletadas pela XOSS H10 ao longo da prova.`}
      />

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              BPM atual
            </p>
            <BPMDisplay bpm={dados.bpmAtual} size="md" className="mt-1" />
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Zona segura
            </p>
            <p className="font-mono text-sm font-semibold text-foreground">
              {FAIXA_BPM_SEGURA.min}–{FAIXA_BPM_SEGURA.max} bpm
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">BPM ao longo da prova</CardTitle>
          <p className="text-xs text-muted-foreground">
            Faixa hachurada = zona segura · marcadores = checkpoints
            cruzados · pontos vermelhos = picos
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] w-full">
            <ResponsiveContainer>
              <AreaChart
                data={dados.serie}
                margin={{ top: 12, right: 12, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="grad-bpm-full" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <ReferenceArea
                  y1={FAIXA_BPM_SEGURA.min}
                  y2={FAIXA_BPM_SEGURA.max}
                  fill="hsl(var(--primary))"
                  fillOpacity={0.05}
                  stroke="none"
                />
                <ReferenceLine
                  y={FAIXA_BPM_SEGURA.max}
                  stroke="hsl(var(--primary))"
                  strokeDasharray="4 4"
                  strokeOpacity={0.4}
                  label={{
                    value: 'limite seguro',
                    position: 'insideTopRight',
                    fill: 'hsl(var(--primary))',
                    fontSize: 10,
                  }}
                />
                {dados.cpMarcadores.map((m) => (
                  <ReferenceLine
                    key={m.label}
                    x={m.x}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="2 4"
                    label={{
                      value: m.label,
                      position: 'top',
                      fill: 'hsl(var(--muted-foreground))',
                      fontSize: 9,
                    }}
                  />
                ))}
                {dados.picos.map((p) => (
                  <ReferenceDot
                    key={p.timestamp}
                    x={p.timestamp}
                    y={p.bpm}
                    r={4}
                    fill="#ef4444"
                    stroke="hsl(var(--card))"
                    strokeWidth={2}
                  />
                ))}
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
                  domain={[100, 200]}
                  stroke="hsl(var(--muted-foreground))"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  width={36}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="bpm"
                  stroke="#ef4444"
                  fill="url(#grad-bpm-full)"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ResumoCard
          icon={HeartPulse}
          label="BPM médio"
          value={dados.medio}
          unit="bpm"
        />
        <ResumoCard
          icon={ArrowUp}
          label="Máximo"
          value={dados.max}
          unit="bpm"
          tom="vermelho"
        />
        <ResumoCard
          icon={ArrowDown}
          label="Mínimo"
          value={dados.min}
          unit="bpm"
          tom="azul"
        />
        <ResumoCard
          icon={Timer}
          label="Tempo zona segura"
          value={`${dados.tempoZonaSegura}%`}
          tom="verde"
        />
      </div>
    </div>
  )
}

function ResumoCard({
  icon: Icon,
  label,
  value,
  unit,
  tom = 'neutro',
}: {
  icon: typeof HeartPulse
  label: string
  value: string | number
  unit?: string
  tom?: 'verde' | 'vermelho' | 'azul' | 'neutro'
}) {
  const cor =
    tom === 'verde'
      ? 'text-primary'
      : tom === 'vermelho'
      ? 'text-destructive'
      : tom === 'azul'
      ? 'text-blue-500 dark:text-blue-400'
      : 'text-foreground'
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <Icon className={`h-4 w-4 ${cor}`} />
      </div>
      <p className={`mt-2 font-mono text-2xl font-bold tabular-nums ${cor}`}>
        {value}
        {unit && (
          <span className="ml-1 text-xs font-medium text-muted-foreground">
            {unit}
          </span>
        )}
      </p>
    </Card>
  )
}
