import { useEffect, useState } from 'react'

// Atrasa a propagação do valor por `delay` ms — útil pra inputs de busca.
export function useDebounce<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(id)
  }, [value, delay])

  return debounced
}
