import { useCallback, useEffect, useRef, useState } from 'react'
import { mockCorredores } from '@/data'
import type { Corredor } from '@/types'

export type TipoAlerta = 'alto' | 'baixo' | 'critico'

export interface AlertaCardiaco {
  id: string
  corredor: Corredor
  bpm: number
  tipo: TipoAlerta
  timestamp: number
}

const ativos = mockCorredores.filter((c) => c.status === 'ativo')
const MIN_INTERVALO_MS = 30_000
const MAX_INTERVALO_MS = 60_000

function gerarAlerta(): AlertaCardiaco {
  const cor = ativos[Math.floor(Math.random() * ativos.length)]
  const tipos: TipoAlerta[] = ['alto', 'baixo', 'critico']
  const tipo = tipos[Math.floor(Math.random() * tipos.length)]
  const bpm =
    tipo === 'baixo'
      ? Math.floor(70 + Math.random() * 20) // 70-90
      : tipo === 'critico'
      ? Math.floor(190 + Math.random() * 15) // 190-205
      : Math.floor(180 + Math.random() * 10) // 180-190
  return {
    id: `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    corredor: cor,
    bpm,
    tipo,
    timestamp: Date.now(),
  }
}

// Semeia alguns alertas iniciais para o dashboard não nascer vazio.
function gerarAlertasIniciais(): AlertaCardiaco[] {
  const agora = Date.now()
  return [
    {
      id: 'ALT-INI-1',
      corredor: mockCorredores.find((c) => c.id === 'COR-018') ?? ativos[0],
      bpm: 192,
      tipo: 'critico',
      timestamp: agora - 95_000,
    },
    {
      id: 'ALT-INI-2',
      corredor: mockCorredores.find((c) => c.id === 'COR-011') ?? ativos[1],
      bpm: 184,
      tipo: 'alto',
      timestamp: agora - 220_000,
    },
    {
      id: 'ALT-INI-3',
      corredor: mockCorredores.find((c) => c.id === 'COR-005') ?? ativos[2],
      bpm: 88,
      tipo: 'baixo',
      timestamp: agora - 380_000,
    },
  ]
}

export interface UseAlertasCardiacos {
  alertas: AlertaCardiaco[]
  resolverAlerta: (id: string) => void
}

export function useAlertasCardiacos(): UseAlertasCardiacos {
  const [alertas, setAlertas] = useState<AlertaCardiaco[]>(() =>
    gerarAlertasIniciais(),
  )
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    let cancelled = false
    const schedule = () => {
      const delay =
        MIN_INTERVALO_MS +
        Math.random() * (MAX_INTERVALO_MS - MIN_INTERVALO_MS)
      timerRef.current = window.setTimeout(() => {
        if (cancelled) return
        setAlertas((prev) => [gerarAlerta(), ...prev].slice(0, 10))
        schedule()
      }, delay)
    }
    schedule()
    return () => {
      cancelled = true
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  const resolverAlerta = useCallback((id: string) => {
    setAlertas((prev) => prev.filter((a) => a.id !== id))
  }, [])

  return { alertas, resolverAlerta }
}
