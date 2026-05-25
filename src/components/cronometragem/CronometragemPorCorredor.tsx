import { format } from 'date-fns'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { mockCheckpoints, mockCorredores, mockCronometragem } from '@/data'
import { RACE_START_MS } from '@/data/mockCronometragem'
import { liveStatusLabels, liveStatusOf } from '@/store/corredoresStore'
import { cn } from '@/lib/utils'

const checkpointPorId = new Map(mockCheckpoints.map((c) => [c.id, c]))
const checkpointsOrdenados = [...mockCheckpoints].sort(
  (a, b) => a.posicaoKm - b.posicaoKm,
)

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
  return `${m}'${s.toString().padStart(2, '0')}"`
}

function iniciais(nome: string) {
  return nome.split(/\s+/).slice(0, 2).map((p) => p[0]).join('')
}

export function CronometragemPorCorredor() {
  const ativos = mockCorredores.filter((c) => c.status === 'ativo')
  const [corredorId, setCorredorId] = useState(ativos[0]?.id ?? '')
  const corredor = ativos.find((c) => c.id === corredorId)

  const dados = useMemo(() => {
    if (!corredor) return null
    const cronos = mockCronometragem
      .filter((c) => c.corredorId === corredor.id)
      .sort((a, b) => {
        const ak = checkpointPorId.get(a.checkpoint)?.posicaoKm ?? 0
        const bk = checkpointPorId.get(b.checkpoint)?.posicaoKm ?? 0
        return ak - bk
      })

    // Para cada parcial, calcula ritmo do trecho e compara com o anterior.
    const linhas = cronos.map((c, i) => {
      const cp = checkpointPorId.get(c.checkpoint)!
      const cpAnterior = i > 0 ? checkpointPorId.get(cronos[i - 1].checkpoint) : null
      const distTrecho = cp.posicaoKm - (cpAnterior?.posicaoKm ?? 0)
      const ritmoTrecho = distTrecho > 0 ? c.tempoParcial / distTrecho : 0
      const horario = new Date(RACE_START_MS + c.tempoTotal * 1000)
      return { c, cp, ritmoTrecho, distTrecho, horario }
    })

    // Aceleração = diff de ritmo entre trechos consecutivos.
    const linhasComDelta = linhas.map((l, i) => {
      if (i === 0) return { ...l, delta: 0 }
      const anterior = linhas[i - 1].ritmoTrecho
      const delta = l.ritmoTrecho - anterior
      return { ...l, delta }
    })

    // Melhor da categoria (entre quem chegou no mesmo checkpoint final).
    const ultimoCp = cronos[cronos.length - 1]
    const concorrentes = mockCronometragem
      .filter(
        (c) =>
          c.checkpoint === ultimoCp?.checkpoint &&
          ativos.find((a) => a.id === c.corredorId)?.categoria ===
            corredor.categoria,
      )
      .sort((a, b) => a.tempoTotal - b.tempoTotal)
    const melhorCategoria = concorrentes[0]
    const meuTempo = ultimoCp?.tempoTotal ?? 0
    const diffMelhor = melhorCategoria
      ? meuTempo - melhorCategoria.tempoTotal
      : null

    return { linhas: linhasComDelta, melhorCategoria, diffMelhor, meuTempo }
  }, [corredor, ativos])

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Corredor
        </label>
        <Select value={corredorId} onValueChange={setCorredorId}>
          <SelectTrigger className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ativos.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                #{c.numeroCamisa} · {c.nome} · {c.categoria}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {corredor && dados && (
        <>
          <Card className="flex items-center gap-4 p-5">
            <Avatar className="h-14 w-14 border border-border">
              <AvatarImage src={corredor.foto} alt="" />
              <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">
                {iniciais(corredor.nome)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-bold">{corredor.nome}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="secondary" className="font-mono">
                  #{corredor.numeroCamisa}
                </Badge>
                <span className="text-muted-foreground">
                  {corredor.categoria}
                </span>
                <StatusBadge
                  status={liveStatusOf(corredor)}
                  label={liveStatusLabels[liveStatusOf(corredor)]}
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Tempo total
              </p>
              <p className="font-mono text-xl font-bold tabular-nums text-foreground">
                {formatTempo(dados.meuTempo)}
              </p>
            </div>
          </Card>

          {dados.melhorCategoria && dados.diffMelhor !== null && (
            <Card className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Melhor da categoria · {corredor.categoria}
                </p>
                <p className="mt-1 text-sm font-medium">
                  {mockCorredores.find(
                    (c) => c.id === dados.melhorCategoria!.corredorId,
                  )?.nome}{' '}
                  <span className="font-mono text-muted-foreground">
                    ({formatTempo(dados.melhorCategoria.tempoTotal)})
                  </span>
                </p>
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  'border-0 font-mono',
                  dados.diffMelhor === 0
                    ? 'bg-primary/15 text-primary'
                    : dados.diffMelhor > 0
                    ? 'bg-destructive/15 text-destructive'
                    : 'bg-primary/15 text-primary',
                )}
              >
                {dados.diffMelhor === 0
                  ? 'Você é o melhor'
                  : dados.diffMelhor > 0
                  ? `+${formatTempo(dados.diffMelhor)}`
                  : formatTempo(dados.diffMelhor)}
              </Badge>
            </Card>
          )}

          {/* Timeline horizontal */}
          <Card className="overflow-x-auto p-5">
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Timeline de checkpoints
            </p>
            <div className="flex min-w-[640px] gap-3">
              {checkpointsOrdenados.map((cp, i) => {
                const linha = dados.linhas.find((l) => l.cp.id === cp.id)
                const passou = !!linha
                const ehProximo =
                  !passou &&
                  i > 0 &&
                  dados.linhas.find(
                    (l) => l.cp.id === checkpointsOrdenados[i - 1].id,
                  )
                return (
                  <div key={cp.id} className="flex-1 min-w-[150px]">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'flex h-3 w-3 rounded-full',
                          passou
                            ? 'bg-primary'
                            : ehProximo
                            ? 'bg-amber-500 animate-pulse-slow'
                            : 'bg-muted',
                        )}
                      />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {cp.nome} · {cp.posicaoKm}km
                      </span>
                    </div>
                    <div
                      className={cn(
                        'mt-2 space-y-1 rounded-lg border p-3',
                        passou
                          ? 'border-primary/30 bg-primary/5'
                          : ehProximo
                          ? 'border-amber-500/30 bg-amber-500/5'
                          : 'border-border bg-card/50 opacity-60',
                      )}
                    >
                      {linha ? (
                        <>
                          <p className="font-mono text-xs text-muted-foreground">
                            {format(linha.horario, 'HH:mm:ss')}
                          </p>
                          <p className="font-mono text-sm font-bold tabular-nums">
                            {formatTempo(linha.c.tempoTotal)}
                          </p>
                          <div className="flex items-center justify-between border-t border-border/50 pt-1.5 text-[11px]">
                            <span className="text-muted-foreground">parcial</span>
                            <span className="font-mono">
                              {formatTempo(linha.c.tempoParcial)}
                            </span>
                          </div>
                          {linha.ritmoTrecho > 0 && (
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground">
                                ritmo
                              </span>
                              <span className="inline-flex items-center gap-1 font-mono">
                                {formatRitmo(linha.ritmoTrecho)}/km
                                {linha.delta !== 0 && (
                                  <DeltaIcon delta={linha.delta} />
                                )}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="py-2 text-center text-[11px] text-muted-foreground">
                          {ehProximo ? 'Próximo' : 'Aguardando'}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

function DeltaIcon({ delta }: { delta: number }) {
  if (Math.abs(delta) < 2) return <Minus className="h-3 w-3 text-muted-foreground" />
  if (delta < 0) return <ArrowUp className="h-3 w-3 text-primary" />
  return <ArrowDown className="h-3 w-3 text-destructive" />
}
