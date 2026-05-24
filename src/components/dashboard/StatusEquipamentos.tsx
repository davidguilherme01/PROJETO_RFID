import { formatDistanceToNowStrict } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ChevronRight,
  Network,
  Radio,
  RadioTower,
  Router,
  Server,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { mockDispositivos } from '@/data'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { TipoDispositivo } from '@/types'

const iconePorTipo: Record<TipoDispositivo, LucideIcon> = {
  Servidor: Server,
  Switch: Network,
  AP: RadioTower,
  Leitor: Radio,
}

export function StatusEquipamentos() {
  // Ordena: online primeiro, depois alerta, depois offline.
  const ordemStatus = { online: 0, alerta: 1, offline: 2 } as const
  const equipamentos = [...mockDispositivos].sort(
    (a, b) => ordemStatus[a.status] - ordemStatus[b.status],
  )

  return (
    <Card className="h-full transition-shadow duration-200 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-base">Status dos equipamentos</CardTitle>
          <p className="text-xs text-muted-foreground">
            {mockDispositivos.filter((d) => d.status === 'online').length} de{' '}
            {mockDispositivos.length} online
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
          <Link to={ROUTES.ADMIN.HARDWARE}>
            Ver detalhes
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="divide-y divide-border">
          {equipamentos.map((d) => {
            const Icon = iconePorTipo[d.tipo] ?? Router
            return (
              <li key={d.id} className="flex items-center gap-3 py-2.5">
                <span
                  className={cn(
                    'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg',
                    d.status === 'online'
                      ? 'bg-primary/10 text-primary'
                      : d.status === 'alerta'
                      ? 'bg-amber-500/15 text-amber-500'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {d.nome}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {d.ip} ·{' '}
                    {formatDistanceToNowStrict(new Date(d.ultimaConexao), {
                      locale: ptBR,
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <StatusBadge status={d.status} className="flex-shrink-0" />
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
