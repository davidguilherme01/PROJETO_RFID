import { ArrowRight, Eye, Plus, Search, Star, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { BPMDisplay } from '@/components/shared/BPMDisplay'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { mockCheckpoints, mockCorredores, mockFrequencia } from '@/data'
import { useDebounce } from '@/hooks/useDebounce'
import { useFavoritos } from '@/hooks/useFavoritos'
import { useRankingLive } from '@/hooks/useRankingLive'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'

const checkpointPorId = new Map(mockCheckpoints.map((c) => [c.id, c]))

const bpmPorCorredor = (() => {
  const m = new Map<string, number>()
  for (const f of mockFrequencia) m.set(f.corredorId, f.bpm)
  return m
})()

function formatTempo(seg: number) {
  const h = Math.floor(seg / 3600)
  const m = Math.floor((seg % 3600) / 60)
  const s = seg % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

function iniciais(nome: string) {
  return nome
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

export default function AcompanharPage() {
  const favoritos = useFavoritos((s) => s.favoritos)
  const toggle = useFavoritos((s) => s.toggle)
  const ranking = useRankingLive()
  const [buscaOpen, setBuscaOpen] = useState(false)

  const favoritosDetalhes = useMemo(() => {
    return favoritos
      .map((id) => {
        const corredor = mockCorredores.find((c) => c.id === id)
        if (!corredor) return null
        const entrada = ranking.find((r) => r.corredor.id === id)
        return {
          corredor,
          posicao: entrada?.posicao,
          tempoAtual: entrada?.tempoAtual,
          ultimoCheckpoint: entrada?.ultimoCheckpoint,
          bpm: bpmPorCorredor.get(id),
        }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => (a.posicao ?? 999) - (b.posicao ?? 999))
  }, [favoritos, ranking])

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title="Acompanhar"
          description={`${favoritos.length} corredor${
            favoritos.length === 1 ? '' : 'es'
          } favorito${favoritos.length === 1 ? '' : 's'}`}
        />
        <Button
          size="sm"
          onClick={() => setBuscaOpen(true)}
          className="gap-2 self-start sm:self-end"
        >
          <Plus className="h-4 w-4" />
          Acompanhar mais
        </Button>
      </div>

      {favoritosDetalhes.length === 0 ? (
        <EmptyState
          icon={Star}
          title="Você ainda não está acompanhando ninguém"
          description="Toque na estrela ao lado de um corredor no ranking para começar."
          action={
            <Button onClick={() => setBuscaOpen(true)} className="gap-2">
              <Search className="h-4 w-4" />
              Buscar corredores
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {favoritosDetalhes.map((f) => (
            <FavoritoCard
              key={f.corredor.id}
              corredor={f.corredor}
              posicao={f.posicao}
              tempoAtual={f.tempoAtual}
              ultimoCheckpointNome={
                f.ultimoCheckpoint
                  ? checkpointPorId.get(f.ultimoCheckpoint)?.nome
                  : undefined
              }
              bpm={f.bpm}
              onRemover={() => toggle(f.corredor.id)}
            />
          ))}
        </div>
      )}

      <BuscaCorredorDialog
        open={buscaOpen}
        onOpenChange={setBuscaOpen}
      />
    </div>
  )
}

interface FavoritoCardProps {
  corredor: (typeof mockCorredores)[number]
  posicao?: number
  tempoAtual?: number
  ultimoCheckpointNome?: string
  bpm?: number
  onRemover: () => void
}

function FavoritoCard({
  corredor,
  posicao,
  tempoAtual,
  ultimoCheckpointNome,
  bpm,
  onRemover,
}: FavoritoCardProps) {
  return (
    <Card className="overflow-hidden p-0 transition-shadow duration-200 hover:shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 bg-gradient-to-br from-primary/15 via-primary/5 to-card p-4 pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14 border-2 border-primary/30">
            <AvatarImage src={corredor.foto} alt="" />
            <AvatarFallback className="bg-primary/20 text-sm font-bold text-primary">
              {iniciais(corredor.nome)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-foreground">
              {corredor.nome}
            </p>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
              <Badge variant="secondary" className="h-5 font-mono">
                #{corredor.numeroCamisa}
              </Badge>
              <span className="truncate">{corredor.categoria}</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-foreground"
          onClick={onRemover}
          aria-label="Parar de acompanhar"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Posição
            </p>
            <p className="font-mono text-xl font-bold tabular-nums text-foreground">
              {posicao ? `${posicao}º` : '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Tempo
            </p>
            <p className="font-mono text-base font-bold tabular-nums text-foreground">
              {tempoAtual !== undefined ? formatTempo(tempoAtual) : '—'}
            </p>
            {ultimoCheckpointNome && (
              <p className="text-[10px] text-muted-foreground">
                {ultimoCheckpointNome}
              </p>
            )}
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              BPM
            </p>
            <BPMDisplay bpm={bpm} size="md" />
          </div>
        </div>

        <Button
          asChild
          variant="outline"
          className="w-full gap-2"
        >
          <Link
            to={ROUTES.ESPECTADOR.CORREDOR_DETALHE.replace(
              ':id',
              corredor.id,
            )}
          >
            <Eye className="h-4 w-4" />
            Ver detalhes
            <ArrowRight className="ml-auto h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function BuscaCorredorDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [busca, setBusca] = useState('')
  const debounced = useDebounce(busca, 250)
  const toggle = useFavoritos((s) => s.toggle)
  const favoritos = useFavoritos((s) => s.favoritos)

  const resultados = useMemo(() => {
    const b = debounced.trim().toLowerCase()
    if (!b) return mockCorredores.slice(0, 10)
    return mockCorredores
      .filter(
        (c) =>
          c.nome.toLowerCase().includes(b) ||
          c.numeroCamisa.toString().includes(b),
      )
      .slice(0, 20)
  }, [debounced])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-hidden sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Acompanhar corredor</DialogTitle>
          <DialogDescription>
            Busque por nome ou número da camisa.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Ex: Ana, 245..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="max-h-[400px] space-y-1 overflow-y-auto pr-1">
          {resultados.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum resultado.
            </p>
          ) : (
            resultados.map((c) => {
              const isFav = favoritos.includes(c.id)
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggle(c.id)}
                  className="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-accent"
                >
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src={c.foto} alt="" />
                    <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                      {iniciais(c.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.nome}</p>
                    <p className="text-[11px] text-muted-foreground">
                      #{c.numeroCamisa} · {c.categoria}
                    </p>
                  </div>
                  <Star
                    className={cn(
                      'h-5 w-5 flex-shrink-0 transition-colors',
                      isFav
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground',
                    )}
                  />
                </button>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
