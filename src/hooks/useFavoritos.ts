import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const STORAGE_KEY = 'racetrack:favoritos'

interface FavoritosState {
  favoritos: string[]
  toggle: (id: string) => void
  isFavorito: (id: string) => boolean
  limpar: () => void
}

// Hook simples — não esconde nada por trás de uma factory.
export const useFavoritos = create<FavoritosState>()(
  persist(
    (set, get) => ({
      // Seed com 3 favoritos para a experiência inicial não nascer vazia.
      favoritos: ['COR-002', 'COR-010', 'COR-018'],
      toggle: (id) =>
        set((s) => ({
          favoritos: s.favoritos.includes(id)
            ? s.favoritos.filter((f) => f !== id)
            : [...s.favoritos, id],
        })),
      isFavorito: (id) => get().favoritos.includes(id),
      limpar: () => set({ favoritos: [] }),
    }),
    { name: STORAGE_KEY },
  ),
)
