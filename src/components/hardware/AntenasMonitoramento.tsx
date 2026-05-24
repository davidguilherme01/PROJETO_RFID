import { Antenna, Signal, SignalLow } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { mockCheckpoints } from '@/data'
import { cn } from '@/lib/utils'

interface AntenaInstancia {
  id: string
  nome: string
  checkpointNome: string
  leiturasUltimos5min: number
  rssiMedio: number // dBm
  status: 'online' | 'offline'
}

// Distribui 10 antenas pelos 5 checkpoints (2 por checkpoint, 1 offline pra
// casar com o "9/10 online" do catálogo).
function gerarAntenas(): AntenaInstancia[] {
  const ant: AntenaInstancia[] = []
  for (let i = 0; i < 10; i++) {
    const cp = mockCheckpoints[i % mockCheckpoints.length]
    ant.push({
      id: `ANT-${String(i + 1).padStart(2, '0')}`,
      nome: `Antena ${String(i + 1).padStart(2, '0')}`,
      checkpointNome: cp.nome,
      leiturasUltimos5min: Math.floor(8 + Math.random() * 60),
      rssiMedio: -45 - Math.floor(Math.random() * 25),
      status: i === 6 ? 'offline' : 'online',
    })
  }
  return ant
}

export function AntenasMonitoramento() {
  const [antenas, setAntenas] = useState<AntenaInstancia[]>(() =>
    gerarAntenas(),
  )

  // Atualiza leituras e RSSI a cada 5s pra simular tráfego ao vivo.
  useEffect(() => {
    const id = window.setInterval(() => {
      setAntenas((prev) =>
        prev.map((a) =>
          a.status === 'offline'
            ? a
            : {
                ...a,
                leiturasUltimos5min: Math.max(
                  0,
                  a.leiturasUltimos5min +
                    Math.floor(Math.random() * 11 - 5),
                ),
                rssiMedio: Math.max(
                  -85,
                  Math.min(-40, a.rssiMedio + Math.floor(Math.random() * 5 - 2)),
                ),
              },
        ),
      )
    }, 5000)
    return () => window.clearInterval(id)
  }, [])

  const maxLeituras = useMemo(
    () => Math.max(1, ...antenas.map((a) => a.leiturasUltimos5min)),
    [antenas],
  )

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {antenas.map((a) => {
        const isOffline = a.status === 'offline'
        const intensidade = a.leiturasUltimos5min / maxLeituras
        return (
          <Card
            key={a.id}
            className={cn(
              'border-2 p-3 transition-shadow duration-200',
              isOffline
                ? 'border-destructive/50'
                : intensidade > 0.7
                ? 'border-primary/50'
                : 'border-border hover:shadow-md',
            )}
          >
            <div className="flex items-center justify-between">
              <Antenna
                className={cn(
                  'h-4 w-4',
                  isOffline ? 'text-destructive' : 'text-primary',
                )}
              />
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  isOffline ? 'bg-destructive' : 'bg-primary animate-pulse-slow',
                )}
              />
            </div>
            <p className="mt-2 text-sm font-semibold">{a.nome}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {a.checkpointNome}
            </p>
            <div className="mt-2 space-y-1 border-t border-border pt-2 text-[11px] tabular-nums">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Leit. 5min</span>
                <span
                  className={cn(
                    'font-mono font-semibold',
                    isOffline ? 'text-muted-foreground' : 'text-foreground',
                  )}
                >
                  {isOffline ? '—' : a.leiturasUltimos5min}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">RSSI</span>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 font-mono',
                    isOffline
                      ? 'text-muted-foreground'
                      : a.rssiMedio > -65
                      ? 'text-primary'
                      : 'text-amber-500',
                  )}
                >
                  {isOffline ? (
                    '—'
                  ) : (
                    <>
                      {a.rssiMedio > -65 ? (
                        <Signal className="h-3 w-3" />
                      ) : (
                        <SignalLow className="h-3 w-3" />
                      )}
                      {a.rssiMedio}
                    </>
                  )}
                </span>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
