import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Eye,
  HeartPulse,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CorredorDeleteDialog } from '@/components/corredores/CorredorDeleteDialog'
import { CorredorDetalhesSheet } from '@/components/corredores/CorredorDetalhesSheet'
import { CorredorFormDialog } from '@/components/corredores/CorredorFormDialog'
import { mockCheckpoints, mockCronometragem, mockFrequencia } from '@/data'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'
import {
  liveStatusLabels,
  liveStatusOf,
  useCorredoresStore,
  type LiveStatus,
  type OrdenacaoColuna,
} from '@/store/corredoresStore'
import type { CategoriaCorredor, Corredor } from '@/types'

const PAGINA_SIZE = 15
const categorias: CategoriaCorredor[] = [
  'M Geral',
  'M 30-39',
  'M 40-49',
  'M 50+',
  'F Geral',
  'F 30-39',
  'F 40-49',
  'F 50+',
]

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

// Pré-computações que não dependem do estado React.
const checkpointPorId = new Map(mockCheckpoints.map((c) => [c.id, c]))
const bpmAtualPorCorredor = (() => {
  const m = new Map<string, number>()
  for (const f of mockFrequencia) m.set(f.corredorId, f.bpm)
  return m
})()
const tempoAtualPorCorredor = (() => {
  const m = new Map<string, number>()
  for (const c of mockCronometragem) {
    const cp = checkpointPorId.get(c.checkpoint)
    if (!cp) continue
    const atual = m.get(c.corredorId)
    if (atual === undefined || c.tempoTotal > atual) {
      m.set(c.corredorId, c.tempoTotal)
    }
  }
  return m
})()

interface CorredorLinha {
  corredor: Corredor
  status: LiveStatus
  bpm: number | undefined
  tempo: number | undefined
}

export default function CorredoresPage() {
  const corredores = useCorredoresStore((s) => s.corredores)
  const filtros = useCorredoresStore((s) => s.filtros)
  const selecionados = useCorredoresStore((s) => s.selecionados)
  const ordenacao = useCorredoresStore((s) => s.ordenacao)
  const setBusca = useCorredoresStore((s) => s.setBusca)
  const setStatus = useCorredoresStore((s) => s.setStatus)
  const setCategoria = useCorredoresStore((s) => s.setCategoria)
  const setApenasComAlertas = useCorredoresStore(
    (s) => s.setApenasComAlertas,
  )
  const toggleSelecao = useCorredoresStore((s) => s.toggleSelecao)
  const toggleTodos = useCorredoresStore((s) => s.toggleTodos)
  const limparSelecao = useCorredoresStore((s) => s.limparSelecao)
  const toggleOrdenacao = useCorredoresStore((s) => s.toggleOrdenacao)
  const deletarSelecionados = useCorredoresStore(
    (s) => s.deletarSelecionados,
  )

  // Busca local com debounce — só empurra pro store após pausa de 300ms.
  const [buscaLocal, setBuscaLocal] = useState(filtros.busca)
  const buscaDebounced = useDebounce(buscaLocal, 300)
  useEffect(() => {
    setBusca(buscaDebounced)
  }, [buscaDebounced, setBusca])

  const [pagina, setPagina] = useState(1)
  // Reseta paginação ao mudar qualquer filtro.
  useEffect(() => {
    setPagina(1)
  }, [filtros])

  // Loading skeleton inicial.
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 500)
    return () => window.clearTimeout(t)
  }, [])

  // Modais.
  const [detalhesCorredor, setDetalhesCorredor] = useState<Corredor | null>(
    null,
  )
  const [formCorredor, setFormCorredor] = useState<Corredor | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteCorredor, setDeleteCorredor] = useState<Corredor | null>(null)

  // Linhas derivadas (status/bpm/tempo) — recalcula só quando corredores muda.
  const linhasBase: CorredorLinha[] = useMemo(
    () =>
      corredores.map((c) => ({
        corredor: c,
        status: liveStatusOf(c),
        bpm: bpmAtualPorCorredor.get(c.id),
        tempo: tempoAtualPorCorredor.get(c.id),
      })),
    [corredores],
  )

  // Aplica filtros.
  const linhasFiltradas = useMemo(() => {
    const busca = filtros.busca.trim().toLowerCase()
    return linhasBase.filter((l) => {
      if (busca) {
        const matchNome = l.corredor.nome.toLowerCase().includes(busca)
        const matchCpf = l.corredor.cpf.replace(/\D/g, '').includes(
          busca.replace(/\D/g, ''),
        )
        const matchCamisa = l.corredor.numeroCamisa.toString().includes(busca)
        if (!matchNome && !matchCpf && !matchCamisa) return false
      }
      if (filtros.status !== 'todos' && l.status !== filtros.status)
        return false
      if (
        filtros.categoria !== 'todas' &&
        l.corredor.categoria !== filtros.categoria
      )
        return false
      if (filtros.apenasComAlertas) {
        // BPM > 180 ou < 100 considera alerta.
        if (
          l.bpm === undefined ||
          (l.bpm >= 100 && l.bpm <= 180)
        ) {
          return false
        }
      }
      return true
    })
  }, [linhasBase, filtros])

  // Aplica ordenação.
  const linhasOrdenadas = useMemo(() => {
    const arr = [...linhasFiltradas]
    const mul = ordenacao.direcao === 'asc' ? 1 : -1
    arr.sort((a, b) => {
      const get = (l: CorredorLinha): string | number => {
        switch (ordenacao.coluna) {
          case 'nome':
            return l.corredor.nome
          case 'numeroCamisa':
            return l.corredor.numeroCamisa
          case 'categoria':
            return l.corredor.categoria
          case 'status':
            return l.status
          case 'tempoAtual':
            return l.tempo ?? Number.MAX_SAFE_INTEGER
          case 'bpmAtual':
            return l.bpm ?? -1
        }
      }
      const av = get(a)
      const bv = get(b)
      if (typeof av === 'number' && typeof bv === 'number')
        return (av - bv) * mul
      return String(av).localeCompare(String(bv)) * mul
    })
    return arr
  }, [linhasFiltradas, ordenacao])

  // Paginação.
  const totalPaginas = Math.max(
    1,
    Math.ceil(linhasOrdenadas.length / PAGINA_SIZE),
  )
  const paginaSegura = Math.min(pagina, totalPaginas)
  const linhasDaPagina = linhasOrdenadas.slice(
    (paginaSegura - 1) * PAGINA_SIZE,
    paginaSegura * PAGINA_SIZE,
  )

  const todosNaPaginaSelecionados =
    linhasDaPagina.length > 0 &&
    linhasDaPagina.every((l) => selecionados.has(l.corredor.id))

  const totalEmProva = linhasBase.filter((l) => l.status === 'em_prova').length

  const handleExportCsv = () => {
    const linhas = [
      [
        'Nome',
        'CPF',
        'Camisa',
        'Tag',
        'Categoria',
        'Status',
        'Tempo',
        'BPM',
      ],
      ...linhasOrdenadas.map((l) => [
        l.corredor.nome,
        l.corredor.cpf,
        l.corredor.numeroCamisa.toString(),
        l.corredor.tagRFID,
        l.corredor.categoria,
        liveStatusLabels[l.status],
        formatTempo(l.tempo),
        l.bpm?.toString() ?? '—',
      ]),
    ]
    const csv = linhas
      .map((row) =>
        row.map((c) => `"${c.replace(/"/g, '""')}"`).join(','),
      )
      .join('\n')
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `corredores-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exportados ${linhasOrdenadas.length} corredores.`)
  }

  const handleCopiarTag = (tag: string) => {
    navigator.clipboard.writeText(tag)
    toast.success(`Tag ${tag} copiada.`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gerenciar Corredores"
        description={`${corredores.length} corredores inscritos · ${totalEmProva} em prova`}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setFormCorredor(null)
                setFormOpen(true)
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Novo Corredor
            </Button>
          </>
        }
      />

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1 space-y-1.5">
            <Label htmlFor="busca" className="text-xs uppercase tracking-wide">
              Buscar
            </Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="busca"
                placeholder="Nome, CPF ou número da camisa"
                value={buscaLocal}
                onChange={(e) => setBuscaLocal(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="w-[180px] space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">Status</Label>
            <Select value={filtros.status} onValueChange={setStatus as (v: string) => void}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="em_prova">Em prova</SelectItem>
                <SelectItem value="finalizado">Finalizado</SelectItem>
                <SelectItem value="desistente">Desistente</SelectItem>
                <SelectItem value="desclassificado">Desclassificado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[180px] space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">Categoria</Label>
            <Select value={filtros.categoria} onValueChange={setCategoria as (v: string) => void}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {categorias.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 self-end pb-2.5">
            <Switch
              id="apenas-alertas"
              checked={filtros.apenasComAlertas}
              onCheckedChange={setApenasComAlertas}
            />
            <Label
              htmlFor="apenas-alertas"
              className="cursor-pointer text-sm"
            >
              Apenas com alertas
            </Label>
          </div>
        </div>
      </Card>

      {/* Bulk actions bar */}
      {selecionados.size > 0 && (
        <Card className="flex items-center justify-between bg-primary/5 p-3 px-4">
          <span className="text-sm font-medium">
            {selecionados.size} corredor
            {selecionados.size === 1 ? '' : 'es'} selecionado
            {selecionados.size === 1 ? '' : 's'}
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={limparSelecao}
              className="gap-1"
            >
              <X className="h-3.5 w-3.5" />
              Limpar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                const n = selecionados.size
                deletarSelecionados()
                toast.success(`${n} corredor${n === 1 ? '' : 'es'} removido${n === 1 ? '' : 's'}.`)
              }}
              className="gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remover selecionados
            </Button>
          </div>
        </Card>
      )}

      {/* Tabela */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={todosNaPaginaSelecionados}
                  onCheckedChange={() =>
                    toggleTodos(linhasDaPagina.map((l) => l.corredor.id))
                  }
                  aria-label="Selecionar todos da página"
                />
              </TableHead>
              <TableHead className="w-[44px]" />
              <SortableHead
                coluna="nome"
                atual={ordenacao}
                onToggle={toggleOrdenacao}
              >
                Nome
              </SortableHead>
              <SortableHead
                coluna="numeroCamisa"
                atual={ordenacao}
                onToggle={toggleOrdenacao}
                className="w-[80px]"
              >
                Camisa
              </SortableHead>
              <TableHead className="w-[120px]">Tag RFID</TableHead>
              <SortableHead
                coluna="categoria"
                atual={ordenacao}
                onToggle={toggleOrdenacao}
                className="w-[120px]"
              >
                Categoria
              </SortableHead>
              <SortableHead
                coluna="status"
                atual={ordenacao}
                onToggle={toggleOrdenacao}
                className="w-[130px]"
              >
                Status
              </SortableHead>
              <SortableHead
                coluna="bpmAtual"
                atual={ordenacao}
                onToggle={toggleOrdenacao}
                className="w-[110px]"
              >
                BPM
              </SortableHead>
              <SortableHead
                coluna="tempoAtual"
                atual={ordenacao}
                onToggle={toggleOrdenacao}
                className="w-[110px]"
              >
                Tempo
              </SortableHead>
              <TableHead className="w-[120px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  <TableCell colSpan={10}>
                    <Skeleton className="h-9 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : linhasDaPagina.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={10}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  Nenhum corredor encontrado com esses filtros.
                </TableCell>
              </TableRow>
            ) : (
              linhasDaPagina.map((l) => (
                <TableRow
                  key={l.corredor.id}
                  className="cursor-pointer"
                  onClick={(e) => {
                    // Não dispara o detalhe se clicaram em algo interativo.
                    const target = e.target as HTMLElement
                    if (target.closest('button, input, label, a')) return
                    setDetalhesCorredor(l.corredor)
                  }}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selecionados.has(l.corredor.id)}
                      onCheckedChange={() => toggleSelecao(l.corredor.id)}
                      aria-label={`Selecionar ${l.corredor.nome}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarImage src={l.corredor.foto} alt="" />
                      <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                        {iniciais(l.corredor.nome)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {l.corredor.nome}
                      </p>
                      {l.corredor.email && (
                        <p className="truncate text-[11px] text-muted-foreground">
                          {l.corredor.email}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono">
                      #{l.corredor.numeroCamisa}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopiarTag(l.corredor.tagRFID)
                      }}
                      className="group inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
                      title="Clique para copiar"
                    >
                      {l.corredor.tagRFID.length > 10
                        ? `${l.corredor.tagRFID.slice(0, 8)}...`
                        : l.corredor.tagRFID}
                      <Copy className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {l.corredor.categoria}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={l.status}
                      label={liveStatusLabels[l.status]}
                    />
                  </TableCell>
                  <TableCell>
                    {l.bpm !== undefined ? (
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 font-mono text-xs tabular-nums',
                          l.bpm > 180 || l.bpm < 100
                            ? 'text-destructive'
                            : 'text-foreground',
                        )}
                      >
                        <HeartPulse className="h-3.5 w-3.5 text-destructive" />
                        {l.bpm}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs tabular-nums">
                    {formatTempo(l.tempo)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDetalhesCorredor(l.corredor)
                        }}
                        aria-label="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFormCorredor(l.corredor)
                          setFormOpen(true)
                        }}
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteCorredor(l.corredor)
                        }}
                        aria-label="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Paginação */}
        {!loading && linhasOrdenadas.length > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
            <span className="text-muted-foreground">
              Mostrando{' '}
              <span className="font-medium text-foreground">
                {(paginaSegura - 1) * PAGINA_SIZE + 1}
              </span>
              {' – '}
              <span className="font-medium text-foreground">
                {Math.min(paginaSegura * PAGINA_SIZE, linhasOrdenadas.length)}
              </span>
              {' de '}
              <span className="font-medium text-foreground">
                {linhasOrdenadas.length}
              </span>
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                disabled={paginaSegura === 1}
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-3 text-xs">
                Página {paginaSegura} de {totalPaginas}
              </span>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                disabled={paginaSegura === totalPaginas}
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modais */}
      <CorredorDetalhesSheet
        corredor={detalhesCorredor}
        open={!!detalhesCorredor}
        onOpenChange={(open) => !open && setDetalhesCorredor(null)}
      />
      <CorredorFormDialog
        corredorParaEditar={formCorredor}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setFormCorredor(null)
        }}
      />
      <CorredorDeleteDialog
        corredor={deleteCorredor}
        open={!!deleteCorredor}
        onOpenChange={(open) => !open && setDeleteCorredor(null)}
      />
    </div>
  )
}

interface SortableHeadProps {
  coluna: OrdenacaoColuna
  atual: { coluna: OrdenacaoColuna; direcao: 'asc' | 'desc' }
  onToggle: (c: OrdenacaoColuna) => void
  children: React.ReactNode
  className?: string
}

function SortableHead({
  coluna,
  atual,
  onToggle,
  children,
  className,
}: SortableHeadProps) {
  const ativo = atual.coluna === coluna
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onToggle(coluna)}
        className={cn(
          'inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide transition-colors',
          ativo ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        {children}
        <ArrowUpDown
          className={cn(
            'h-3 w-3',
            ativo && 'text-primary',
            ativo && atual.direcao === 'desc' && 'rotate-180',
          )}
        />
      </button>
    </TableHead>
  )
}
