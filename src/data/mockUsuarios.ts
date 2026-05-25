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
    nome: 'Thiago Macedo Cavalcanti',
    email: 'corredor@racetrack.com',
    perfil: 'corredor',
    // COR-018: ainda em prova (pace 315s/km, 17km percorridos aos 90min)
    // E é monitorado em mockFrequencia — perfeito pra mostrar dados ao vivo.
    corredorId: 'COR-018',
  },
  {
    id: 'u-espectador',
    nome: 'Roberto Almeida',
    email: 'espectador@racetrack.com',
    perfil: 'espectador',
  },
]
