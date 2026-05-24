import {
  HeartPulse,
  Monitor,
  Network,
  Radio,
  RadioTower,
  Router,
  Server,
  ServerCog,
  Shirt,
  Tag,
  Wifi,
  type LucideIcon,
} from 'lucide-react'

// Catálogo real do projeto (briefing/PDF). Valores em BRL.
// Soma e contagem são derivados — não duplicar aqui.
export interface ItemEquipamento {
  id: string
  categoria: string
  modelo: string
  fornecedor: string
  quantidade: number
  quantidadeAtiva: number
  valorUnitario: number
  unidadeStatus: string // 'online' | 'ativas' | 'distribuídas' | ...
  icon: LucideIcon
  especificacoes: string
}

export const mockEquipamentos: ItemEquipamento[] = [
  {
    id: 'EQP-01',
    categoria: 'Antena RFID',
    modelo: 'Intelbras UHF',
    fornecedor: 'Intelbras',
    quantidade: 10,
    quantidadeAtiva: 9,
    valorUnitario: 6583.0,
    unidadeStatus: 'online',
    icon: RadioTower,
    especificacoes:
      'Antena circular polarizada UHF 860-960 MHz, ganho 8dBi, IP67.',
  },
  {
    id: 'EQP-02',
    categoria: 'Tag RFID',
    modelo: 'UHF EPC Gen2',
    fornecedor: 'Importação direta',
    quantidade: 200,
    quantidadeAtiva: 200,
    valorUnitario: 97.96,
    unidadeStatus: 'ativas',
    icon: Tag,
    especificacoes:
      'Tag passiva UHF EPC Gen2, costurada na camisa, 96-bit memory.',
  },
  {
    id: 'EQP-03',
    categoria: 'Servidor',
    modelo: 'Dell PowerEdge',
    fornecedor: 'Dell',
    quantidade: 2,
    quantidadeAtiva: 2,
    valorUnitario: 17183.0,
    unidadeStatus: 'online',
    icon: Server,
    especificacoes:
      'Banco + Aplicação em redundância. Xeon, 32GB RAM, SSD NVMe.',
  },
  {
    id: 'EQP-04',
    categoria: 'Rack',
    modelo: 'Padrão 19"',
    fornecedor: 'Standard',
    quantidade: 1,
    quantidadeAtiva: 1,
    valorUnitario: 2564.38,
    unidadeStatus: 'OK',
    icon: ServerCog,
    especificacoes: 'Rack fechado 19" 24U, ventilação ativa, fechadura.',
  },
  {
    id: 'EQP-05',
    categoria: 'Access Point',
    modelo: 'Ubiquiti',
    fornecedor: 'Ubiquiti',
    quantidade: 1,
    quantidadeAtiva: 1,
    valorUnitario: 1299.0,
    unidadeStatus: 'online',
    icon: Wifi,
    especificacoes:
      'WiFi 6, dual-band, suporte a 250+ dispositivos simultâneos.',
  },
  {
    id: 'EQP-06',
    categoria: 'Roteador',
    modelo: 'Enterprise',
    fornecedor: '—',
    quantidade: 1,
    quantidadeAtiva: 1,
    valorUnitario: 8365.26,
    unidadeStatus: 'online',
    icon: Router,
    especificacoes: 'Gateway de borda com firewall, VPN e QoS.',
  },
  {
    id: 'EQP-07',
    categoria: 'Switch',
    modelo: 'TP-Link 48p',
    fornecedor: 'TP-Link',
    quantidade: 1,
    quantidadeAtiva: 1,
    valorUnitario: 1662.0,
    unidadeStatus: 'online',
    icon: Network,
    especificacoes: 'Switch L2 gerenciável, 48 portas Gigabit, 4 SFP.',
  },
  {
    id: 'EQP-08',
    categoria: 'Leitor RFID',
    modelo: 'YANZEO SR681',
    fornecedor: 'YANZEO',
    quantidade: 1,
    quantidadeAtiva: 1,
    valorUnitario: 2042.08,
    unidadeStatus: 'online',
    icon: Radio,
    especificacoes:
      'Leitor UHF fixo, 4 portas de antena, interface Ethernet/RS232.',
  },
  {
    id: 'EQP-09',
    categoria: 'Monitor',
    modelo: 'Acer 23.8"',
    fornecedor: 'Acer',
    quantidade: 2,
    quantidadeAtiva: 2,
    valorUnitario: 629.81,
    unidadeStatus: 'online',
    icon: Monitor,
    especificacoes: 'IPS Full HD, 75Hz, para sala de comando.',
  },
  {
    id: 'EQP-10',
    categoria: 'Camisa RFID',
    modelo: 'Personalizada',
    fornecedor: 'Confecção local',
    quantidade: 200,
    quantidadeAtiva: 200,
    valorUnitario: 49.99,
    unidadeStatus: 'distribuídas',
    icon: Shirt,
    especificacoes:
      'Camisa dry-fit com bolso interno para tag RFID UHF costurada.',
  },
  {
    id: 'EQP-11',
    categoria: 'Cinta Cardíaca',
    modelo: 'XOSS H10',
    fornecedor: 'XOSS',
    quantidade: 200,
    quantidadeAtiva: 195,
    valorUnitario: 179.99,
    unidadeStatus: 'pareadas',
    icon: HeartPulse,
    especificacoes:
      'Cinta peitoral Bluetooth 5.0 / ANT+, compatível com Polar H10.',
  },
]

// Helpers derivados — única fonte da verdade para os totais.
export const investimentoTotal = mockEquipamentos.reduce(
  (sum, e) => sum + e.quantidade * e.valorUnitario,
  0,
)

export const totalCategorias = mockEquipamentos.length

export function valorTotalItem(e: ItemEquipamento) {
  return e.quantidade * e.valorUnitario
}

export function statusLabel(e: ItemEquipamento): string {
  if (e.quantidadeAtiva === e.quantidade) {
    return `${e.quantidade} ${e.unidadeStatus}`
  }
  return `${e.quantidadeAtiva}/${e.quantidade} ${e.unidadeStatus}`
}

export function statusTom(
  e: ItemEquipamento,
): 'verde' | 'amarelo' | 'vermelho' {
  if (e.quantidadeAtiva === e.quantidade) return 'verde'
  if (e.quantidadeAtiva / e.quantidade >= 0.9) return 'amarelo'
  return 'vermelho'
}
