import {
  Activity,
  Eye,
  EyeOff,
  HeartPulse,
  Lock,
  Mail,
  Radio,
  RadioTower,
  Shield,
  Trophy,
  type LucideIcon,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { APP_NAME, APP_TAGLINE, PERFIS, ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import type { PerfilUsuario } from '@/types'

const heroFeatures: { icon: LucideIcon; title: string; description: string }[] =
  [
    {
      icon: Radio,
      title: 'Identificação via RFID UHF',
      description:
        'Leitura automática das tags em cada checkpoint, sem fila e sem operador manual.',
    },
    {
      icon: HeartPulse,
      title: 'Monitoramento cardíaco em tempo real',
      description:
        'Acompanhe BPM e alertas de zona crítica dos atletas durante toda a prova.',
    },
    {
      icon: Trophy,
      title: 'Ranking ao vivo durante a prova',
      description:
        'Classificação atualizada checkpoint a checkpoint para organização e espectadores.',
    },
  ]

const demoButtons: {
  perfil: PerfilUsuario
  icon: LucideIcon
  label: string
  description: string
}[] = [
  {
    perfil: PERFIS.ADMINISTRADOR,
    icon: Shield,
    label: 'Administrador',
    description: 'Gerencie a corrida completa',
  },
  {
    perfil: PERFIS.CORREDOR,
    icon: Activity,
    label: 'Corredor',
    description: 'Acompanhe seu desempenho',
  },
  {
    perfil: PERFIS.ESPECTADOR,
    icon: Eye,
    label: 'Espectador',
    description: 'Visualize a competição',
  },
]

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const loginDemo = useAuthStore((s) => s.loginDemo)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email.trim() || !senha) {
      toast.error('Preencha email e senha para continuar.')
      return
    }
    setSubmitting(true)
    const ok = login(email, senha)
    setSubmitting(false)
    if (ok) {
      toast.success('Login realizado com sucesso.')
      navigate(ROUTES.HOME, { replace: true })
    } else {
      toast.error('Email não encontrado. Tente um dos botões de demo abaixo.')
    }
  }

  const handleDemo = (perfil: PerfilUsuario) => {
    loginDemo(perfil)
    navigate(ROUTES.HOME, { replace: true })
  }

  return (
    <div className="grid min-h-screen w-full bg-background text-foreground lg:grid-cols-[3fr_2fr]">
      <aside
        className={cn(
          'relative hidden flex-col justify-between overflow-hidden p-10 lg:flex xl:p-14',
          'bg-gradient-to-br from-primary/20 via-background to-background',
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,hsl(var(--primary)/0.18)_1px,transparent_0)] [background-size:22px_22px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-primary/15 blur-3xl"
        />

        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
            <RadioTower className="h-6 w-6" aria-hidden />
          </span>
          <div className="leading-tight">
            <p className="text-base font-semibold tracking-tight">
              {APP_NAME}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              v0.1
            </p>
          </div>
        </div>

        <div className="relative flex flex-col gap-10">
          <div className="space-y-3">
            <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
              {APP_NAME}
            </h1>
            <p className="max-w-md text-base text-muted-foreground">
              {APP_TAGLINE}.
            </p>
          </div>

          <ul className="flex max-w-md flex-col gap-5">
            {heroFeatures.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-card text-primary ring-1 ring-primary/30">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">
                    {title}
                  </p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
          Projeto acadêmico · UHF · IoT · IA
        </p>
      </aside>

      <main className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm space-y-8">
          <header className="flex flex-col items-start gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
              <RadioTower className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-lg font-semibold">{APP_NAME}</p>
              <p className="text-xs text-muted-foreground">{APP_TAGLINE}</p>
            </div>
          </header>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Bem-vindo de volta
            </h2>
            <p className="text-sm text-muted-foreground">
              Acesse com seu email institucional ou use um dos perfis de demo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@racetrack.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="px-9"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {mostrarSenha ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              Entrar
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              ou acesse como demo
            </span>
            <Separator className="flex-1" />
          </div>

          <div className="space-y-2">
            {demoButtons.map(({ perfil, icon: Icon, label, description }) => (
              <button
                key={perfil}
                type="button"
                onClick={() => handleDemo(perfil)}
                className="group flex w-full items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left transition-all duration-200 hover:border-primary/50 hover:bg-card/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/30 transition-colors duration-200 group-hover:bg-primary/20">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="flex flex-1 flex-col leading-tight">
                  <span className="text-sm font-semibold text-foreground">
                    {label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {description}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
