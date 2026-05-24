import { DollarSign, HeartPulse, Tag, Wifi, X } from 'lucide-react'
import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { AntenasMonitoramento } from '@/components/hardware/AntenasMonitoramento'
import { HardwareTopologia } from '@/components/hardware/HardwareTopologia'
import { KpiCard } from '@/components/dashboard/KpiCard'
import {
  mockEquipamentos,
  investimentoTotal,
  totalCategorias,
  valorTotalItem,
  statusLabelEquipamento,
  statusTomEquipamento,
} from '@/data'
import { cn } from '@/lib/utils'
import { useDispositivosStore } from '@/store/dispositivosStore'

const fmtBRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const tomToStatus = {
  verde: 'online',
  amarelo: 'alerta',
  vermelho: 'offline',
} as const

export default function HardwarePage() {
  const itemSelecionadoId = useDispositivosStore(
    (s) => s.itemSelecionadoId,
  )
  const selecionar = useDispositivosStore((s) => s.selecionar)

  // Métricas derivadas dos cards.
  const metricas = useMemo(() => {
    const hardwareItems = mockEquipamentos.filter(
      (e) =>
        !['Tag RFID', 'Camisa RFID', 'Cinta Cardíaca'].includes(e.categoria),
    )
    const totalHw = hardwareItems.reduce((s, e) => s + e.quantidade, 0)
    const ativosHw = hardwareItems.reduce(
      (s, e) => s + e.quantidadeAtiva,
      0,
    )
    const tag = mockEquipamentos.find((e) => e.categoria === 'Tag RFID')
    const cinta = mockEquipamentos.find(
      (e) => e.categoria === 'Cinta Cardíaca',
    )
    return {
      total: investimentoTotal,
      dispositivosOnline: { ativos: ativosHw, total: totalHw },
      tags: tag ?? null,
      cintas: cinta ?? null,
    }
  }, [])

  const itemSelecionado = mockEquipamentos.find(
    (e) => e.id === itemSelecionadoId,
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipamentos da Rede"
        description={`Investimento total: ${fmtBRL.format(
          investimentoTotal,
        )} · ${totalCategorias} categorias`}
      />

      {/* ── Cards-resumo ───────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total investido"
          value={fmtBRL.format(metricas.total)}
          variacao={0}
          tom="verde"
          icon={DollarSign}
          comparativoLabel="ciclo atual"
        />
        <KpiCard
          label="Dispositivos online"
          value={
            <span>
              {metricas.dispositivosOnline.ativos}
              <span className="ml-1 text-xl text-muted-foreground">
                / {metricas.dispositivosOnline.total}
              </span>
            </span>
          }
          variacao={0}
          tom="azul"
          icon={Wifi}
          comparativoLabel="rede principal"
        />
        <KpiCard
          label="Tags RFID ativas"
          value={
            metricas.tags
              ? `${metricas.tags.quantidadeAtiva} / ${metricas.tags.quantidade}`
              : '—'
          }
          variacao={0}
          tom="amarelo"
          icon={Tag}
          comparativoLabel="atletas equipados"
        />
        <KpiCard
          label="Cintas pareadas"
          value={
            metricas.cintas
              ? `${metricas.cintas.quantidadeAtiva} / ${metricas.cintas.quantidade}`
              : '—'
          }
          variacao={0}
          tom="vermelho"
          icon={HeartPulse}
          iconAnimado
          comparativoLabel="cardio monitorado"
        />
      </div>

      {/* ── Topologia ─────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Topologia da rede</CardTitle>
          <p className="text-xs text-muted-foreground">
            Clique em qualquer componente para ver detalhes. Linhas
            animadas indicam fluxo de dados ao vivo; tracejado contínuo é
            redundância.
          </p>
        </CardHeader>
        <CardContent>
          <HardwareTopologia
            selectedId={null}
            onSelect={(id) => {
              // Topologia tem nodes próprios (não-catalogo). Por enquanto
              // não selecionamos do catálogo a partir do diagrama.
              if (id) console.debug('topologia: selecionado', id)
            }}
          />
        </CardContent>
      </Card>

      {/* ── Tabela do catálogo ────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Catálogo de equipamentos</CardTitle>
          <p className="text-xs text-muted-foreground">
            Clique em uma linha para ver especificações detalhadas.
          </p>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[64px]">Ícone</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead className="w-[80px] text-center">Qtd</TableHead>
                <TableHead className="w-[120px] text-right">
                  Valor unit.
                </TableHead>
                <TableHead className="w-[140px] text-right">
                  Valor total
                </TableHead>
                <TableHead className="w-[140px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockEquipamentos.map((e) => {
                const Icon = e.icon
                const tom = statusTomEquipamento(e)
                const isSelected = itemSelecionadoId === e.id
                return (
                  <TableRow
                    key={e.id}
                    onClick={() => selecionar(e.id)}
                    className={cn(
                      'cursor-pointer',
                      isSelected && 'bg-accent/40',
                    )}
                  >
                    <TableCell>
                      <span
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-lg',
                          tom === 'verde'
                            ? 'bg-primary/10 text-primary'
                            : tom === 'amarelo'
                            ? 'bg-amber-500/15 text-amber-500'
                            : 'bg-destructive/15 text-destructive',
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {e.categoria}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {e.modelo}
                    </TableCell>
                    <TableCell className="text-center font-mono tabular-nums">
                      {e.quantidade}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {fmtBRL.format(e.valorUnitario)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold tabular-nums">
                      {fmtBRL.format(valorTotalItem(e))}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={tomToStatus[tom]}
                        label={statusLabelEquipamento(e)}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableCell colSpan={5} className="text-right font-semibold">
                  TOTAL
                </TableCell>
                <TableCell className="text-right font-mono text-base font-bold text-primary">
                  {fmtBRL.format(investimentoTotal)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      {/* ── Monitoramento ao vivo das antenas ────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Status ao vivo</CardTitle>
              <p className="text-xs text-muted-foreground">
                10 antenas RFID distribuídas nos 5 checkpoints. Métricas a
                cada 5s.
              </p>
            </div>
            <Badge variant="secondary" className="border-0 bg-primary/15 text-primary">
              9 / 10 online
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <AntenasMonitoramento />
        </CardContent>
      </Card>

      {/* ── Sheet de detalhes do item da tabela ──────── */}
      <Sheet
        open={!!itemSelecionado}
        onOpenChange={(open) => !open && selecionar(null)}
      >
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-[420px]"
        >
          {itemSelecionado && (
            <>
              <SheetHeader className="pb-4">
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-xl',
                      statusTomEquipamento(itemSelecionado) === 'verde'
                        ? 'bg-primary/10 text-primary'
                        : statusTomEquipamento(itemSelecionado) === 'amarelo'
                        ? 'bg-amber-500/15 text-amber-500'
                        : 'bg-destructive/15 text-destructive',
                    )}
                  >
                    <itemSelecionado.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <SheetTitle>{itemSelecionado.categoria}</SheetTitle>
                    <SheetDescription>
                      {itemSelecionado.modelo} · {itemSelecionado.fornecedor}
                    </SheetDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => selecionar(null)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </SheetHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <DetalheBox label="Quantidade">
                    <p className="text-xl font-bold tabular-nums">
                      {itemSelecionado.quantidade}
                    </p>
                  </DetalheBox>
                  <DetalheBox label="Valor unit.">
                    <p className="text-sm font-bold tabular-nums">
                      {fmtBRL.format(itemSelecionado.valorUnitario)}
                    </p>
                  </DetalheBox>
                  <DetalheBox label="Total">
                    <p className="text-sm font-bold tabular-nums text-primary">
                      {fmtBRL.format(valorTotalItem(itemSelecionado))}
                    </p>
                  </DetalheBox>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Status operacional
                  </p>
                  <StatusBadge
                    status={tomToStatus[statusTomEquipamento(itemSelecionado)]}
                    label={statusLabelEquipamento(itemSelecionado)}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Especificações
                  </p>
                  <p className="rounded-lg border border-border bg-card/50 p-3 text-sm leading-relaxed text-foreground">
                    {itemSelecionado.especificacoes}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Fornecedor
                  </p>
                  <p className="text-sm text-foreground">
                    {itemSelecionado.fornecedor}
                  </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function DetalheBox({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border bg-card/50 p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-1">{children}</div>
    </div>
  )
}
