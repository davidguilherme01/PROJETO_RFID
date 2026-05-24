import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  label?: string
  className?: string
}

type Tom = 'verde' | 'cinza' | 'amarelo' | 'azul' | 'vermelho'

// Map status conhecidos → tom de cor. Default = cinza.
const tomPorStatus: Record<string, Tom> = {
  // verde
  online: 'verde',
  em_prova: 'verde',
  ativo: 'verde',
  ativa: 'verde',

  // cinza
  offline: 'cinza',
  desistente: 'cinza',
  inativo: 'cinza',
  inativa: 'cinza',

  // amarelo
  alerta: 'amarelo',
  manutencao: 'amarelo',

  // azul
  finalizado: 'azul',

  // vermelho
  desclassificado: 'vermelho',
  critico: 'vermelho',
}

// Tom usa colors do Tailwind direto (não dependem do tema) — funciona em
// dark e light igualmente. Tom verde reusa primary para casar com a marca.
const classByTom: Record<Tom, string> = {
  verde:
    'bg-primary/15 text-primary ring-1 ring-inset ring-primary/30 hover:bg-primary/20',
  cinza:
    'bg-muted text-muted-foreground ring-1 ring-inset ring-border hover:bg-muted',
  amarelo:
    'bg-amber-500/15 text-amber-500 ring-1 ring-inset ring-amber-500/30 hover:bg-amber-500/20 dark:text-amber-400',
  azul:
    'bg-blue-500/15 text-blue-600 ring-1 ring-inset ring-blue-500/30 hover:bg-blue-500/20 dark:text-blue-400',
  vermelho:
    'bg-destructive/15 text-destructive ring-1 ring-inset ring-destructive/30 hover:bg-destructive/20',
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const tom = tomPorStatus[status.toLowerCase()] ?? 'cinza'
  const display = label ?? status

  return (
    <Badge
      variant="secondary"
      className={cn(
        'gap-1.5 border-0 font-medium capitalize',
        classByTom[tom],
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'inline-block h-1.5 w-1.5 rounded-full',
          tom === 'verde' && 'bg-primary',
          tom === 'cinza' && 'bg-muted-foreground/60',
          tom === 'amarelo' && 'bg-amber-500',
          tom === 'azul' && 'bg-blue-500',
          tom === 'vermelho' && 'bg-destructive',
        )}
      />
      {display}
    </Badge>
  )
}
