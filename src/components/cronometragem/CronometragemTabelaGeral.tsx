import { Download, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { mockCheckpoints, mockCorredores, mockCronometragem } from '@/data'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'

const ativos = mockCorredores.filter((c) => c.status === 'ativo')
const checkpointsOrdenados = [...mockCheckpoints].sort(
  (a, b) => a.posicaoKm - b.posicaoKm,
)

// Tempo médio por checkpoint, pra colorir as células relativamente.
const mediaPorCp = (() => {
  const map = new Map<string, number>()
  for (const cp of checkpointsOrdenados) {
    const vals = mockCronometragem
      .filter((c) => c.checkpoint === cp.id)
      .map((c) => c.tempoTotal)
    if (vals.length > 0) {
      map.set(cp.id, vals.reduce((a, b) => a + b, 0) / vals.length)
    }
  }
  return map
})()

function formatTempo(seg: number) {
  const h = Math.floor(seg / 3600)
  const m = Math.floor((seg % 3600) / 60)
  const s = seg % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

// Classe de cor baseada em quão rápido o corredor foi vs média do CP.
// < 0.92 = ótimo (verde forte), < 1 = bom, ~ 1 = neutro, > 1 = atrasado.
function corCelula(tempo: number, media: number | undefined): string {
  if (!media) return ''
  const ratio = tempo / media
  if (ratio < 0.92) return 'bg-primary/30 text-primary-foreground'
  if (ratio < 1) return 'bg-primary/10 text-primary'
  if (ratio < 1.05) return 'bg-muted text-foreground'
  if (ratio < 1.12) return 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
  return 'bg-destructive/15 text-destructive'
}

export function CronometragemTabelaGeral() {
  const [busca, setBusca] = useState('')
  const buscaDebounced = useDebounce(busca, 250)

  const linhas = useMemo(() => {
    const b = buscaDebounced.trim().toLowerCase()
    return ativos
      .filter((c) =>
        !b ||
        c.nome.toLowerCase().includes(b) ||
        c.numeroCamisa.toString().includes(b),
      )
      .map((c) => ({
        corredor: c,
        tempos: new Map(
          mockCronometragem
            .filter((cr) => cr.corredorId === c.id)
            .map((cr) => [cr.checkpoint, cr.tempoTotal]),
        ),
      }))
      .sort((a, b) => a.corredor.numeroCamisa - b.corredor.numeroCamisa)
  }, [buscaDebounced])

  const exportCsv = () => {
    const header = ['Camisa', 'Nome', 'Categoria', ...checkpointsOrdenados.map((cp) => cp.nome)]
    const rows = linhas.map((l) => [
      l.corredor.numeroCamisa.toString(),
      l.corredor.nome,
      l.corredor.categoria,
      ...checkpointsOrdenados.map((cp) => {
        const t = l.tempos.get(cp.id)
        return t !== undefined ? formatTempo(t) : '—'
      }),
    ])
    const csv = [header, ...rows]
      .map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([`﻿${csv}`], {
      type: 'text/csv;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cronometragem-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exportadas ${linhas.length} linhas.`)
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar nome ou número da camisa"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={exportCsv}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            toast.info('Exportação PDF chega em uma próxima iteração.')
          }
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          PDF
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-card">
            <tr>
              <th className="sticky left-0 z-20 bg-card px-4 py-3 text-left text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Corredor
              </th>
              {checkpointsOrdenados.map((cp) => (
                <th
                  key={cp.id}
                  className="border-l border-border px-3 py-3 text-center text-[10px] font-medium uppercase tracking-widest text-muted-foreground"
                >
                  {cp.nome}
                  <span className="block text-[9px] font-normal text-muted-foreground/70">
                    {cp.posicaoKm}km
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {linhas.length === 0 ? (
              <tr>
                <td
                  colSpan={1 + checkpointsOrdenados.length}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  Nenhum corredor encontrado com esse filtro.
                </td>
              </tr>
            ) : (
              linhas.map((l) => (
                <tr key={l.corredor.id}>
                  <td className="sticky left-0 z-10 min-w-[220px] bg-card px-4 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="h-5 flex-shrink-0 font-mono text-[10px]"
                      >
                        #{l.corredor.numeroCamisa}
                      </Badge>
                      <span className="truncate font-medium">
                        {l.corredor.nome}
                      </span>
                    </div>
                  </td>
                  {checkpointsOrdenados.map((cp) => {
                    const t = l.tempos.get(cp.id)
                    return (
                      <td
                        key={cp.id}
                        className={cn(
                          'border-l border-border px-3 py-2 text-center font-mono text-xs tabular-nums',
                          t !== undefined && corCelula(t, mediaPorCp.get(cp.id)),
                        )}
                      >
                        {t !== undefined ? formatTempo(t) : '—'}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border p-3 text-[11px] text-muted-foreground">
        Cores indicam desempenho relativo à média do checkpoint —
        <span className="ml-2 inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded bg-primary/30" /> rápido
        </span>
        <span className="ml-3 inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded bg-muted" /> próximo da média
        </span>
        <span className="ml-3 inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded bg-destructive/30" /> lento
        </span>
      </div>
    </Card>
  )
}
