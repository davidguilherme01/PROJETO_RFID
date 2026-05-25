import {
  Activity,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Circle,
  Gauge,
  HeartPulse,
  MapPin,
  Trophy,
  type LucideIcon,
} from 'lucide-react'
import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from 'recharts'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BPMDisplay, bpmTom } from '@/components/shared/BPMDisplay'
import { CorredorCard } from '@/components/shared/CorredorCard'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  mockCheckpoints,
  mockCorredores,
  mockCronometragem,
  mockFrequencia,
} from '@/data'
import { useRankingLive } from '@/hooks/useRankingLive'
import { FAIXA_BPM_SEGURA, ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

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

const checkpointPorId = new Map(mockCheckpoints.map((c) => [c.id, c]))
const checkpointsOrdenados = [...mockCheckpoints].sort(
  (a, b) => a.posicaoKm - b.posicaoKm,
)
const DISTANCIA_TOTAL =
  checkpointsOrdenados[checkpointsOrdenados.length - 1]?.posicaoKm ?? 21

export default function MeuDesempenhoPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const ranking = useRankingLive()

  const corredor = useMemo(
    () => mockCorredores.find((c) => c.id === usuario?.corredorId),
    [usuario?.corredorId],
  )

  // Tudo abaixo assume que existe um corredor — guard antes de derivar.
  if (!corredor) {
    return (
      <EmptyState
        icon={Activity}
        title="Sem dados do corredor"
        description="Seu perfil ainda não está vinculado a um atleta cadastrado."
      />
    )
  }

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
  const finalizou = ultimoCp?.posicaoKm === DISTANCIA_TOTAL

  // Pace médio (s/km) baseado no último checkpoint cruzado.
  const paceMedio = ultimoCrono && ultimoCp && ultimoCp.posicaoKm > 0
    ? ultimoCrono.tempoTotal / ultimoCp.posicaoKm
    : 320

  const meusBpms = mockFrequencia
    .filter((f) => f.corredorId === corredor.id)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  const bpmAtual = meusBpms[meusBpms.length - 1]?.bpm
  const ultimosBpms = meusBpms.slice(-12).map((f, i) => ({
    i,
    bpm: f.bpm,
  }))

  // Próximo checkpoint
  const proximoCp = ultimoCp
    ? checkpointsOrdenados.find((cp) => cp.posicaoKm > ultimoCp.posicaoKm)
    : checkpointsOrdenados[0]
  const distanciaParaProximo = proximoCp && ultimoCp
    ? proximoCp.posicaoKm - ultimoCp.posicaoKm
    : 0
  const etaSegundos = distanciaParaProximo * paceMedio

  // Progresso geral
  const kmCorridos = ultimoCp?.posicaoKm ?? 0
  const progresso = (kmCorridos / DISTANCIA_TOTAL) * 100

  // Ranking
  const minhaEntrada = ranking.find((r) => r.corredor.id === corredor.id)
  const minhaPosicao = minhaEntrada?.posicao ?? ranking.length
  const totalCorredores = ranking.length
  const corredoresAtras = Math.max(0, totalCorredores - minhaPosicao)

  // Ranking por categoria
  const minhaCategoria = corredor.categoria
  const rankingCategoria = ranking.filter(
    (r) => r.corredor.categoria === minhaCategoria,
  )
  const posCategoria =
    rankingCategoria.findIndex((r) => r.corredor.id === corredor.id) + 1

  // Vizinhos: 5 à frente, 5 atrás
  const idx = ranking.findIndex((r) => r.corredor.id === corredor.id)
  const aFrente = idx > 0 ? ranking.slice(Math.max(0, idx - 5), idx).reverse() : []
  const atras = ranking.slice(idx + 1, idx + 6)

  return (
    <div className="space-y-5">
      {/* ─────────────── HERO ─────────────── */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/25 via-primary/10 to-card p-6 shadow-md">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 flex-shrink-0 border-2 border-primary/30 ring-2 ring-background">
            <AvatarImage src={corredor.foto} alt="" />
            <AvatarFallback className="bg-primary/20 text-lg font-bold text-primary">
              {corredor.nome
                .split(/\s+/)
                .slice(0, 2)
                .map((p) => p[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold text-foreground">
              {corredor.nome}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="secondary" className="font-mono">
                Camisa #{corredor.numeroCamisa}
              </Badge>
              <span className="text-muted-foreground">
                {corredor.categoria} · {corredor.idade} anos
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <StatBig
            icon={Trophy}
            label="Posição"
            value={`${minhaPosicao}º`}
            sub={`${posCategoria || '—'}º na categ.`}
          />
          <StatBig
            icon={Activity}
            label="Tempo"
            value={ultimoCrono ? formatTempo(ultimoCrono.tempoTotal) : '—'}
            sub={ultimoCp ? ultimoCp.nome : 'aguardando'}
            mono
          />
          <StatBig
            icon={Gauge}
            label="Ritmo"
            value={formatRitmo(paceMedio)}
            sub="médio"
            mono
          />
        </div>
      </Card>

      {/* ─────────────── PRÓXIMO CHECKPOINT ─────────────── */}
      <Card className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {finalizou ? 'Prova concluída' : 'Próximo checkpoint'}
            </p>
          </div>
          {!finalizou && proximoCp && (
            <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
              {proximoCp.nome}
            </span>
          )}
        </div>
        {finalizou ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Trophy className="h-10 w-10 text-amber-500" />
            <p className="text-sm font-semibold text-foreground">
              Você cruzou a chegada!
            </p>
            <p className="font-mono text-2xl font-bold text-primary">
              {ultimoCrono ? formatTempo(ultimoCrono.tempoTotal) : '—'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-lg border border-border bg-card/50 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Faltam
                </p>
                <p className="font-mono text-2xl font-bold tabular-nums text-foreground">
                  {distanciaParaProximo.toFixed(1)}
                  <span className="ml-1 text-xs font-medium text-muted-foreground">
                    km
                  </span>
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card/50 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  ETA (no ritmo atual)
                </p>
                <p className="font-mono text-2xl font-bold tabular-nums text-foreground">
                  {Math.round(etaSegundos / 60)}
                  <span className="ml-1 text-xs font-medium text-muted-foreground">
                    min
                  </span>
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>
                  {kmCorridos} / {DISTANCIA_TOTAL} km
                </span>
                <span>{Math.round(progresso)}%</span>
              </div>
              <Progress value={progresso} className="h-2" />
            </div>
          </>
        )}
      </Card>

      {/* ─────────────── BPM ─────────────── */}
      <Card
        className={cn(
          'space-y-4 p-5',
          bpmAtual !== undefined &&
            bpmTom(bpmAtual) === 'vermelho' &&
            'border-destructive/40 bg-destructive/5',
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-destructive" />
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Sua frequência cardíaca
            </p>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Zona segura: {FAIXA_BPM_SEGURA.min}–{FAIXA_BPM_SEGURA.max}
          </span>
        </div>

        <div className="flex flex-col items-center gap-3 py-4">
          <BPMDisplay bpm={bpmAtual} size="xl" />
          {bpmAtual !== undefined && bpmTom(bpmAtual) === 'vermelho' && (
            <p className="rounded-full bg-destructive/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-destructive">
              ⚠ Reduza o ritmo
            </p>
          )}
        </div>

        {ultimosBpms.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Últimos 5 min
            </p>
            <div className="h-16 w-full">
              <ResponsiveContainer>
                <AreaChart
                  data={ultimosBpms}
                  margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="grad-bpm-mini"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="bpm"
                    stroke="#ef4444"
                    fill="url(#grad-bpm-mini)"
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </Card>

      {/* ─────────────── PARCIAIS ─────────────── */}
      <Card className="p-5">
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Tempos parciais
        </p>
        <ol className="space-y-3">
          {checkpointsOrdenados.map((cp, i) => {
            const meu = meusCronos.find((c) => c.checkpoint === cp.id)
            const passou = !!meu
            const ehProximo =
              !passou && ultimoCp && cp.posicaoKm > ultimoCp.posicaoKm &&
              (i === 0 || checkpointsOrdenados[i - 1].posicaoKm === ultimoCp.posicaoKm)

            const cpAnterior = i > 0 ? checkpointsOrdenados[i - 1] : null
            const meuAnterior = cpAnterior
              ? meusCronos.find((c) => c.checkpoint === cpAnterior.id)
              : null
            const ritmoTrecho =
              meu && meuAnterior && cpAnterior
                ? meu.tempoParcial /
                  (cp.posicaoKm - cpAnterior.posicaoKm)
                : meu && cp.posicaoKm > 0
                ? meu.tempoTotal / cp.posicaoKm
                : null
            const diffRitmo =
              ritmoTrecho !== null ? ritmoTrecho - paceMedio : null

            return (
              <li key={cp.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full ring-2 ring-background',
                      passou
                        ? 'bg-primary text-primary-foreground'
                        : ehProximo
                        ? 'bg-amber-500/20 text-amber-500 animate-pulse-slow'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {passou ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Circle className="h-3.5 w-3.5" />
                    )}
                  </span>
                  {i < checkpointsOrdenados.length - 1 && (
                    <span
                      className={cn(
                        'mt-1 h-full w-px flex-1 min-h-[28px]',
                        passou ? 'bg-primary/40' : 'bg-border',
                      )}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1 pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        'font-semibold',
                        passou
                          ? 'text-foreground'
                          : ehProximo
                          ? 'text-amber-500'
                          : 'text-muted-foreground',
                      )}
                    >
                      {cp.nome}
                    </p>
                    {meu && (
                      <span className="font-mono text-sm font-semibold tabular-nums">
                        {formatTempo(meu.tempoTotal)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-muted-foreground">
                    <span>{cp.posicaoKm} km</span>
                    {meu && ritmoTrecho !== null && (
                      <span className="font-mono">
                        {formatRitmo(ritmoTrecho)}
                      </span>
                    )}
                    {diffRitmo !== null && Math.abs(diffRitmo) > 1 && (
                      <span
                        className={cn(
                          'inline-flex items-center gap-0.5 font-mono font-semibold',
                          diffRitmo < 0 ? 'text-primary' : 'text-destructive',
                        )}
                      >
                        {diffRitmo < 0 ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )}
                        {Math.abs(Math.round(diffRitmo))}s/km vs média
                      </span>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </Card>

      {/* ─────────────── VIZINHOS NA PROVA ─────────────── */}
      <Card className="space-y-4 p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Posicionamento
          </p>
          <p className="mt-1 text-lg font-bold text-foreground">
            {corredoresAtras} corredores estão atrás de você
          </p>
        </div>

        {aFrente.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
              Você pode ultrapassar
            </p>
            {aFrente.map((r) => (
              <CorredorCard
                key={r.corredor.id}
                corredor={r.corredor}
                posicao={r.posicao}
                tempoAtual={r.tempoAtual}
                ultimoCheckpoint={
                  checkpointPorId.get(r.ultimoCheckpoint)?.nome
                }
                showBPM={false}
                href={ROUTES.ESPECTADOR.CORREDOR_DETALHE.replace(
                  ':id',
                  r.corredor.id,
                )}
              />
            ))}
          </div>
        )}

        {atras.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-destructive">
              Você precisa segurar
            </p>
            {atras.map((r) => (
              <CorredorCard
                key={r.corredor.id}
                corredor={r.corredor}
                posicao={r.posicao}
                tempoAtual={r.tempoAtual}
                ultimoCheckpoint={
                  checkpointPorId.get(r.ultimoCheckpoint)?.nome
                }
                showBPM={false}
                href={ROUTES.ESPECTADOR.CORREDOR_DETALHE.replace(
                  ':id',
                  r.corredor.id,
                )}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function StatBig({
  icon: Icon,
  label,
  value,
  sub,
  mono,
}: {
  icon: LucideIcon
  label: string
  value: string
  sub: string
  mono?: boolean
}) {
  return (
    <div className="space-y-1 text-center">
      <Icon className="mx-auto h-4 w-4 text-primary" />
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          'text-2xl font-bold leading-none text-foreground',
          mono && 'font-mono tabular-nums',
        )}
      >
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground">{sub}</p>
    </div>
  )
}
