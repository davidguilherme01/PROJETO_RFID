import { format } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockCheckpoints, mockCorredores, mockCronometragem } from '@/data'
import { RACE_START_MS } from '@/data/mockCronometragem'

const corredorPorId = new Map(mockCorredores.map((c) => [c.id, c]))
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

export function CronometragemPorCheckpoint() {
  // Tick para forçar re-render "ao vivo" (relativos de tempo se atualizam).
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 5000)
    return () => window.clearInterval(id)
  }, [])

  const porCp = useMemo(() => {
    return checkpointsOrdenados.map((cp) => {
      const cronos = mockCronometragem
        .filter((c) => c.checkpoint === cp.id)
        .sort((a, b) => b.tempoTotal - a.tempoTotal) // mais recente primeiro
      const tempoMedio = cronos.length
        ? Math.round(
            cronos.reduce((s, c) => s + c.tempoTotal, 0) / cronos.length,
          )
        : 0
      return { cp, cronos: cronos.slice(0, 20), tempoMedio, total: cronos.length }
    })
  }, [])

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {porCp.map(({ cp, cronos, tempoMedio, total }) => (
        <Card key={cp.id} className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{cp.nome}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  km {cp.posicaoKm} · {total} passagens
                </p>
              </div>
              <Badge variant="secondary" className="border-0 bg-primary/15 text-primary">
                média {formatTempo(tempoMedio)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pt-0">
            {cronos.length === 0 ? (
              <p className="rounded-md border border-dashed border-border bg-card/40 p-4 text-center text-xs text-muted-foreground">
                Aguardando primeira passagem
              </p>
            ) : (
              <ol className="space-y-1.5">
                {cronos.map((c, idx) => {
                  const cor = corredorPorId.get(c.corredorId)
                  const horario = new Date(RACE_START_MS + c.tempoTotal * 1000)
                  return (
                    <li
                      key={c.id}
                      className="flex items-center justify-between gap-2 rounded-md border border-border bg-card/50 px-3 py-1.5 text-xs"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="w-5 text-right font-mono text-muted-foreground">
                          {idx + 1}.
                        </span>
                        <Badge
                          variant="secondary"
                          className="h-5 font-mono text-[10px]"
                        >
                          #{cor?.numeroCamisa ?? '—'}
                        </Badge>
                        <span className="truncate font-medium">
                          {cor?.nome ?? 'Desconhecido'}
                        </span>
                      </span>
                      <span className="flex-shrink-0 font-mono tabular-nums text-muted-foreground">
                        {format(horario, 'HH:mm:ss')}
                      </span>
                    </li>
                  )
                })}
              </ol>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
