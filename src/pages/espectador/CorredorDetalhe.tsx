import { format } from 'date-fns'
import { ArrowLeft, Gauge, MapPin, Share2, Star, Trophy } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Area,
  AreaChart,
  ReferenceArea,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BPMDisplay } from '@/components/shared/BPMDisplay'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  mockCheckpoints,
  mockCorredores,
  mockCronometragem,
  mockFrequencia,
} from '@/data'
import { useFavoritos } from '@/hooks/useFavoritos'
import { useRankingLive } from '@/hooks/useRankingLive'
import { FAIXA_BPM_SEGURA } from '@/lib/constants'
import { cn } from '@/lib/utils'

const checkpointPorId = new Map(mockCheckpoints.map((c) => [c.id, c]))

function formatTempo(seg: number) {
  const h = Math.floor(seg / 3600)
  const m = Math.floor((seg % 3600) / 60)
  const s = seg % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

function formatRitmo(secPorKm: number) {
  const m = Math.floor(secPorKm / 60)
  const s = Math.round(secPorKm % 60)
  return `${m}'${s.toString().padStart(2, '0')}"/km`
}

function iniciais(nome: string) {
  return nome
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

export default function CorredorDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const ranking = useRankingLive()
  const toggle = useFavoritos((s) => s.toggle)
  const isFav = useFavoritos((s) =>
    id ? s.favoritos.includes(id) : false,
  )

  const corredor = mockCorredores.find((c) => c.id === id)

  const dados = useMemo(() => {
    if (!corredor) return null
    const meusCronos = mockCronometragem
      .filter((c) => c.corredorId === corredor.id)
      .sort((a, b) => {
        const ak = checkpointPorId.get(a.checkpoint)?.posicaoKm ?? 0
        const bk = checkpointPorId.get(b.checkpoint)?.posicaoKm ?? 0
        return ak - bk
      })
    const ultimoCrono = meusCronos[meusCronos.length - 1]
    const ultimoCp = ultimoCrono
      ? checkpointPorId.get(ultimoCrono.checkpoint)
      : undefined
    const paceMedio =
      ultimoCrono && ultimoCp && ultimoCp.posicaoKm > 0
        ? ultimoCrono.tempoTotal / ultimoCp.posicaoKm
        : 320

    const bpms = mockFrequencia
      .filter((f) => f.corredorId === corredor.id)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      .map((f) => ({
        timestamp: new Date(f.timestamp).getTime(),
        bpm: f.bpm,
      }))
    const bpmAtual = bpms[bpms.length - 1]?.bpm

    const entradaRanking = ranking.find((r) => r.corredor.id === corredor.id)

    return {
      meusCronos,
      ultimoCrono,
      ultimoCp,
      paceMedio,
      bpms,
      bpmAtual,
      posicao: entradaRanking?.posicao,
    }
  }, [corredor, ranking])

  if (!corredor) {
    return (
      <EmptyState
        icon={Trophy}
        title="Corredor não encontrado"
        description="O ID informado não corresponde a nenhum atleta da prova."
        action={
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        }
      />
    )
  }
  if (!dados) return null

  const handleCompartilhar = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${corredor.nome} · RaceTrack RFID`,
          text: `Acompanhe ${corredor.nome} (#${corredor.numeroCamisa}) ao vivo!`,
          url,
        })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success('Link copiado para a área de transferência.')
      }
    } catch {
      /* compartilhamento cancelado pelo usuário */
    }
  }

  return (
    <div className="space-y-5">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/25 via-primary/10 to-card p-6 shadow-md">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 flex-shrink-0 border-2 border-primary/30 ring-2 ring-background">
            <AvatarImage src={corredor.foto} alt="" />
            <AvatarFallback className="bg-primary/20 text-xl font-bold text-primary">
              {iniciais(corredor.nome)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xl font-bold text-foreground">
              {corredor.nome}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="secondary" className="font-mono">
                #{corredor.numeroCamisa}
              </Badge>
              <span className="text-muted-foreground">
                {corredor.categoria}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant={isFav ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggle(corredor.id)}
                className="gap-1.5"
              >
                <Star
                  className={cn(
                    'h-4 w-4',
                    isFav && 'fill-current',
                  )}
                />
                {isFav ? 'Acompanhando' : 'Acompanhar'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCompartilhar}
                className="gap-1.5"
              >
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Trophy} label="Posição" value={dados.posicao ? `${dados.posicao}º` : '—'} />
        <Stat
          icon={MapPin}
          label="Checkpoint"
          value={dados.ultimoCp?.nome ?? 'Largada'}
        />
        <Stat
          icon={Gauge}
          label="Ritmo"
          value={formatRitmo(dados.paceMedio)}
          mono
        />
        <Stat
          icon={Trophy}
          label="Tempo"
          value={
            dados.ultimoCrono ? formatTempo(dados.ultimoCrono.tempoTotal) : '—'
          }
          mono
        />
      </div>

      {dados.bpms.length > 0 && (
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Frequência cardíaca
            </p>
            <BPMDisplay bpm={dados.bpmAtual} size="md" />
          </div>
          <div className="h-32 w-full">
            <ResponsiveContainer>
              <AreaChart
                data={dados.bpms}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="grad-bpm-corr"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <ReferenceArea
                  y1={FAIXA_BPM_SEGURA.min}
                  y2={FAIXA_BPM_SEGURA.max}
                  fill="hsl(var(--primary))"
                  fillOpacity={0.05}
                  stroke="none"
                />
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(t) => format(new Date(t), 'HH:mm')}
                  stroke="hsl(var(--muted-foreground))"
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                  minTickGap={32}
                />
                <YAxis
                  domain={[120, 200]}
                  stroke="hsl(var(--muted-foreground))"
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                />
                <Area
                  type="monotone"
                  dataKey="bpm"
                  stroke="#ef4444"
                  fill="url(#grad-bpm-corr)"
                  strokeWidth={1.5}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {dados.meusCronos.length > 0 && (
        <Card className="p-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Tempos parciais
          </p>
          <ul className="space-y-1.5">
            {dados.meusCronos.map((c) => {
              const cp = checkpointPorId.get(c.checkpoint)
              return (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-md border border-border bg-card/50 px-3 py-2 text-sm"
                >
                  <span>
                    <span className="font-medium text-foreground">
                      {cp?.nome ?? c.checkpoint}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {cp?.posicaoKm} km
                    </span>
                  </span>
                  <span className="font-mono font-semibold tabular-nums text-foreground">
                    {formatTempo(c.tempoTotal)}
                  </span>
                </li>
              )
            })}
          </ul>
        </Card>
      )}

      <p className="text-center text-[11px] text-muted-foreground">
        Visualização pública — dados pessoais sensíveis ficam ocultos.
        <br />
        <Link
          to="/espectador/ranking"
          className="font-medium text-primary hover:underline"
        >
          Voltar ao ranking
        </Link>
      </p>
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: typeof Trophy
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <p
        className={cn(
          'mt-1 text-lg font-bold text-foreground',
          mono && 'font-mono tabular-nums',
        )}
      >
        {value}
      </p>
    </Card>
  )
}
