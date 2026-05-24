import { format } from 'date-fns'
import { Antenna, Flag, MapPin, Timer } from 'lucide-react'
import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import {
  mockCheckpoints,
  mockCorredores,
  mockCronometragem,
  mockLeiturasRFID,
} from '@/data'
import { cn } from '@/lib/utils'
import type { Checkpoint } from '@/types'

interface CheckpointResumo {
  checkpoint: Checkpoint
  totalPassagens: number
  proximosEsperados: number
  ultimasPassagens: {
    timestamp: string
    corredorNome: string
    numeroCamisa: number
  }[]
}

function buildResumos(): CheckpointResumo[] {
  const corredorPorTag = new Map(mockCorredores.map((c) => [c.tagRFID, c]))
  const totalAtivos = mockCorredores.filter((c) => c.status === 'ativo').length
  const cpsOrdenados = [...mockCheckpoints].sort(
    (a, b) => a.posicaoKm - b.posicaoKm,
  )

  return cpsOrdenados.map((cp, idx) => {
    const passagensCp = mockLeiturasRFID.filter(
      (l) => l.checkpoint === cp.id,
    )
    const ultimasPassagens = [...passagensCp]
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, 10)
      .map((l) => {
        const c = corredorPorTag.get(l.tagId)
        return {
          timestamp: l.timestamp,
          corredorNome: c?.nome ?? '—',
          numeroCamisa: c?.numeroCamisa ?? 0,
        }
      })
    // Próximos esperados = quem já chegou ao cp anterior mas não ao atual.
    const proximosEsperados =
      idx === 0
        ? 0
        : totalAtivos -
          new Set(
            mockCronometragem
              .filter((c) => c.checkpoint === cp.id)
              .map((c) => c.corredorId),
          ).size

    return {
      checkpoint: cp,
      totalPassagens: passagensCp.length,
      proximosEsperados: Math.max(0, proximosEsperados),
      ultimasPassagens,
    }
  })
}

export default function CheckpointsPage() {
  const resumos = useMemo(() => buildResumos(), [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Checkpoints"
        description={`${mockCheckpoints.length} pontos de leitura configurados ao longo do percurso`}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {resumos.map((r) => {
          const isLargada = r.checkpoint.posicaoKm === 0
          const isChegada = r.checkpoint.posicaoKm === Math.max(
            ...mockCheckpoints.map((c) => c.posicaoKm),
          )
          const Icon = isLargada ? Flag : isChegada ? Flag : MapPin
          return (
            <Card
              key={r.checkpoint.id}
              className="overflow-hidden transition-shadow duration-200 hover:shadow-lg"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl',
                        isLargada || isChegada
                          ? 'bg-primary/15 text-primary'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-base font-semibold tracking-tight">
                        {r.checkpoint.nome}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        km {r.checkpoint.posicaoKm}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status="online" label="Ativo" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2 border-y border-border py-3">
                  <Metrica
                    label="Antena"
                    value={r.checkpoint.antenaId.slice(-3)}
                    icon={Antenna}
                  />
                  <Metrica
                    label="Passagens"
                    value={r.totalPassagens.toString()}
                    icon={Timer}
                  />
                  <Metrica
                    label="Esperados"
                    value={r.proximosEsperados.toString()}
                    icon={MapPin}
                  />
                </div>

                <div>
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    Últimas passagens
                  </p>
                  {r.ultimasPassagens.length === 0 ? (
                    <p className="rounded-md border border-dashed border-border bg-card/40 px-3 py-4 text-center text-xs text-muted-foreground">
                      Aguardando primeira leitura
                    </p>
                  ) : (
                    <ul className="space-y-1.5">
                      {r.ultimasPassagens.map((p, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between gap-2 text-xs"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="font-mono text-[10px]"
                            >
                              #{p.numeroCamisa || '—'}
                            </Badge>
                            <span className="truncate text-foreground">
                              {p.corredorNome}
                            </span>
                          </span>
                          <span className="flex-shrink-0 font-mono tabular-nums text-muted-foreground">
                            {format(new Date(p.timestamp), 'HH:mm:ss')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function Metrica({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof MapPin
}) {
  return (
    <div className="space-y-0.5">
      <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </p>
      <p className="font-mono text-base font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  )
}
