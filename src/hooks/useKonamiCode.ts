import { useEffect, useRef } from 'react'

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
] as const

// Dispara `onMatch` quando o usuário digita a sequência completa.
// Mantém um buffer rolante do tamanho da sequência.
export function useKonamiCode(onMatch: () => void) {
  const buffer = useRef<string[]>([])
  const callback = useRef(onMatch)
  callback.current = onMatch

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      buffer.current = [...buffer.current, key].slice(-KONAMI.length)
      if (
        buffer.current.length === KONAMI.length &&
        buffer.current.every((k, i) => k === KONAMI[i])
      ) {
        buffer.current = []
        callback.current()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])
}
