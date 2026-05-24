import { Construction, type LucideIcon } from 'lucide-react'
import { PageHeader } from './PageHeader'

interface PagePlaceholderProps {
  title: string
  description?: string
  icon?: LucideIcon
}

// Stub padrão usado em todas as rotas autenticadas até as Etapas 5–7.
// Combina PageHeader (real, reutilizável) com um card "em construção".
export function PagePlaceholder({
  title,
  description = 'Esta tela será preenchida nas próximas etapas do projeto.',
  icon: Icon = Construction,
}: PagePlaceholderProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />

      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/30">
          <Icon className="h-6 w-6" aria-hidden />
        </span>
        <p className="text-sm font-medium text-foreground">
          Tela em construção
        </p>
        <p className="max-w-sm text-xs text-muted-foreground">
          Esta área receberá os componentes de negócio nas próximas etapas do
          projeto.
        </p>
      </div>
    </div>
  )
}
