import { Flag, MapPin, Route as RouteIcon } from 'lucide-react'
import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { mockCheckpoints, mockCorredores, mockCronometragem } from '@/data'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

const RACE_ELAPSED_S = 90 * 60

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

export default function MinhaRotaPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const corredor = mockCorredores.find((c) => c.id === usuario?.corredorId)

  const dados = useMemo(() => {
    if (!corredor) return null
    const cps = [...mockCheckpoints].sort(
      (a, b) => a.posicaoKm - b.posicaoKm,
    )
    const distanciaTotal = cps[cps.length - 1].posicaoKm

    const meusCronos = mockCronometragem
      .filter((c) => c.corredorId === corredor.id)
      .sort((a, b) => {
        const ak = cps.find((cp) => cp.id === a.checkpoint)?.posicaoKm ?? 0
        const bk = cps.find((cp) => cp.id === b.checkpoint)?.posicaoKm ?? 0
        return ak - bk
      })
    const ultimoCrono = meusCronos[meusCronos.length - 1]
    const ultimoCp = ultimoCrono
      ? cps.find((cp) => cp.id === ultimoCrono.checkpoint)
      : undefined
    const kmCorridos = ultimoCp?.posicaoKm ?? 0
    const paceMedio =
      ultimoCrono && ultimoCp && ultimoCp.posicaoKm > 0
        ? ultimoCrono.tempoTotal / ultimoCp.posicaoKm
        : 320

    // Posição estimada "ao vivo" = quanto andou depois do último cp
    // baseado no pace.
    const tempoDesdeUltimoCp = ultimoCrono
      ? RACE_ELAPSED_S - ultimoCrono.tempoTotal
      : 0
    const kmExtras = Math.max(0, tempoDesdeUltimoCp / paceMedio)
    const posicaoAtualKm = Math.min(
      distanciaTotal,
      kmCorridos + kmExtras,
    )

    const proximoCp = cps.find((cp) => cp.posicaoKm > posicaoAtualKm)
    const distanciaProximo = proximoCp
      ? proximoCp.posicaoKm - posicaoAtualKm
      : 0

    return {
      cps,
      distanciaTotal,
      kmCorridos,
      posicaoAtualKm,
      paceMedio,
      ultimoCp,
      proximoCp,
      distanciaProximo,
      ultimoCrono,
    }
  }, [corredor])

  if (!corredor) {
    return (
      <EmptyState
        icon={RouteIcon}
        title="Sem dados de rota"
        description="Seu perfil ainda não está vinculado a um atleta."
      />
    )
  }
  if (!dados) return null

  const {
    cps,
    distanciaTotal,
    posicaoAtualKm,
    paceMedio,
    ultimoCp,
    proximoCp,
    distanciaProximo,
    ultimoCrono,
  } = dados

  const progressoPct = (posicaoAtualKm / distanciaTotal) * 100
  const finalizou = posicaoAtualKm >= distanciaTotal

  // Coordenadas SVG do percurso. Usamos uma curva ondulada estilizada,
  // não geográfica. Eixo X = km, Y = ondulação.
  const PATH_W = 1000
  const PATH_H = 220
  const padding = 40
  const innerW = PATH_W - padding * 2

  function xOf(km: number) {
    return padding + (km / distanciaTotal) * innerW
  }
  function yOf(km: number) {
    // Onda senoidal para dar personalidade
    return 110 + Math.sin((km / distanciaTotal) * Math.PI * 3) * 30
  }

  // Constrói path completo e path "percorrido" via Bezier-like segments.
  const stepKm = 0.25
  let fullPath = `M ${xOf(0)} ${yOf(0)}`
  for (let km = stepKm; km <= distanciaTotal; km += stepKm) {
    fullPath += ` L ${xOf(km)} ${yOf(km)}`
  }
  let runPath = `M ${xOf(0)} ${yOf(0)}`
  for (let km = stepKm; km <= posicaoAtualKm; km += stepKm) {
    runPath += ` L ${xOf(km)} ${yOf(km)}`
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Minha Rota"
        description="Visualização estilizada do percurso e da sua posição atual."
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${PATH_W} ${PATH_H}`}
            className="h-[220px] w-full min-w-[640px]"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="grad-run" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={1} />
              </linearGradient>
            </defs>

            {/* Percurso completo (cinza) */}
            <path
              d={fullPath}
              stroke="hsl(var(--border))"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />

            {/* Percurso já percorrido (verde forte) */}
            <path
              d={runPath}
              stroke="url(#grad-run)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />

            {/* Checkpoints */}
            {cps.map((cp) => {
              const x = xOf(cp.posicaoKm)
              const y = yOf(cp.posicaoKm)
              const passou = ultimoCp && cp.posicaoKm <= ultimoCp.posicaoKm
              const isExtremo =
                cp.posicaoKm === 0 || cp.posicaoKm === distanciaTotal
              return (
                <g key={cp.id}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isExtremo ? 8 : 6}
                    fill={passou ? 'hsl(var(--primary))' : 'hsl(var(--card))'}
                    stroke={
                      passou
                        ? 'hsl(var(--primary))'
                        : 'hsl(var(--muted-foreground))'
                    }
                    strokeWidth="2"
                  />
                  <text
                    x={x}
                    y={y - 18}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="600"
                    fill="hsl(var(--foreground))"
                  >
                    {cp.nome}
                  </text>
                  <text
                    x={x}
                    y={y + 28}
                    textAnchor="middle"
                    fontSize="9"
                    fill="hsl(var(--muted-foreground))"
                  >
                    {cp.posicaoKm} km
                  </text>
                </g>
              )
            })}

            {/* Posição atual (pulsante) */}
            {!finalizou && (
              <g>
                <circle
                  cx={xOf(posicaoAtualKm)}
                  cy={yOf(posicaoAtualKm)}
                  r={14}
                  fill="hsl(var(--primary) / 0.25)"
                >
                  <animate
                    attributeName="r"
                    from="10"
                    to="22"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.6"
                    to="0"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle
                  cx={xOf(posicaoAtualKm)}
                  cy={yOf(posicaoAtualKm)}
                  r={8}
                  fill="hsl(var(--primary))"
                  stroke="hsl(var(--card))"
                  strokeWidth="3"
                />
                <text
                  x={xOf(posicaoAtualKm)}
                  y={yOf(posicaoAtualKm) + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill="hsl(var(--primary-foreground))"
                >
                  •
                </text>
              </g>
            )}
          </svg>
        </div>

        <div className="flex items-center justify-between border-t border-border p-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Flag className="h-3 w-3" /> Largada
          </span>
          <span className="font-mono font-semibold tabular-nums text-foreground">
            {posicaoAtualKm.toFixed(1)} / {distanciaTotal} km ·{' '}
            {Math.round(progressoPct)}%
          </span>
          <span className="inline-flex items-center gap-1">
            Chegada <Flag className="h-3 w-3" />
          </span>
        </div>
      </Card>

      {/* ─ Stats do trecho atual ─ */}
      <Card className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {finalizou ? 'Você cruzou a chegada' : 'Trecho atual'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Bloco
            label="De"
            value={ultimoCp?.nome ?? 'Largada'}
            sub={`${ultimoCp?.posicaoKm ?? 0} km`}
          />
          <Bloco
            label="Para"
            value={proximoCp?.nome ?? 'Chegada'}
            sub={`${proximoCp?.posicaoKm ?? distanciaTotal} km`}
          />
          <Bloco
            label="Faltam"
            value={`${distanciaProximo.toFixed(1)} km`}
            mono
          />
          <Bloco
            label="No ritmo atual"
            value={`${Math.round((distanciaProximo * paceMedio) / 60)} min`}
            sub={formatRitmo(paceMedio)}
            mono
          />
        </div>

        {ultimoCrono && (
          <div
            className={cn(
              'rounded-lg border border-border bg-card/50 p-3 text-center',
            )}
          >
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Tempo total decorrido
            </p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-foreground">
              {formatTempo(ultimoCrono.tempoTotal)}
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}

function Bloco({
  label,
  value,
  sub,
  mono,
}: {
  label: string
  value: string
  sub?: string
  mono?: boolean
}) {
  return (
    <div className="rounded-lg border border-border bg-card/50 p-3">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          'mt-1 text-lg font-bold text-foreground',
          mono && 'font-mono tabular-nums',
        )}
      >
        {value}
      </p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  )
}
