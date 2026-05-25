import { Medal, Star, Trophy } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BPMDisplay } from '@/components/shared/BPMDisplay'
import { PageHeader } from '@/components/shared/PageHeader'
import { mockCheckpoints, mockFrequencia } from '@/data'
import {
  useRankingLive,
  type RankingLiveItem,
} from '@/hooks/useRankingLive'
import { useFavoritos } from '@/hooks/useFavoritos'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'

type FiltroCategoria =
  | 'todos'
  | 'masculino'
  | 'feminino'
  | 'master_30'
  | 'master_40'
  | 'master_50'

const categoriaPredicate: Record<FiltroCategoria, (cat: string) => boolean> = {
  todos: () => true,
  masculino: (c) => c.startsWith('M '),
  feminino: (c) => c.startsWith('F '),
  master_30: (c) => c.endsWith('30-39'),
  master_40: (c) => c.endsWith('40-49'),
  master_50: (c) => c.endsWith('50+'),
}

const checkpointPorId = new Map(mockCheckpoints.map((c) => [c.id, c]))
const cpChegadaId = mockCheckpoints.find((c) => c.nome === 'Chegada')?.id

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

export default function RankingPage() {
  const ranking = useRankingLive()
  const [filtroCat, setFiltroCat] = useState<FiltroCategoria>('todos')
  const [apenasFinalizados, setApenasFinalizados] = useState(false)

  const filtrados = useMemo(() => {
    return ranking
      .filter((r) => categoriaPredicate[filtroCat](r.corredor.categoria))
      .filter((r) =>
        apenasFinalizados ? r.ultimoCheckpoint === cpChegadaId : true,
      )
      // Reatribui posições relativas ao filtro corrente
      .map((r, idx) => ({ ...r, posicao: idx + 1 }))
  }, [ranking, filtroCat, apenasFinalizados])

  const top3 = filtrados.slice(0, 3)
  const resto = filtrados.slice(3)

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title="Ranking ao vivo"
          description={`${filtrados.length} corredores · classificação atualizada a cada 5s`}
        />
        <Badge
          variant="secondary"
          className="self-start gap-2 border-0 bg-primary/10 px-2.5 py-1 text-primary sm:self-end"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping-slow rounded-full bg-primary/80" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Atualizando ao vivo
        </Badge>
      </div>

      {/* ─────────────── PÓDIO ─────────────── */}
      {top3.length === 3 && (
        <div className="grid grid-cols-3 items-end gap-3 sm:gap-4">
          <PodioCard item={top3[1]} posicao={2} />
          <PodioCard item={top3[0]} posicao={1} grande />
          <PodioCard item={top3[2]} posicao={3} />
        </div>
      )}

      {/* ─────────────── FILTROS ─────────────── */}
      <Card className="space-y-3 p-4">
        <Tabs
          value={filtroCat}
          onValueChange={(v) => setFiltroCat(v as FiltroCategoria)}
        >
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
            <TabsTrigger value="todos">Geral</TabsTrigger>
            <TabsTrigger value="masculino">Masculino</TabsTrigger>
            <TabsTrigger value="feminino">Feminino</TabsTrigger>
            <TabsTrigger value="master_30">30-39</TabsTrigger>
            <TabsTrigger value="master_40">40-49</TabsTrigger>
            <TabsTrigger value="master_50">50+</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Switch
            id="apenas-finalizados"
            checked={apenasFinalizados}
            onCheckedChange={setApenasFinalizados}
          />
          <label
            htmlFor="apenas-finalizados"
            className="cursor-pointer text-sm text-foreground"
          >
            Apenas finalizados
          </label>
        </div>
      </Card>

      {/* ─────────────── LISTA (4º em diante) ─────────────── */}
      <div className="space-y-2">
        {resto.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
            Nenhum corredor além do pódio para os filtros atuais.
          </p>
        ) : (
          resto.map((r) => (
            <RankingLinha
              key={r.corredor.id}
              item={r}
            />
          ))
        )}
      </div>
    </div>
  )
}

function PodioCard({
  item,
  posicao,
  grande = false,
}: {
  item: RankingLiveItem
  posicao: 1 | 2 | 3
  grande?: boolean
}) {
  const bpm = bpmPorCorredor.get(item.corredor.id)
  const cfg = {
    1: {
      bg: 'bg-gradient-to-br from-amber-400/45 via-amber-400/15 to-card',
      ring: 'ring-2 ring-amber-400/50',
      icon: Trophy,
      iconColor: 'text-amber-400',
      label: 'Ouro',
    },
    2: {
      bg: 'bg-gradient-to-br from-slate-300/35 via-slate-300/10 to-card dark:from-slate-400/30',
      ring: 'ring-1 ring-slate-300/40',
      icon: Medal,
      iconColor: 'text-slate-300 dark:text-slate-200',
      label: 'Prata',
    },
    3: {
      bg: 'bg-gradient-to-br from-orange-700/35 via-orange-700/10 to-card',
      ring: 'ring-1 ring-orange-700/40',
      icon: Medal,
      iconColor: 'text-orange-700 dark:text-orange-500',
      label: 'Bronze',
    },
  }[posicao]
  const Icon = cfg.icon

  return (
    <Link
      to={ROUTES.ESPECTADOR.CORREDOR_DETALHE.replace(':id', item.corredor.id)}
      className={cn(
        'group relative flex flex-col items-center rounded-xl border border-border p-3 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg',
        cfg.bg,
        cfg.ring,
        grande ? 'pb-5 pt-6' : 'pt-4',
      )}
    >
      <Icon
        className={cn(
          'mb-2',
          cfg.iconColor,
          grande ? 'h-7 w-7 animate-pulse-slow' : 'h-5 w-5',
        )}
      />
      <Avatar
        className={cn(
          'border-2 border-background ring-2',
          grande ? 'h-16 w-16' : 'h-12 w-12',
          posicao === 1 && 'ring-amber-400/50',
          posicao === 2 && 'ring-slate-300/40',
          posicao === 3 && 'ring-orange-700/40',
        )}
      >
        <AvatarImage src={item.corredor.foto} alt="" />
        <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
          {iniciais(item.corredor.nome)}
        </AvatarFallback>
      </Avatar>
      <p
        className={cn(
          'mt-2 truncate font-bold text-foreground',
          grande ? 'text-base' : 'text-xs',
        )}
      >
        {item.corredor.nome.split(' ')[0]}{' '}
        {item.corredor.nome.split(' ').pop()}
      </p>
      <p className="text-[10px] text-muted-foreground">
        #{item.corredor.numeroCamisa}
      </p>
      <p
        className={cn(
          'mt-1 font-mono font-bold tabular-nums text-foreground',
          grande ? 'text-base' : 'text-xs',
        )}
      >
        {formatTempo(item.tempoAtual)}
      </p>
      {bpm !== undefined && (
        <div className="mt-1">
          <BPMDisplay bpm={bpm} size="sm" />
        </div>
      )}
      <span className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-background text-[10px] font-bold">
        {posicao}
      </span>
      <span className="mt-2 hidden text-[10px] font-medium uppercase tracking-widest text-primary opacity-0 transition-opacity group-hover:opacity-100 sm:inline">
        Acompanhar →
      </span>
    </Link>
  )
}

function RankingLinha({ item }: { item: RankingLiveItem }) {
  const bpm = bpmPorCorredor.get(item.corredor.id)
  const toggle = useFavoritos((s) => s.toggle)
  const isFav = useFavoritos((s) => s.favoritos.includes(item.corredor.id))
  const ultimoCp = checkpointPorId.get(item.ultimoCheckpoint)

  return (
    <Link
      to={ROUTES.ESPECTADOR.CORREDOR_DETALHE.replace(':id', item.corredor.id)}
      className={cn(
        'flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md',
        item.variacao === 'subiu' && 'animate-highlight-up',
        item.variacao === 'desceu' && 'animate-highlight-down',
      )}
    >
      <div className="flex w-12 flex-col items-center">
        <span className="font-mono text-lg font-bold tabular-nums text-foreground">
          {item.posicao}º
        </span>
        {item.variacao !== 'mantido' && (
          <span
            className={cn(
              'inline-flex items-center text-[10px] font-bold',
              item.variacao === 'subiu' ? 'text-primary' : 'text-destructive',
            )}
          >
            {item.variacao === 'subiu' ? '▲' : '▼'}
          </span>
        )}
      </div>

      <Avatar className="h-10 w-10 flex-shrink-0 border border-border">
        <AvatarImage src={item.corredor.foto} alt="" />
        <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
          {iniciais(item.corredor.nome)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {item.corredor.nome}
        </p>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Badge variant="secondary" className="h-5 font-mono">
            #{item.corredor.numeroCamisa}
          </Badge>
          <span className="truncate">{item.corredor.categoria}</span>
        </div>
      </div>

      <div className="hidden flex-col items-end text-[11px] sm:flex">
        <span className="font-mono font-semibold tabular-nums text-foreground">
          {formatTempo(item.tempoAtual)}
        </span>
        {ultimoCp && (
          <span className="text-muted-foreground">{ultimoCp.nome}</span>
        )}
      </div>

      {bpm !== undefined && (
        <div className="hidden flex-shrink-0 sm:block">
          <BPMDisplay bpm={bpm} size="sm" />
        </div>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 flex-shrink-0"
        onClick={(e) => {
          e.preventDefault()
          toggle(item.corredor.id)
        }}
        aria-label={isFav ? 'Remover dos favoritos' : 'Acompanhar'}
      >
        <Star
          className={cn(
            'h-5 w-5 transition-colors',
            isFav
              ? 'fill-amber-400 text-amber-400'
              : 'text-muted-foreground',
          )}
        />
      </Button>
    </Link>
  )
}
