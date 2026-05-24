import { Flag, MapPin } from 'lucide-react'
import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { mockCheckpoints, mockCronometragem } from '@/data'

interface Segmento {
  // ID do checkpoint inicial do segmento (corredor está depois deste e antes do próximo).
  fromCheckpointId: string
  fromKm: number
  toKm: number
  count: number
  isFinal: boolean // true para o último (corredores AT chegada)
}

function calcularDistribuicao(): Segmento[] {
  // Para cada corredor, descobrir o maior checkpoint que ele alcançou.
  const ultimoPorCorredor = new Map<string, string>()
  for (const c of mockCronometragem) {
    const cpAtual = mockCheckpoints.find((cp) => cp.id === c.checkpoint)
    const atual = ultimoPorCorredor.get(c.corredorId)
    const atualCp = atual
      ? mockCheckpoints.find((cp) => cp.id === atual)
      : undefined
    if (!cpAtual) continue
    if (!atualCp || cpAtual.posicaoKm > atualCp.posicaoKm) {
      ultimoPorCorredor.set(c.corredorId, c.checkpoint)
    }
  }

  // Conta quantos corredores estão "em cada segmento" (entre cpN e cpN+1).
  // O último (chegada) é um ponto final, não um segmento.
  const cps = [...mockCheckpoints].sort((a, b) => a.posicaoKm - b.posicaoKm)
  const segmentos: Segmento[] = []
  for (let i = 0; i < cps.length; i++) {
    const cp = cps[i]
    const next = cps[i + 1]
    const count = Array.from(ultimoPorCorredor.values()).filter(
      (id) => id === cp.id,
    ).length
    segmentos.push({
      fromCheckpointId: cp.id,
      fromKm: cp.posicaoKm,
      toKm: next ? next.posicaoKm : cp.posicaoKm,
      count,
      isFinal: !next,
    })
  }
  return segmentos
}

export function DistribuicaoPercurso() {
  const segmentos = useMemo(() => calcularDistribuicao(), [])
  const cps = useMemo(
    () => [...mockCheckpoints].sort((a, b) => a.posicaoKm - b.posicaoKm),
    [],
  )
  const distanciaTotal = cps[cps.length - 1]?.posicaoKm ?? 21
  const maxCount = Math.max(1, ...segmentos.map((s) => s.count))

  return (
    <Card className="transition-shadow duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          Distribuição de corredores no percurso
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Posição estimada com base no último checkpoint cruzado
        </p>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="w-full overflow-x-auto pb-2">
            <svg
              viewBox="0 0 1000 140"
              className="h-32 w-full min-w-[640px]"
              preserveAspectRatio="none"
            >
              {/* Linha base do percurso */}
              <line
                x1="40"
                x2="960"
                y1="90"
                y2="90"
                stroke="hsl(var(--border))"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Marcadores de checkpoint */}
              {cps.map((cp) => {
                const x = 40 + (cp.posicaoKm / distanciaTotal) * 920
                const isFlag = cp.posicaoKm === 0 || cp.posicaoKm === distanciaTotal
                return (
                  <g key={cp.id}>
                    <circle
                      cx={x}
                      cy={90}
                      r={isFlag ? 8 : 6}
                      fill="hsl(var(--card))"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                    />
                    <text
                      x={x}
                      y={120}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="600"
                      fill="hsl(var(--foreground))"
                    >
                      {cp.nome}
                    </text>
                    <text
                      x={x}
                      y={134}
                      textAnchor="middle"
                      fontSize="9"
                      fill="hsl(var(--muted-foreground))"
                    >
                      {cp.posicaoKm} km
                    </text>
                  </g>
                )
              })}

              {/* Bolhas de distribuição */}
              {segmentos.map((s) => {
                if (s.count === 0) return null
                // posição X = meio do segmento (para finais, em cima do CP)
                const midKm = s.isFinal ? s.fromKm : (s.fromKm + s.toKm) / 2
                const x = 40 + (midKm / distanciaTotal) * 920
                const r = 10 + (s.count / maxCount) * 24

                const fromCp = mockCheckpoints.find(
                  (c) => c.id === s.fromCheckpointId,
                )
                const toCp = s.isFinal
                  ? null
                  : mockCheckpoints.find((c) => c.posicaoKm === s.toKm)
                const labelTooltip = s.isFinal
                  ? `${s.count} corredor${s.count === 1 ? '' : 'es'} já finalizou`
                  : `${s.count} corredor${s.count === 1 ? '' : 'es'} entre ${fromCp?.nome ?? ''} e ${toCp?.nome ?? ''}`

                return (
                  <UiTooltip key={s.fromCheckpointId}>
                    <TooltipTrigger asChild>
                      <g className="cursor-pointer">
                        <circle
                          cx={x}
                          cy={50}
                          r={r}
                          fill={
                            s.isFinal
                              ? 'hsl(var(--primary) / 0.6)'
                              : 'hsl(var(--primary) / 0.3)'
                          }
                          stroke="hsl(var(--primary))"
                          strokeWidth="1.5"
                          className="transition-all duration-500"
                        >
                          <animateTransform
                            attributeName="transform"
                            type="translate"
                            values="0 0; 0 -2; 0 0"
                            dur="3s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        <text
                          x={x}
                          y={55}
                          textAnchor="middle"
                          fontSize="14"
                          fontWeight="700"
                          fill="hsl(var(--primary-foreground))"
                        >
                          {s.count}
                        </text>
                      </g>
                    </TooltipTrigger>
                    <TooltipContent>{labelTooltip}</TooltipContent>
                  </UiTooltip>
                )
              })}
            </svg>
          </div>
        </TooltipProvider>

        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Flag className="h-3 w-3" />
            {cps[0]?.nome}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {cps[cps.length - 1]?.nome}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
