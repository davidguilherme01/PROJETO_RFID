import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  Radio,
  Tag,
  User,
} from 'lucide-react'
import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { StatusBadge } from '@/components/shared/StatusBadge'
import {
  mockCheckpoints,
  mockCronometragem,
  mockFrequencia,
  mockLeiturasRFID,
} from '@/data'
import { liveStatusLabels, liveStatusOf } from '@/store/corredoresStore'
import type { Corredor } from '@/types'

interface CorredorDetalhesSheetProps {
  corredor: Corredor | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function iniciais(nome: string) {
  return nome
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

function formatTempo(seg: number) {
  const h = Math.floor(seg / 3600)
  const m = Math.floor((seg % 3600) / 60)
  const s = seg % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

export function CorredorDetalhesSheet({
  corredor,
  open,
  onOpenChange,
}: CorredorDetalhesSheetProps) {
  // Dados derivados — recalculados quando o corredor muda.
  const cronos = useMemo(
    () =>
      corredor
        ? mockCronometragem
            .filter((c) => c.corredorId === corredor.id)
            .sort((a, b) => a.tempoTotal - b.tempoTotal)
        : [],
    [corredor],
  )

  const leituras = useMemo(
    () =>
      corredor
        ? mockLeiturasRFID
            .filter((l) => l.tagId === corredor.tagRFID)
            .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        : [],
    [corredor],
  )

  const bpmHist = useMemo(
    () =>
      corredor
        ? mockFrequencia
            .filter((f) => f.corredorId === corredor.id)
            .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
            .map((f) => ({
              timestamp: new Date(f.timestamp).getTime(),
              bpm: f.bpm,
            }))
        : [],
    [corredor],
  )

  if (!corredor) return null

  const status = liveStatusOf(corredor)
  const ultimaCrono = cronos[cronos.length - 1]
  const checkpointAtual = ultimaCrono
    ? mockCheckpoints.find((cp) => cp.id === ultimaCrono.checkpoint)
    : undefined
  const bpmAtual = bpmHist[bpmHist.length - 1]?.bpm

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto p-0 sm:max-w-[480px]"
      >
        <SheetHeader className="border-b border-border p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border border-border">
              <AvatarImage src={corredor.foto} alt="" />
              <AvatarFallback className="bg-primary/15 text-base font-semibold text-primary">
                {iniciais(corredor.nome)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate text-lg">
                {corredor.nome}
              </SheetTitle>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="secondary" className="font-mono">
                  #{corredor.numeroCamisa}
                </Badge>
                <span className="text-muted-foreground">
                  {corredor.categoria}
                </span>
                <StatusBadge
                  status={status}
                  label={liveStatusLabels[status]}
                />
              </div>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="geral" className="p-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
            <TabsTrigger value="desempenho">Desempenho</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="mt-4 space-y-4">
            <DadosSection title="Dados pessoais">
              <DadoRow icon={User} label="CPF" value={corredor.cpf} />
              <DadoRow icon={User} label="Idade" value={`${corredor.idade} anos`} />
              {corredor.sexo && (
                <DadoRow
                  icon={User}
                  label="Sexo"
                  value={
                    corredor.sexo === 'M'
                      ? 'Masculino'
                      : corredor.sexo === 'F'
                      ? 'Feminino'
                      : 'Outro'
                  }
                />
              )}
              <DadoRow
                icon={Mail}
                label="Email"
                value={corredor.email ?? '—'}
              />
              <DadoRow
                icon={Phone}
                label="Telefone"
                value={corredor.telefone ?? '—'}
              />
            </DadosSection>

            {corredor.contatoEmergencia && (
              <DadosSection title="Contato de emergência">
                <DadoRow
                  icon={User}
                  label={corredor.contatoEmergencia.parentesco}
                  value={corredor.contatoEmergencia.nome}
                />
                <DadoRow
                  icon={Phone}
                  label="Telefone"
                  value={corredor.contatoEmergencia.telefone}
                />
              </DadosSection>
            )}

            <DadosSection title="Inscrição">
              <DadoRow
                icon={MapPin}
                label="Data"
                value={format(
                  new Date(corredor.dataInscricao),
                  "d 'de' MMMM, yyyy",
                  { locale: ptBR },
                )}
              />
            </DadosSection>
          </TabsContent>

          <TabsContent value="equipamentos" className="mt-4 space-y-4">
            <DadosSection title="Tag RFID">
              <DadoRow icon={Tag} label="Código" value={corredor.tagRFID} />
              <DadoRow
                icon={Tag}
                label="Status"
                value={<StatusBadge status="ativa" label="Ativa" />}
              />
              <DadoRow
                icon={Tag}
                label="Última leitura"
                value={
                  leituras[0]
                    ? format(new Date(leituras[0].timestamp), 'HH:mm:ss')
                    : '—'
                }
              />
            </DadosSection>

            <DadosSection title="Cinta cardíaca">
              <DadoRow
                icon={HeartPulse}
                label="Modelo"
                value={corredor.cintaCardiacaId ? 'XOSS H10' : '—'}
              />
              <DadoRow
                icon={HeartPulse}
                label="ID"
                value={corredor.cintaCardiacaId ?? 'Não pareada'}
              />
              <DadoRow
                icon={HeartPulse}
                label="Status"
                value={
                  bpmAtual !== undefined ? (
                    <StatusBadge status="online" label="Transmitindo" />
                  ) : (
                    <StatusBadge status="offline" label="Sem sinal" />
                  )
                }
              />
            </DadosSection>
          </TabsContent>

          <TabsContent value="desempenho" className="mt-4 space-y-4">
            <DadosSection title="Posição atual">
              <DadoRow
                icon={MapPin}
                label="Checkpoint"
                value={checkpointAtual?.nome ?? '—'}
              />
              {ultimaCrono && (
                <>
                  <DadoRow
                    icon={MapPin}
                    label="Posição na prova"
                    value={`${ultimaCrono.posicao}º`}
                  />
                  <DadoRow
                    icon={MapPin}
                    label="Tempo decorrido"
                    value={
                      <span className="font-mono">
                        {formatTempo(ultimaCrono.tempoTotal)}
                      </span>
                    }
                  />
                </>
              )}
            </DadosSection>

            {bpmHist.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Frequência cardíaca (últimos 90min)
                </p>
                <div className="h-32 w-full">
                  <ResponsiveContainer>
                    <AreaChart
                      data={bpmHist}
                      margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="grad-bpm-sheet"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="timestamp"
                        type="number"
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={(t) => format(new Date(t), 'HH:mm')}
                        stroke="hsl(var(--muted-foreground))"
                        tickLine={false}
                        axisLine={false}
                        fontSize={10}
                        minTickGap={32}
                      />
                      <YAxis
                        domain={[120, 200]}
                        stroke="hsl(var(--muted-foreground))"
                        tickLine={false}
                        axisLine={false}
                        fontSize={10}
                      />
                      <Area
                        type="monotone"
                        dataKey="bpm"
                        stroke="#ef4444"
                        fill="url(#grad-bpm-sheet)"
                        strokeWidth={1.5}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {cronos.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Tempos parciais
                </p>
                <ul className="space-y-1.5">
                  {cronos.map((c) => {
                    const cp = mockCheckpoints.find(
                      (k) => k.id === c.checkpoint,
                    )
                    return (
                      <li
                        key={c.id}
                        className="flex items-center justify-between rounded-md border border-border bg-card/50 px-3 py-2 text-sm"
                      >
                        <span className="font-medium">{cp?.nome ?? '—'}</span>
                        <span className="font-mono tabular-nums text-muted-foreground">
                          {formatTempo(c.tempoTotal)}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </TabsContent>

          <TabsContent value="historico" className="mt-4 space-y-2">
            {leituras.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Nenhuma leitura registrada ainda.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {leituras.map((l) => {
                  const cp = mockCheckpoints.find(
                    (k) => k.id === l.checkpoint,
                  )
                  return (
                    <li
                      key={l.id}
                      className="flex items-center justify-between rounded-md border border-border bg-card/50 px-3 py-2 text-xs"
                    >
                      <span className="flex items-center gap-2">
                        <Radio className="h-3.5 w-3.5 text-primary" />
                        <span className="font-medium text-foreground">
                          {cp?.nome ?? l.checkpoint}
                        </span>
                      </span>
                      <span className="font-mono tabular-nums text-muted-foreground">
                        {format(new Date(l.timestamp), 'HH:mm:ss')}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

function DadosSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="space-y-1.5 rounded-lg border border-border bg-card/50 p-3">
        {children}
      </div>
    </div>
  )
}

function DadoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  )
}
