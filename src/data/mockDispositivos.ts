import type { DispositivoHardware } from '@/types'

// Timestamps "últimas conexões" relativos a "agora" para parecer realista
// no momento em que o app é carregado.
const now = Date.now()
const minutesAgo = (m: number) => new Date(now - m * 60_000).toISOString()

export const mockDispositivos: DispositivoHardware[] = [
  {
    id: 'DEV-01',
    nome: 'Servidor Central (Race-Core)',
    tipo: 'Servidor',
    status: 'online',
    ip: '10.0.0.10',
    ultimaConexao: minutesAgo(0.2),
  },
  {
    id: 'DEV-02',
    nome: 'Switch Núcleo (Sala Técnica)',
    tipo: 'Switch',
    status: 'online',
    ip: '10.0.0.1',
    ultimaConexao: minutesAgo(0.5),
  },
  {
    id: 'DEV-03',
    nome: 'Access Point - Largada/Chegada',
    tipo: 'AP',
    status: 'online',
    ip: '10.0.1.20',
    ultimaConexao: minutesAgo(1),
  },
  {
    id: 'DEV-04',
    nome: 'Leitor RFID - Largada (5km)',
    tipo: 'Leitor',
    status: 'online',
    ip: '10.0.2.11',
    ultimaConexao: minutesAgo(0.8),
  },
  {
    id: 'DEV-05',
    nome: 'Leitor RFID - 10km',
    tipo: 'Leitor',
    status: 'alerta',
    ip: '10.0.2.12',
    ultimaConexao: minutesAgo(6),
  },
  {
    id: 'DEV-06',
    nome: 'Leitor RFID - 15km',
    tipo: 'Leitor',
    status: 'offline',
    ip: '10.0.2.13',
    ultimaConexao: minutesAgo(22),
  },
]
