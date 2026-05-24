import { formatDistanceToNowStrict } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronRight } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { useLeiturasRecentes } from '@/hooks/useLeiturasRecentes'
import { mockCheckpoints, mockCorredores } from '@/data'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface UltimasLeiturasProps {
  data: ReturnType<typeof useLeiturasRecentes>
}

// Cor do badge por checkpoint, baseado em posição no percurso.
const corPorCheckpoint: Record<string, string> = {
  'CP-01': 'bg-slate-500/15 text-slate-600 dark:text-slate-300',
  'CP-02': 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  'CP-03': 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  'CP-04': 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  'CP-05': 'bg-primary/15 text-primary',
}

// RSSI sintético baseado no id da leitura (estável entre re-renders).
function rssiSintetico(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return -45 - (h % 30) // -45 a -74
}

export function UltimasLeituras({ data }: UltimasLeiturasProps) {
  const { leituras, novaLeituraId } = data

  // Index para resolução rápida de corredor por tag.
  const corredorPorTag = useMemo(
    () => new Map(mockCorredores.map((c) => [c.tagRFID, c])),
    [],
  )
  const checkpointPorId = useMemo(
    () => new Map(mockCheckpoints.map((c) => [c.id, c])),
    [],
  )

  const linhas = leituras.slice(0, 8)

  return (
    <Card className="h-full transition-shadow duration-200 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-base">Últimas leituras RFID</CardTitle>
          <p className="text-xs text-muted-foreground">
            Atualização contínua · novas entradas chegam destacadas
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
          <Link to={ROUTES.ADMIN.CRONOMETRAGEM}>
            Ver todas
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[80px]">Hora</TableHead>
              <TableHead>Corredor</TableHead>
              <TableHead className="w-[70px]">Camisa</TableHead>
              <TableHead className="w-[110px]">Tag</TableHead>
              <TableHead>Checkpoint</TableHead>
              <TableHead className="w-[80px] text-right">RSSI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {linhas.map((l) => {
              const corredor = corredorPorTag.get(l.tagId)
              const cp = checkpointPorId.get(l.checkpoint)
              const isNova = l.id === novaLeituraId
              return (
                <TableRow
                  key={l.id}
                  className={cn(
                    'transition-colors duration-1000',
                    isNova && 'bg-primary/10',
                  )}
                >
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDistanceToNowStrict(new Date(l.timestamp), {
                      locale: ptBR,
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {corredor?.nome ?? '—'}
                  </TableCell>
                  <TableCell className="font-mono text-xs tabular-nums">
                    #{corredor?.numeroCamisa ?? '—'}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {l.tagId.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        'border-0 font-medium',
                        corPorCheckpoint[l.checkpoint] ?? '',
                      )}
                    >
                      {cp?.nome ?? l.checkpoint}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                    {rssiSintetico(l.id)} dBm
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
