import type { FrequenciaCardiaca } from '@/types'

// 30 pontos cobrindo os 90 min da corrida — uma amostra a cada 3 min.
const RACE_ELAPSED_S = 90 * 60
const NUM_PONTOS = 30
const INTERVAL_S = RACE_ELAPSED_S / NUM_PONTOS // 180
const RACE_START_MS = Date.now() - RACE_ELAPSED_S * 1000

// Corredores monitorados (5 atletas com cinta cardíaca).
const CORREDORES_MONITORADOS = [
  'COR-001',
  'COR-002',
  'COR-005',
  'COR-010',
  'COR-018',
]

// Curva sintética: baseline por corredor + ramp-up até ~180 bpm + oscilação senoidal.
// Clamp final entre 130 e 180 bpm.
function bpmSintetico(corredorIdx: number, pontoIdx: number): number {
  const baseline = 138 + corredorIdx * 2
  const progresso = pontoIdx / (NUM_PONTOS - 1)
  const ramp = baseline + (180 - baseline) * Math.pow(progresso, 1.3)
  const oscilacao = Math.sin(pontoIdx * 0.8 + corredorIdx) * 3
  return Math.max(130, Math.min(180, Math.round(ramp + oscilacao)))
}

const entries: FrequenciaCardiaca[] = []
let id = 1
CORREDORES_MONITORADOS.forEach((corredorId, ci) => {
  for (let i = 0; i < NUM_PONTOS; i++) {
    entries.push({
      id: `FC-${String(id++).padStart(3, '0')}`,
      corredorId,
      bpm: bpmSintetico(ci, i),
      timestamp: new Date(RACE_START_MS + i * INTERVAL_S * 1000).toISOString(),
    })
  }
})

export const mockFrequencia = entries
