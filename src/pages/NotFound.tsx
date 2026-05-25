import { ArrowLeft, RadioTower, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30">
          <RadioTower className="h-8 w-8" />
        </span>
        <div className="space-y-1">
          <p className="font-mono text-6xl font-bold tabular-nums text-primary">
            404
          </p>
          <h1 className="text-xl font-semibold">Sem sinal nesta rota</h1>
          <p className="text-sm text-muted-foreground">
            A página que você procura não foi encontrada. Talvez a tag tenha
            saído da área de cobertura.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button asChild className="flex-1 gap-2">
            <Link to={ROUTES.HOME}>
              <Search className="h-4 w-4" />
              Página inicial
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
