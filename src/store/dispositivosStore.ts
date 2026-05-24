import { create } from 'zustand'

// Hardware page: estado de seleção pro painel lateral de detalhes.
// (Catálogo em si é estático em mockEquipamentos.)
interface DispositivosState {
  itemSelecionadoId: string | null
  selecionar: (id: string | null) => void
}

export const useDispositivosStore = create<DispositivosState>((set) => ({
  itemSelecionadoId: null,
  selecionar: (id) => set({ itemSelecionadoId: id }),
}))
