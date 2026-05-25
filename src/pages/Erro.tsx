import { AlertTriangle, ArrowLeft, RefreshCcw } from 'lucide-react'
import { Link, useNavigate, useRouteError } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'

// Capturado por `errorElement` no router. Usa useRouteError para resgatar
// o erro disparado em qualquer rota filha.
export default function ErroPage() {
  const error = useRouteError() as Error | { statusText?: string } | undefined
  const navigate = useNavigate()
  const mensagem =
    error instanceof Error
      ? error.message
      : (error as { statusText?: string })?.statusText ?? 'Erro desconhecido'

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/15 text-destructive ring-1 ring-destructive/30">
          <AlertTriangle className="h-8 w-8" />
        </span>
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Algo deu errado</h1>
          <p className="text-sm text-muted-foreground">
            Não conseguimos renderizar esta página. Tente novamente ou volte
            para a página inicial.
          </p>
        </div>
        <pre className="w-full overflow-x-auto rounded-md bg-muted px-3 py-2 text-left font-mono text-[11px] text-muted-foreground">
          {mensagem}
        </pre>
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => window.location.reload()}
          >
            <RefreshCcw className="h-4 w-4" />
            Recarregar
          </Button>
          <Button asChild className="flex-1">
            <Link to={ROUTES.HOME}>Página inicial</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
