import type { LeituraRFID } from '@/types'
import { mockCheckpoints } from './mockCheckpoints'
import { mockCorredores } from './mockCorredores'
import { mockCronometragem, RACE_START_MS } from './mockCronometragem'

// Distribuição de leituras por checkpoint — soma exata = 50.
// Mais leituras na largada (todos passam), menos na chegada (poucos finalizaram).
const LEITURAS_POR_CHECKPOINT: Record<string, number> = {
  'CP-01': 16,
  'CP-02': 12,
  'CP-03': 10,
  'CP-04': 8,
  'CP-05': 4,
}

const antenaPorCheckpoint = new Map(
  mockCheckpoints.map((c) => [c.id, c.antenaId]),
)
const tagPorCorredor = new Map(mockCorredores.map((c) => [c.id, c.tagRFID]))

const leituras: LeituraRFID[] = []
let id = 1
for (const cp of mockCheckpoints) {
  const alvo = LEITURAS_POR_CHECKPOINT[cp.id] ?? 0
  const passagens = mockCronometragem
    .filter((c) => c.checkpoint === cp.id)
    .sort((a, b) => a.posicao - b.posicao)
    .slice(0, alvo)
  for (const c of passagens) {
    leituras.push({
      id: `LR-${String(id++).padStart(3, '0')}`,
      tagId: tagPorCorredor.get(c.corredorId)!,
      antenaId: antenaPorCheckpoint.get(cp.id)!,
      timestamp: new Date(RACE_START_MS + c.tempoTotal * 1000).toISOString(),
      checkpoint: cp.id,
    })
  }
}

export const mockLeiturasRFID = leituras
