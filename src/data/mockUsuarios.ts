import type { Usuario } from '@/types'

// Usuários de demo para o login. Senha aceita: qualquer valor (auth mockada).
// O corredorId em u-corredor precisa bater com um id válido em mockCorredores.
export const mockUsuarios: Usuario[] = [
  {
    id: 'u-admin',
    nome: 'Carlos Mendes',
    email: 'admin@racetrack.com',
    perfil: 'administrador',
  },
  {
    id: 'u-corredor',
    nome: 'Ana Carolina Silva',
    email: 'corredor@racetrack.com',
    perfil: 'corredor',
    corredorId: 'COR-001',
  },
  {
    id: 'u-espectador',
    nome: 'Roberto Almeida',
    email: 'espectador@racetrack.com',
    perfil: 'espectador',
  },
]
