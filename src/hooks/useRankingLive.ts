import { useEffect, useRef, useState } from 'react'
import { mockCheckpoints, mockCorredores, mockCronometragem } from '@/data'
import type { Corredor } from '@/types'

export interface RankingLiveItem {
  posicao: number
  posicaoAnterior: number
  variacao: 'subiu' | 'desceu' | 'mantido'
  corredor: Corredor
  ultimoCheckpoint: string
  tempoAtual: number // segundos
}

// Mapa para resolver corredorId → Corredor.
const corredorPorId = new Map(mockCorredores.map((c) => [c.id, c]))
const checkpointPorId = new Map(mockCheckpoints.map((c) => [c.id, c]))

// Score: maior checkpoint alcançado tem precedência; em empate, menor tempoTotal.
// Resultado é um array de corredorIds em ordem do 1º colocado em diante.
function calcularRanking(): RankingLiveItem[] {
  const ultimoPorCorredor = new Map<
    string,
    { checkpointId: string; checkpointKm: number; tempoTotal: number }
  >()
  for (const c of mockCronometragem) {
    const km = checkpointPorId.get(c.checkpoint)?.posicaoKm ?? 0
    const atual = ultimoPorCorredor.get(c.corredorId)
    if (!atual || km > atual.checkpointKm) {
      ultimoPorCorredor.set(c.corredorId, {
        checkpointId: c.checkpoint,
        checkpointKm: km,
        tempoTotal: c.tempoTotal,
      })
    }
  }

  const ordenados = Array.from(ultimoPorCorredor.entries())
    .sort(([, a], [, b]) => {
      if (a.checkpointKm !== b.checkpointKm) return b.checkpointKm - a.checkpointKm
      return a.tempoTotal - b.tempoTotal
    })
    .flatMap(([corredorId, info]) => {
      const corredor = corredorPorId.get(corredorId)
      return corredor ? [{ corredor, info }] : []
    })

  return ordenados.map(({ corredor, info }, idx) => ({
    posicao: idx + 1,
    posicaoAnterior: idx + 1,
    variacao: 'mantido',
    corredor,
    ultimoCheckpoint: info.checkpointId,
    tempoAtual: info.tempoTotal,
  }))
}

const TICK_MS = 5000
const CHANCE_SWAP = 0.2 // 20% de chance de swap por par adjacente

function shuffleNeighbors(ranking: RankingLiveItem[]): RankingLiveItem[] {
  // Faz uma cópia com posições anteriores zeradas pra calcular diff depois.
  const novo = ranking.map((r) => ({ ...r, posicaoAnterior: r.posicao }))
  for (let i = 0; i < novo.length - 1; i++) {
    if (Math.random() < CHANCE_SWAP) {
      const tmp = novo[i]
      novo[i] = novo[i + 1]
      novo[i + 1] = tmp
    }
  }
  // Reatribui posições e calcula variação.
  return novo.map((item, idx) => {
    const novaPos = idx + 1
    let variacao: RankingLiveItem['variacao'] = 'mantido'
    if (novaPos < item.posicaoAnterior) variacao = 'subiu'
    else if (novaPos > item.posicaoAnterior) variacao = 'desceu'
    return { ...item, posicao: novaPos, variacao }
  })
}

export function useRankingLive(): RankingLiveItem[] {
  const baseRef = useRef<RankingLiveItem[]>(calcularRanking())
  const [ranking, setRanking] = useState<RankingLiveItem[]>(baseRef.current)

  useEffect(() => {
    const id = window.setInterval(() => {
      setRanking((prev) => shuffleNeighbors(prev))
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [])

  return ranking
}
