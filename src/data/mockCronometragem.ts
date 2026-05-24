import type { Cronometragem } from '@/types'
import { mockCheckpoints } from './mockCheckpoints'
import { mockCorredores } from './mockCorredores'

// Corrida ainda em andamento: começou 90 min atrás (relativo a "agora" do load).
// Exportado porque mockLeiturasRFID precisa do mesmo T0 para derivar timestamps coerentes.
const RACE_ELAPSED_S = 90 * 60
export const RACE_START_MS = Date.now() - RACE_ELAPSED_S * 1000

// Ritmo (s/km) por corredor. Inativos não correm e são omitidos do mapa,
// então a iteração abaixo naturalmente os pula.
const paceByCorredorId: Record<string, number> = {
  'COR-001': 245,
  'COR-002': 232,
  'COR-003': 265,
  'COR-004': 290,
  'COR-005': 255,
  'COR-006': 275,
  'COR-007': 305,
  'COR-008': 320,
  'COR-009': 280,
  'COR-010': 250,
  'COR-011': 340,
  'COR-012': 268,
  'COR-013': 295,
  'COR-015': 310,
  'COR-016': 285,
  'COR-017': 330,
  'COR-018': 315,
  'COR-019': 350,
}

const checkpointsOrdenados = [...mockCheckpoints].sort(
  (a, b) => a.posicaoKm - b.posicaoKm,
)

interface RawEntry {
  corredorId: string
  checkpointId: string
  tempoParcial: number
  tempoTotal: number
}

const rawEntries: RawEntry[] = []
for (const cor of mockCorredores) {
  const pace = paceByCorredorId[cor.id]
  if (!pace) continue
  const distanciaCorridaKm = RACE_ELAPSED_S / pace
  let kmAnterior = 0
  for (const cp of checkpointsOrdenados) {
    if (distanciaCorridaKm + 0.01 < cp.posicaoKm) break
    rawEntries.push({
      corredorId: cor.id,
      checkpointId: cp.id,
      tempoParcial: Math.round(pace * (cp.posicaoKm - kmAnterior)),
      tempoTotal: Math.round(pace * cp.posicaoKm),
    })
    kmAnterior = cp.posicaoKm
  }
}

// Para cada checkpoint, posição é o ranking por tempoTotal ascendente.
// Tiebreaker por corredorId garante posições estáveis e únicas (importante na Largada,
// onde todos têm tempoTotal=0).
const posicaoPorCheckpoint = new Map<string, Map<string, number>>()
for (const cp of checkpointsOrdenados) {
  const entradas = rawEntries
    .filter((e) => e.checkpointId === cp.id)
    .sort(
      (a, b) =>
        a.tempoTotal - b.tempoTotal || a.corredorId.localeCompare(b.corredorId),
    )
  const mapa = new Map<string, number>()
  entradas.forEach((e, i) => mapa.set(e.corredorId, i + 1))
  posicaoPorCheckpoint.set(cp.id, mapa)
}

export const mockCronometragem: Cronometragem[] = rawEntries.map((e, i) => ({
  id: `CRN-${String(i + 1).padStart(3, '0')}`,
  corredorId: e.corredorId,
  checkpoint: e.checkpointId,
  tempoParcial: e.tempoParcial,
  tempoTotal: e.tempoTotal,
  posicao: posicaoPorCheckpoint.get(e.checkpointId)!.get(e.corredorId)!,
}))
