import { cn } from '@/lib/utils'

export interface TopologiaNode {
  id: string
  label: string
  sublabel?: string
  x: number
  y: number
  w: number
  h: number
  status: 'online' | 'parcial' | 'offline'
}

export interface TopologiaEdge {
  from: string
  to: string
  label?: string
  // 'dashed' = redundância / sem fluxo; 'flow' = dados fluindo (animação)
  variant?: 'solid' | 'dashed' | 'flow'
  // Caminho manual opcional pra evitar sobreposições. Se omitido, traça reto.
  via?: { x: number; y: number }[]
}

const nodes: TopologiaNode[] = [
  // ── Linha 1: camada física do RFID ──────────────────────────
  { id: 'tag', label: 'Camisa + Tag RFID', sublabel: 'UHF passivo', x: 20, y: 30, w: 160, h: 64, status: 'online' },
  { id: 'antena', label: 'Antena RFID', sublabel: '10× Intelbras', x: 240, y: 30, w: 160, h: 64, status: 'parcial' },
  { id: 'leitor', label: 'Leitor RFID', sublabel: 'YANZEO SR681', x: 460, y: 30, w: 160, h: 64, status: 'online' },

  // ── Linha 2: rede ──────────────────────────────────────────
  { id: 'roteador', label: 'Roteador', sublabel: 'Gateway', x: 20, y: 180, w: 160, h: 64, status: 'online' },
  { id: 'switch', label: 'Switch', sublabel: 'TP-Link 48p', x: 240, y: 180, w: 160, h: 64, status: 'online' },
  { id: 'ap', label: 'Access Point', sublabel: 'Ubiquiti WiFi 6', x: 460, y: 180, w: 160, h: 64, status: 'online' },

  // ── Linha 3: servidores ────────────────────────────────────
  { id: 'srv1', label: 'Servidor 1', sublabel: 'Banco', x: 100, y: 330, w: 160, h: 64, status: 'online' },
  { id: 'srv2', label: 'Servidor 2', sublabel: 'Aplicação', x: 360, y: 330, w: 160, h: 64, status: 'online' },

  // ── Linha 4: cinta cardíaca via celular ────────────────────
  { id: 'cinta', label: 'Polar H10', sublabel: 'Cinta cardíaca', x: 620, y: 180, w: 150, h: 64, status: 'online' },
  { id: 'celular', label: 'Celular', sublabel: 'App do atleta', x: 620, y: 330, w: 150, h: 64, status: 'online' },

  // ── Linha 5: usuários do sistema ───────────────────────────
  { id: 'corredor', label: 'Corredor', sublabel: 'Usuário', x: 100, y: 470, w: 130, h: 56, status: 'online' },
  { id: 'admin', label: 'Administrador', sublabel: 'Usuário', x: 280, y: 470, w: 130, h: 56, status: 'online' },
  { id: 'espectador', label: 'Espectador', sublabel: 'Usuário', x: 460, y: 470, w: 130, h: 56, status: 'online' },
]

const edges: TopologiaEdge[] = [
  { from: 'tag', to: 'antena', label: 'UHF 860-960 MHz', variant: 'flow' },
  { from: 'antena', to: 'leitor', label: 'cabo coaxial', variant: 'solid' },
  { from: 'leitor', to: 'switch', label: 'TCP/IP', variant: 'flow' },
  { from: 'roteador', to: 'switch', variant: 'solid' },
  { from: 'switch', to: 'ap', variant: 'solid' },
  { from: 'switch', to: 'srv1', variant: 'flow' },
  { from: 'switch', to: 'srv2', variant: 'flow' },
  { from: 'srv1', to: 'srv2', label: 'redundância', variant: 'dashed' },
  { from: 'cinta', to: 'celular', label: 'Bluetooth', variant: 'flow' },
  { from: 'celular', to: 'srv2', label: 'HTTP', variant: 'flow' },
  { from: 'srv2', to: 'corredor', variant: 'solid' },
  { from: 'srv2', to: 'admin', variant: 'solid' },
  { from: 'srv2', to: 'espectador', variant: 'solid' },
]

function centerOf(n: TopologiaNode) {
  return { x: n.x + n.w / 2, y: n.y + n.h / 2 }
}

interface HardwareTopologiaProps {
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function HardwareTopologia({
  selectedId,
  onSelect,
}: HardwareTopologiaProps) {
  return (
    <div className="overflow-x-auto">
      <svg
        viewBox="0 0 800 560"
        className="h-[480px] w-full min-w-[760px]"
        role="img"
        aria-label="Topologia da rede do sistema RFID"
        onClick={(e) => {
          if (e.target === e.currentTarget) onSelect(null)
        }}
      >
        {/* ── Edges ── (renderizadas antes pra ficarem atrás dos nodes) */}
        {edges.map((e, i) => {
          const a = nodes.find((n) => n.id === e.from)
          const b = nodes.find((n) => n.id === e.to)
          if (!a || !b) return null
          const ca = centerOf(a)
          const cb = centerOf(b)
          const stroke =
            e.variant === 'dashed'
              ? 'hsl(var(--muted-foreground))'
              : 'hsl(var(--primary) / 0.6)'
          const dasharray =
            e.variant === 'dashed'
              ? '6 4'
              : e.variant === 'flow'
              ? '5 3'
              : undefined

          const midX = (ca.x + cb.x) / 2
          const midY = (ca.y + cb.y) / 2

          return (
            <g key={i}>
              <line
                x1={ca.x}
                y1={ca.y}
                x2={cb.x}
                y2={cb.y}
                stroke={stroke}
                strokeWidth="1.5"
                strokeDasharray={dasharray}
                strokeLinecap="round"
              >
                {e.variant === 'flow' && (
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="-16"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                )}
              </line>
              {e.label && (
                <g>
                  <rect
                    x={midX - e.label.length * 3.2 - 6}
                    y={midY - 9}
                    width={e.label.length * 6.4 + 12}
                    height={18}
                    rx={9}
                    fill="hsl(var(--card))"
                    stroke="hsl(var(--border))"
                    strokeWidth="0.5"
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    fontSize="10"
                    fill="hsl(var(--muted-foreground))"
                  >
                    {e.label}
                  </text>
                </g>
              )}
            </g>
          )
        })}

        {/* ── Nodes ── */}
        {nodes.map((n) => {
          const isSelected = selectedId === n.id
          const corStatus =
            n.status === 'online'
              ? 'hsl(var(--primary))'
              : n.status === 'parcial'
              ? 'hsl(38 92% 50%)' // amber
              : 'hsl(var(--destructive))'
          return (
            <g
              key={n.id}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                onSelect(n.id === selectedId ? null : n.id)
              }}
            >
              <rect
                x={n.x}
                y={n.y}
                width={n.w}
                height={n.h}
                rx={10}
                fill="hsl(var(--card))"
                stroke={isSelected ? corStatus : 'hsl(var(--border))'}
                strokeWidth={isSelected ? 2.5 : 1}
                className={cn(
                  'transition-all duration-200',
                  isSelected && 'drop-shadow-lg',
                )}
              />
              {/* Pequeno dot de status no canto */}
              <circle
                cx={n.x + n.w - 12}
                cy={n.y + 12}
                r={4}
                fill={corStatus}
              />
              <text
                x={n.x + 12}
                y={n.y + 26}
                fontSize="13"
                fontWeight="600"
                fill="hsl(var(--foreground))"
              >
                {n.label}
              </text>
              {n.sublabel && (
                <text
                  x={n.x + 12}
                  y={n.y + 44}
                  fontSize="10"
                  fill="hsl(var(--muted-foreground))"
                >
                  {n.sublabel}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export { nodes as topologiaNodes }
