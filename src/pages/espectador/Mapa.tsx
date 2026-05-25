import { Flag, MapPinned, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/PageHeader'
import {
  mockCheckpoints,
  mockCorredores,
  mockCronometragem,
} from '@/data'
import { useFavoritos } from '@/hooks/useFavoritos'
import { ROUTES } from '@/lib/constants'
import type { Corredor } from '@/types'

const RACE_ELAPSED_S = 90 * 60

const checkpointPorId = new Map(mockCheckpoints.map((c) => [c.id, c]))
const cps = [...mockCheckpoints].sort((a, b) => a.posicaoKm - b.posicaoKm)
const DISTANCIA_TOTAL = cps[cps.length - 1]?.posicaoKm ?? 21

interface PosicaoCorredor {
  corredor: Corredor
  posicaoKm: number
}

// Posições estimadas a partir do último checkpoint + pace.
function calcularPosicoes(): PosicaoCorredor[] {
  const resultado: PosicaoCorredor[] = []
  const ativos = mockCorredores.filter((c) => c.status === 'ativo')

  for (const c of ativos) {
    const cronos = mockCronometragem
      .filter((cr) => cr.corredorId === c.id)
      .sort((a, b) => {
        const ak = checkpointPorId.get(a.checkpoint)?.posicaoKm ?? 0
        const bk = checkpointPorId.get(b.checkpoint)?.posicaoKm ?? 0
        return ak - bk
      })
    const ultimo = cronos[cronos.length - 1]
    if (!ultimo) continue
    const ultimoCp = checkpointPorId.get(ultimo.checkpoint)
    if (!ultimoCp) continue
    const pace =
      ultimoCp.posicaoKm > 0 ? ultimo.tempoTotal / ultimoCp.posicaoKm : 320
    const tempoExtra = Math.max(0, RACE_ELAPSED_S - ultimo.tempoTotal)
    const extra = tempoExtra / pace
    const posicaoKm = Math.min(DISTANCIA_TOTAL, ultimoCp.posicaoKm + extra)
    resultado.push({ corredor: c, posicaoKm })
  }
  return resultado
}

const PATH_W = 1000
const PATH_H = 280
const padding = 50

function xOf(km: number) {
  return padding + (km / DISTANCIA_TOTAL) * (PATH_W - padding * 2)
}
// Onda do percurso — mesma fórmula que MinhaRota pra consistência visual.
function yOf(km: number) {
  return 140 + Math.sin((km / DISTANCIA_TOTAL) * Math.PI * 3) * 40
}

export default function MapaPage() {
  const navigate = useNavigate()
  const favoritos = useFavoritos((s) => s.favoritos)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const posicoes = useMemo(() => calcularPosicoes(), [])
  const totalEmProva = posicoes.length
  const totalFavoritados = posicoes.filter((p) =>
    favoritos.includes(p.corredor.id),
  ).length

  // Curva completa do percurso para fundo
  const stepKm = 0.25
  let fullPath = `M ${xOf(0)} ${yOf(0)}`
  for (let km = stepKm; km <= DISTANCIA_TOTAL; km += stepKm) {
    fullPath += ` L ${xOf(km)} ${yOf(km)}`
  }

  const hovered = posicoes.find((p) => p.corredor.id === hoveredId)

  return (
    <div className="space-y-5">
      <PageHeader
        title="Mapa da corrida"
        description={`${totalEmProva} corredores em prova · ${totalFavoritados} favoritados`}
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Posições ao vivo</CardTitle>
          <p className="text-xs text-muted-foreground">
            Cada ponto é um corredor. Estrelas amarelas são seus favoritos.
            Toque em um ponto para abrir o perfil.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${PATH_W} ${PATH_H}`}
              className="h-[280px] w-full min-w-[720px]"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Percurso de fundo */}
              <path
                d={fullPath}
                stroke="hsl(var(--border))"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                opacity="0.8"
              />

              {/* Checkpoints */}
              {cps.map((cp) => {
                const x = xOf(cp.posicaoKm)
                const y = yOf(cp.posicaoKm)
                return (
                  <g key={cp.id}>
                    <circle
                      cx={x}
                      cy={y}
                      r={7}
                      fill="hsl(var(--card))"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                    />
                    <text
                      x={x}
                      y={y - 18}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="600"
                      fill="hsl(var(--foreground))"
                    >
                      {cp.nome}
                    </text>
                  </g>
                )
              })}

              {/* Corredores */}
              {posicoes.map((p) => {
                const isFav = favoritos.includes(p.corredor.id)
                const x = xOf(p.posicaoKm)
                // Pequeno offset Y pra não amontoar em cima da linha
                const yOffset =
                  ((p.corredor.numeroCamisa % 5) - 2) * 6
                const y = yOf(p.posicaoKm) + yOffset

                return (
                  <g
                    key={p.corredor.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredId(p.corredor.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() =>
                      navigate(
                        ROUTES.ESPECTADOR.CORREDOR_DETALHE.replace(
                          ':id',
                          p.corredor.id,
                        ),
                      )
                    }
                  >
                    {/* Hit area maior pra touch */}
                    <circle
                      cx={x}
                      cy={y}
                      r={16}
                      fill="transparent"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={isFav ? 7 : 5}
                      fill={
                        isFav
                          ? 'hsl(45 93% 55%)'
                          : 'hsl(var(--primary))'
                      }
                      stroke={
                        isFav
                          ? 'hsl(45 93% 35%)'
                          : 'hsl(var(--card))'
                      }
                      strokeWidth={isFav ? 1.5 : 2}
                      opacity={
                        hoveredId && hoveredId !== p.corredor.id ? 0.35 : 1
                      }
                      className="transition-opacity duration-200"
                    >
                      {isFav && (
                        <animate
                          attributeName="r"
                          values="7;8.5;7"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      )}
                    </circle>
                  </g>
                )
              })}

              {/* Tooltip do hover */}
              {hovered && (
                <g
                  transform={`translate(${xOf(hovered.posicaoKm)}, ${
                    yOf(hovered.posicaoKm) - 50
                  })`}
                  pointerEvents="none"
                >
                  <rect
                    x={-90}
                    y={-22}
                    width={180}
                    height={40}
                    rx={8}
                    fill="hsl(var(--popover))"
                    stroke="hsl(var(--border))"
                  />
                  <text
                    x={0}
                    y={-6}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="600"
                    fill="hsl(var(--popover-foreground))"
                  >
                    #{hovered.corredor.numeroCamisa} ·{' '}
                    {hovered.corredor.nome.length > 22
                      ? hovered.corredor.nome.slice(0, 22) + '…'
                      : hovered.corredor.nome}
                  </text>
                  <text
                    x={0}
                    y={10}
                    textAnchor="middle"
                    fontSize="10"
                    fill="hsl(var(--muted-foreground))"
                  >
                    {hovered.posicaoKm.toFixed(1)} km ·{' '}
                    {hovered.corredor.categoria}
                  </text>
                </g>
              )}
            </svg>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Flag className="h-3 w-3" /> Largada
            </span>
            <span className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Corredor
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Favoritado
              </span>
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPinned className="h-3 w-3" /> Chegada
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          <div>
            <p className="text-sm font-semibold">
              {totalFavoritados} corredor
              {totalFavoritados === 1 ? '' : 'es'} favoritado
              {totalFavoritados === 1 ? '' : 's'} no mapa
            </p>
            <p className="text-[11px] text-muted-foreground">
              Adicione mais favoritos pelo ranking ou pela página de
              acompanhamento.
            </p>
          </div>
        </div>
      </Card>

      {/* Legenda flexível */}
      <div className="flex flex-wrap gap-2">
        {cps.map((cp) => (
          <Badge
            key={cp.id}
            variant="secondary"
            className="font-mono"
          >
            {cp.nome} · {cp.posicaoKm}km
          </Badge>
        ))}
      </div>
    </div>
  )
}
