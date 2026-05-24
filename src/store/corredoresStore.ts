import { create } from 'zustand'
import { mockCheckpoints, mockCorredores, mockCronometragem } from '@/data'
import type { CategoriaCorredor, Corredor } from '@/types'

// Status "vivo" derivado de cronometragem — não é o status estático do corredor.
export type LiveStatus =
  | 'em_prova'
  | 'finalizado'
  | 'desistente'
  | 'desclassificado'

export type FiltroStatus = 'todos' | LiveStatus
export type FiltroCategoria = 'todas' | CategoriaCorredor

export type OrdenacaoColuna =
  | 'nome'
  | 'numeroCamisa'
  | 'categoria'
  | 'status'
  | 'tempoAtual'
  | 'bpmAtual'

export interface OrdenacaoState {
  coluna: OrdenacaoColuna
  direcao: 'asc' | 'desc'
}

interface FiltrosState {
  busca: string
  status: FiltroStatus
  categoria: FiltroCategoria
  apenasComAlertas: boolean
}

interface CorredoresState {
  corredores: Corredor[]
  filtros: FiltrosState
  selecionados: Set<string>
  ordenacao: OrdenacaoState

  // mutações
  adicionar: (c: Corredor) => void
  atualizar: (id: string, patch: Partial<Corredor>) => void
  deletar: (id: string) => void
  deletarSelecionados: () => void

  // filtros
  setBusca: (v: string) => void
  setStatus: (v: FiltroStatus) => void
  setCategoria: (v: FiltroCategoria) => void
  setApenasComAlertas: (v: boolean) => void

  // seleção
  toggleSelecao: (id: string) => void
  toggleTodos: (ids: string[]) => void
  limparSelecao: () => void

  // ordenação
  toggleOrdenacao: (coluna: OrdenacaoColuna) => void
}

// Pré-computa quem finalizou pra evitar percorrer cronometragem em cada filtro.
const cpChegada = mockCheckpoints.find((cp) => cp.nome === 'Chegada')
const finalizadosIds = new Set(
  mockCronometragem
    .filter((c) => c.checkpoint === cpChegada?.id)
    .map((c) => c.corredorId),
)

export function liveStatusOf(corredor: Corredor): LiveStatus {
  if (corredor.status === 'inativo') return 'desistente'
  return finalizadosIds.has(corredor.id) ? 'finalizado' : 'em_prova'
}

export const liveStatusLabels: Record<LiveStatus, string> = {
  em_prova: 'Em prova',
  finalizado: 'Finalizado',
  desistente: 'Desistente',
  desclassificado: 'Desclassificado',
}

export const useCorredoresStore = create<CorredoresState>((set) => ({
  corredores: mockCorredores,
  filtros: {
    busca: '',
    status: 'todos',
    categoria: 'todas',
    apenasComAlertas: false,
  },
  selecionados: new Set(),
  ordenacao: { coluna: 'numeroCamisa', direcao: 'asc' },

  adicionar: (c) =>
    set((s) => ({ corredores: [c, ...s.corredores] })),

  atualizar: (id, patch) =>
    set((s) => ({
      corredores: s.corredores.map((c) =>
        c.id === id ? { ...c, ...patch } : c,
      ),
    })),

  deletar: (id) =>
    set((s) => {
      const novosSelecionados = new Set(s.selecionados)
      novosSelecionados.delete(id)
      return {
        corredores: s.corredores.filter((c) => c.id !== id),
        selecionados: novosSelecionados,
      }
    }),

  deletarSelecionados: () =>
    set((s) => ({
      corredores: s.corredores.filter((c) => !s.selecionados.has(c.id)),
      selecionados: new Set(),
    })),

  setBusca: (v) =>
    set((s) => ({ filtros: { ...s.filtros, busca: v } })),
  setStatus: (v) =>
    set((s) => ({ filtros: { ...s.filtros, status: v } })),
  setCategoria: (v) =>
    set((s) => ({ filtros: { ...s.filtros, categoria: v } })),
  setApenasComAlertas: (v) =>
    set((s) => ({ filtros: { ...s.filtros, apenasComAlertas: v } })),

  toggleSelecao: (id) =>
    set((s) => {
      const novos = new Set(s.selecionados)
      if (novos.has(id)) novos.delete(id)
      else novos.add(id)
      return { selecionados: novos }
    }),

  toggleTodos: (ids) =>
    set((s) => {
      const todosSelecionados = ids.every((id) => s.selecionados.has(id))
      const novos = new Set(s.selecionados)
      if (todosSelecionados) ids.forEach((id) => novos.delete(id))
      else ids.forEach((id) => novos.add(id))
      return { selecionados: novos }
    }),

  limparSelecao: () => set({ selecionados: new Set() }),

  toggleOrdenacao: (coluna) =>
    set((s) => ({
      ordenacao:
        s.ordenacao.coluna === coluna
          ? {
              coluna,
              direcao: s.ordenacao.direcao === 'asc' ? 'desc' : 'asc',
            }
          : { coluna, direcao: 'asc' },
    })),
}))
