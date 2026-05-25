import { Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BPMDisplay } from '@/components/shared/BPMDisplay'
import { useFavoritos } from '@/hooks/useFavoritos'
import { cn } from '@/lib/utils'
import type { Corredor } from '@/types'

interface CorredorCardProps {
  corredor: Corredor
  posicao?: number
  tempoAtual?: number // segundos
  bpm?: number
  ultimoCheckpoint?: string
  showRanking?: boolean
  showBPM?: boolean
  showFavoritar?: boolean
  /** Variação no ranking — desenha seta colorida ao lado da posição */
  variacao?: 'subiu' | 'desceu' | 'mantido'
  /** Render extra na direita (botão "Ver", etc) */
  acao?: React.ReactNode
  /** Quando informado, o card vira um <Link> clicável inteiro */
  href?: string
  className?: string
}

function iniciais(nome: string) {
  return nome
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

function formatTempo(seg: number | undefined) {
  if (seg === undefined) return '—'
  const h = Math.floor(seg / 3600)
  const m = Math.floor((seg % 3600) / 60)
  const s = seg % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

export function CorredorCard({
  corredor,
  posicao,
  tempoAtual,
  bpm,
  ultimoCheckpoint,
  showRanking = true,
  showBPM = true,
  showFavoritar = false,
  variacao = 'mantido',
  acao,
  href,
  className,
}: CorredorCardProps) {
  const toggle = useFavoritos((s) => s.toggle)
  const isFav = useFavoritos((s) => s.favoritos.includes(corredor.id))

  const baseClass = cn(
    'flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md',
    href && 'cursor-pointer hover:border-primary/40',
    className,
  )

  const content = (
    <>
      {showRanking && posicao !== undefined && (
        <div className="flex w-10 flex-col items-center">
          <span className="font-mono text-lg font-bold tabular-nums text-foreground">
            {posicao}º
          </span>
          {variacao !== 'mantido' && (
            <span
              className={cn(
                'text-[10px] font-semibold',
                variacao === 'subiu' ? 'text-primary' : 'text-destructive',
              )}
            >
              {variacao === 'subiu' ? '▲' : '▼'}
            </span>
          )}
        </div>
      )}

      <Avatar className="h-11 w-11 flex-shrink-0 border border-border">
        <AvatarImage src={corredor.foto} alt="" />
        <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
          {iniciais(corredor.nome)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {corredor.nome}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Badge variant="secondary" className="h-5 font-mono">
            #{corredor.numeroCamisa}
          </Badge>
          <span className="truncate">{corredor.categoria}</span>
        </div>
        {(tempoAtual !== undefined || ultimoCheckpoint) && (
          <div className="mt-1 flex items-center gap-2 text-[11px]">
            {tempoAtual !== undefined && (
              <span className="font-mono font-semibold tabular-nums text-foreground">
                {formatTempo(tempoAtual)}
              </span>
            )}
            {ultimoCheckpoint && (
              <span className="text-muted-foreground">
                · {ultimoCheckpoint}
              </span>
            )}
          </div>
        )}
      </div>

      {showBPM && bpm !== undefined && (
        <div className="flex-shrink-0">
          <BPMDisplay bpm={bpm} size="sm" />
        </div>
      )}

      {showFavoritar && (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 flex-shrink-0"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggle(corredor.id)
          }}
          aria-label={isFav ? 'Remover dos favoritos' : 'Acompanhar'}
        >
          <Star
            className={cn(
              'h-5 w-5 transition-colors',
              isFav
                ? 'fill-amber-400 text-amber-400'
                : 'text-muted-foreground hover:text-foreground',
            )}
          />
        </Button>
      )}

      {acao}
    </>
  )

  return href ? (
    <Link to={href} className={baseClass}>
      {content}
    </Link>
  ) : (
    <div className={baseClass}>{content}</div>
  )
}
