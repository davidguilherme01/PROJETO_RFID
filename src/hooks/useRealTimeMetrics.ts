import { useEffect, useRef, useState } from 'react'
import { mockFrequencia } from '@/data'

export interface MetricPoint {
  timestamp: number
  value: number
}

export interface Metric {
  current: number
  variacao: number // % vs 1h atrás (ou janela completa se < 1h)
  historico: MetricPoint[]
}

export interface RealTimeMetrics {
  bpmMedio: Metric
  leiturasMin: Metric
  velocidadeMedia: Metric
}

// 30 min de histórico, amostra a cada 5s → 360 pontos.
const TICK_MS = 5000
const HISTORICO_MAX = 360

// Calcula baseline a partir dos mocks. BPM = média dos últimos pontos
// por corredor monitorado. Leituras/min e velocidade média são valores
// plausíveis para uma meia em andamento.
function computeBaselines() {
  const bpmsPorCorredor = new Map<string, number[]>()
  for (const fc of mockFrequencia) {
    const arr = bpmsPorCorredor.get(fc.corredorId) ?? []
    arr.push(fc.bpm)
    bpmsPorCorredor.set(fc.corredorId, arr)
  }
  const ultimos = Array.from(bpmsPorCorredor.values()).map(
    (arr) => arr[arr.length - 1] ?? 0,
  )
  const bpmBase = ultimos.length
    ? ultimos.reduce((a, b) => a + b, 0) / ultimos.length
    : 155

  return {
    bpm: Math.round(bpmBase),
    leiturasMin: 22, // taxa plausível somando todas as antenas
    velocidadeMedia: 11.5,
  }
}

// Random walk centrado na baseline com clamp [min, max] e jitter ±3%.
function nextValue(prev: number, base: number, min: number, max: number) {
  const drift = (base - prev) * 0.15 // puxa de volta pro baseline
  const jitter = prev * 0.03 * (Math.random() * 2 - 1)
  return Math.max(min, Math.min(max, prev + drift + jitter))
}

function seedHistorico(
  base: number,
  min: number,
  max: number,
  now: number,
): MetricPoint[] {
  const pontos: MetricPoint[] = []
  let v = base
  for (let i = HISTORICO_MAX - 1; i >= 0; i--) {
    v = nextValue(v, base, min, max)
    pontos.push({ timestamp: now - i * TICK_MS, value: v })
  }
  return pontos
}

function variacaoPercentual(historico: MetricPoint[]): number {
  if (historico.length < 2) return 0
  // "1h atrás" — usamos 720 pontos = 60min (mas só temos 360 = 30min),
  // então comparamos com o ponto mais antigo disponível.
  const antigo = historico[0].value
  const atual = historico[historico.length - 1].value
  if (antigo === 0) return 0
  return ((atual - antigo) / antigo) * 100
}

export function useRealTimeMetrics(): RealTimeMetrics {
  const baselines = useRef(computeBaselines())
  const [metrics, setMetrics] = useState<RealTimeMetrics>(() => {
    const now = Date.now()
    const bpmHist = seedHistorico(baselines.current.bpm, 130, 185, now)
    const leitHist = seedHistorico(
      baselines.current.leiturasMin,
      8,
      40,
      now,
    )
    const velHist = seedHistorico(
      baselines.current.velocidadeMedia,
      9,
      14,
      now,
    )
    return {
      bpmMedio: {
        current: bpmHist[bpmHist.length - 1].value,
        variacao: variacaoPercentual(bpmHist),
        historico: bpmHist,
      },
      leiturasMin: {
        current: leitHist[leitHist.length - 1].value,
        variacao: variacaoPercentual(leitHist),
        historico: leitHist,
      },
      velocidadeMedia: {
        current: velHist[velHist.length - 1].value,
        variacao: variacaoPercentual(velHist),
        historico: velHist,
      },
    }
  })

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now()
      setMetrics((prev) => {
        const tick = (
          m: Metric,
          base: number,
          min: number,
          max: number,
        ): Metric => {
          const last = m.historico[m.historico.length - 1].value
          const next = nextValue(last, base, min, max)
          const novoHist = [
            ...m.historico.slice(-(HISTORICO_MAX - 1)),
            { timestamp: now, value: next },
          ]
          return {
            current: next,
            variacao: variacaoPercentual(novoHist),
            historico: novoHist,
          }
        }
        return {
          bpmMedio: tick(prev.bpmMedio, baselines.current.bpm, 130, 185),
          leiturasMin: tick(
            prev.leiturasMin,
            baselines.current.leiturasMin,
            8,
            40,
          ),
          velocidadeMedia: tick(
            prev.velocidadeMedia,
            baselines.current.velocidadeMedia,
            9,
            14,
          ),
        }
      })
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [])

  return metrics
}
