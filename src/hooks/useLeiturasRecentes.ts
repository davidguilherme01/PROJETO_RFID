import { useEffect, useRef, useState } from 'react'
import { mockCheckpoints, mockCorredores, mockLeiturasRFID } from '@/data'
import type { LeituraRFID } from '@/types'

const MAX_EM_MEMORIA = 50
const MIN_INTERVALO_MS = 3000
const MAX_INTERVALO_MS = 7000

interface UseLeiturasRecentes {
  leituras: LeituraRFID[]
  novaLeituraId: string | null
}

// Corredores ativos que podem produzir leituras novas.
const ativos = mockCorredores.filter((c) => c.status === 'ativo')

function gerarLeitura(): LeituraRFID {
  const cor = ativos[Math.floor(Math.random() * ativos.length)]
  const cp =
    mockCheckpoints[Math.floor(Math.random() * mockCheckpoints.length)]
  return {
    id: `LR-LIVE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    tagId: cor.tagRFID,
    antenaId: cp.antenaId,
    timestamp: new Date().toISOString(),
    checkpoint: cp.id,
  }
}

function sortDesc(leituras: LeituraRFID[]) {
  return [...leituras].sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

export function useLeiturasRecentes(): UseLeiturasRecentes {
  const [leituras, setLeituras] = useState<LeituraRFID[]>(() =>
    sortDesc(mockLeiturasRFID).slice(0, MAX_EM_MEMORIA),
  )
  const [novaLeituraId, setNovaLeituraId] = useState<string | null>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    let cancelled = false

    const schedule = () => {
      const delay =
        MIN_INTERVALO_MS +
        Math.random() * (MAX_INTERVALO_MS - MIN_INTERVALO_MS)
      timerRef.current = window.setTimeout(() => {
        if (cancelled) return
        const nova = gerarLeitura()
        setLeituras((prev) =>
          [nova, ...prev].slice(0, MAX_EM_MEMORIA),
        )
        setNovaLeituraId(nova.id)
        // Limpa o highlight de "nova" após a animação terminar.
        window.setTimeout(() => {
          if (!cancelled) setNovaLeituraId((id) => (id === nova.id ? null : id))
        }, 1500)
        schedule()
      }, delay)
    }

    schedule()
    return () => {
      cancelled = true
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  return { leituras, novaLeituraId }
}
