import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Activity,
  Download,
  FileText,
  HeartPulse,
  Server,
  Share2,
  Trophy,
  User,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PageHeader } from '@/components/shared/PageHeader'
import {
  investimentoTotal,
  mockCheckpoints,
  mockCorredores,
  mockCronometragem,
  mockEquipamentos,
  mockFrequencia,
  totalCategorias,
} from '@/data'
import { cn } from '@/lib/utils'

const fmtBRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

type RelatorioId =
  | 'prova'
  | 'financeiro'
  | 'saude'
  | 'performance'
  | 'equipamentos'
  | 'individual'

interface RelatorioDef {
  id: RelatorioId
  titulo: string
  descricao: string
  icon: LucideIcon
  tom: 'verde' | 'amarelo' | 'vermelho' | 'azul' | 'roxo'
}

const relatorios: RelatorioDef[] = [
  {
    id: 'prova',
    titulo: 'Relatório de Prova',
    descricao: 'Dados gerais da corrida, vencedores por categoria e estatísticas.',
    icon: Trophy,
    tom: 'amarelo',
  },
  {
    id: 'financeiro',
    titulo: 'Relatório Financeiro',
    descricao: 'Investimento por categoria de equipamento e custo total.',
    icon: Wallet,
    tom: 'verde',
  },
  {
    id: 'saude',
    titulo: 'Relatório de Saúde',
    descricao: 'Análise dos BPMs, alertas cardíacos e tempo em zona segura.',
    icon: HeartPulse,
    tom: 'vermelho',
  },
  {
    id: 'performance',
    titulo: 'Relatório de Performance',
    descricao: 'Tempos médios, ritmo, distribuição de pace por categoria.',
    icon: Activity,
    tom: 'azul',
  },
  {
    id: 'equipamentos',
    titulo: 'Relatório de Equipamentos',
    descricao: 'Uso e status final da infraestrutura de hardware.',
    icon: Server,
    tom: 'roxo',
  },
  {
    id: 'individual',
    titulo: 'Relatório Individual',
    descricao: 'Dossiê completo de um corredor específico (selecionável).',
    icon: User,
    tom: 'azul',
  },
]

const tomToBg: Record<RelatorioDef['tom'], string> = {
  verde: 'bg-primary/10 text-primary',
  amarelo: 'bg-amber-500/15 text-amber-500',
  vermelho: 'bg-destructive/15 text-destructive',
  azul: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  roxo: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
}

export default function RelatoriosPage() {
  const [selecionado, setSelecionado] = useState<RelatorioDef | null>(null)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Pré-visualize e exporte relatórios gerados a partir dos dados da prova."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {relatorios.map((r) => {
          const Icon = r.icon
          return (
            <Card
              key={r.id}
              className="flex flex-col p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span
                className={cn(
                  'mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl',
                  tomToBg[r.tom],
                )}
              >
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="text-base font-semibold tracking-tight">
                {r.titulo}
              </h3>
              <p className="mt-1 flex-1 text-xs text-muted-foreground">
                {r.descricao}
              </p>
              <Button
                size="sm"
                onClick={() => setSelecionado(r)}
                className="mt-4 self-start gap-2"
              >
                <FileText className="h-4 w-4" />
                Gerar
              </Button>
            </Card>
          )
        })}
      </div>

      <RelatorioDialog
        relatorio={selecionado}
        onClose={() => setSelecionado(null)}
      />
    </div>
  )
}

function RelatorioDialog({
  relatorio,
  onClose,
}: {
  relatorio: RelatorioDef | null
  onClose: () => void
}) {
  return (
    <Dialog open={!!relatorio} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{relatorio?.titulo}</DialogTitle>
          <DialogDescription>
            Pré-visualização · {format(new Date(), "d 'de' MMMM, yyyy", { locale: ptBR })}
          </DialogDescription>
        </DialogHeader>

        {relatorio && (
          <div className="space-y-4 rounded-lg border border-dashed border-border bg-card/30 p-5">
            <RelatorioPreview id={relatorio.id} />
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href)
              toast.success('Link copiado para a área de transferência.')
            }}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            Compartilhar link
          </Button>
          <Button
            onClick={() =>
              toast.success(
                `Relatório "${relatorio?.titulo}" gerado (mock).`,
                {
                  description: 'A geração real de PDF chega em iteração futura.',
                },
              )
            }
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Baixar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Previews curtos por relatório — números reais a partir dos mocks,
// pra dar credibilidade. A geração real (PDF/dados completos) é mock.
function RelatorioPreview({ id }: { id: RelatorioId }) {
  const stats = useMemo(() => {
    const ativos = mockCorredores.filter((c) => c.status === 'ativo')
    const cpChegada = mockCheckpoints.find((c) => c.nome === 'Chegada')
    const finishers = mockCronometragem.filter(
      (c) => c.checkpoint === cpChegada?.id,
    )
    const bpms = mockFrequencia.map((f) => f.bpm)
    const bpmMedio = Math.round(
      bpms.reduce((a, b) => a + b, 0) / bpms.length,
    )
    return {
      totalAtivos: ativos.length,
      finishers: finishers.length,
      bpmMedio,
      bpmMax: Math.max(...bpms),
      bpmMin: Math.min(...bpms),
    }
  }, [])

  switch (id) {
    case 'prova':
      return (
        <>
          <PreviewLinha titulo="Total de inscritos">{mockCorredores.length}</PreviewLinha>
          <PreviewLinha titulo="Corredores ativos">{stats.totalAtivos}</PreviewLinha>
          <PreviewLinha titulo="Finalizaram">{stats.finishers}</PreviewLinha>
          <PreviewLinha titulo="Checkpoints">{mockCheckpoints.length}</PreviewLinha>
        </>
      )
    case 'financeiro':
      return (
        <>
          <PreviewLinha titulo="Investimento total">
            <span className="font-mono font-semibold text-primary">
              {fmtBRL.format(investimentoTotal)}
            </span>
          </PreviewLinha>
          <PreviewLinha titulo="Categorias de equipamento">
            {totalCategorias}
          </PreviewLinha>
          <PreviewLinha titulo="Maior linha">
            {(() => {
              const maior = [...mockEquipamentos].sort(
                (a, b) =>
                  b.quantidade * b.valorUnitario -
                  a.quantidade * a.valorUnitario,
              )[0]
              return `${maior.categoria} · ${fmtBRL.format(
                maior.quantidade * maior.valorUnitario,
              )}`
            })()}
          </PreviewLinha>
        </>
      )
    case 'saude':
      return (
        <>
          <PreviewLinha titulo="BPM médio geral">{stats.bpmMedio}</PreviewLinha>
          <PreviewLinha titulo="BPM máximo">{stats.bpmMax}</PreviewLinha>
          <PreviewLinha titulo="BPM mínimo">{stats.bpmMin}</PreviewLinha>
          <PreviewLinha titulo="Amostras coletadas">
            {mockFrequencia.length}
          </PreviewLinha>
        </>
      )
    case 'performance':
      return (
        <>
          <PreviewLinha titulo="Total de passagens registradas">
            {mockCronometragem.length}
          </PreviewLinha>
          <PreviewLinha titulo="Categoria com mais inscritos">
            {(() => {
              const counts = new Map<string, number>()
              for (const c of mockCorredores) {
                counts.set(c.categoria, (counts.get(c.categoria) ?? 0) + 1)
              }
              const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
              return `${top[0]} (${top[1]})`
            })()}
          </PreviewLinha>
        </>
      )
    case 'equipamentos':
      return (
        <>
          {mockEquipamentos.slice(0, 5).map((e) => (
            <PreviewLinha key={e.id} titulo={e.categoria}>
              <Badge variant="secondary" className="font-mono">
                {e.quantidadeAtiva}/{e.quantidade} {e.unidadeStatus}
              </Badge>
            </PreviewLinha>
          ))}
        </>
      )
    case 'individual':
      return (
        <p className="text-sm text-muted-foreground">
          Selecione um corredor (placeholder) para gerar dossiê completo
          com BPMs, parciais, histórico de leituras e fotos da prova.
        </p>
      )
  }
}

function PreviewLinha({
  titulo,
  children,
}: {
  titulo: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">
        {titulo}
      </span>
      <span className="text-sm font-semibold text-foreground">{children}</span>
    </div>
  )
}
