import type { Checkpoint } from '@/types'

export const mockCheckpoints: Checkpoint[] = [
  { id: 'CP-01', nome: 'Largada', posicaoKm: 0, antenaId: 'ANT-001' },
  { id: 'CP-02', nome: '5km', posicaoKm: 5, antenaId: 'ANT-002' },
  { id: 'CP-03', nome: '10km', posicaoKm: 10, antenaId: 'ANT-003' },
  { id: 'CP-04', nome: '15km', posicaoKm: 15, antenaId: 'ANT-004' },
  { id: 'CP-05', nome: 'Chegada', posicaoKm: 21, antenaId: 'ANT-005' },
]
