import {
  Activity,
  FileText,
  HeartPulse,
  LayoutDashboard,
  Map,
  MapPin,
  Route,
  Server,
  Timer,
  Trophy,
  UserCheck,
  Users,
} from 'lucide-react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { PagePlaceholder } from '@/components/shared/PagePlaceholder'
import { ROUTES } from '@/lib/constants'
import Home from '@/pages/Home'
import Login from '@/pages/auth/Login'
import SemAcesso from '@/pages/auth/SemAcesso'

// Conteúdo real das páginas vem nas Etapas 5–7. Por ora, PagePlaceholder
// (que já usa PageHeader internamente) preenche cada rota com um stub
// consistente. O wrapping em MainLayout aplica Sidebar + Header em todas
// as rotas autenticadas; /login e /sem-acesso ficam de fora.

export const router = createBrowserRouter([
  { path: ROUTES.HOME, element: <Home /> },
  { path: ROUTES.LOGIN, element: <Login /> },
  { path: ROUTES.SEM_ACESSO, element: <SemAcesso /> },

  {
    element: <MainLayout />,
    children: [
      // ---------- ADMINISTRADOR ----------
      {
        element: <ProtectedRoute allowedPerfis={['administrador']} />,
        children: [
          {
            path: ROUTES.ADMIN.DASHBOARD,
            element: (
              <PagePlaceholder
                title="Dashboard Admin"
                description="Visão geral em tempo real da prova — corredores ativos, leituras por checkpoint e saúde dos dispositivos."
                icon={LayoutDashboard}
              />
            ),
          },
          {
            path: ROUTES.ADMIN.CORREDORES,
            element: (
              <PagePlaceholder
                title="Corredores"
                description="Cadastro, edição e consulta dos atletas inscritos."
                icon={Users}
              />
            ),
          },
          {
            path: ROUTES.ADMIN.ESPECTADORES,
            element: (
              <PagePlaceholder
                title="Espectadores"
                description="Familiares e acompanhantes vinculados aos corredores."
                icon={UserCheck}
              />
            ),
          },
          {
            path: ROUTES.ADMIN.CRONOMETRAGEM,
            element: (
              <PagePlaceholder
                title="Cronometragem"
                description="Tempos parciais e totais por checkpoint."
                icon={Timer}
              />
            ),
          },
          {
            path: ROUTES.ADMIN.HARDWARE,
            element: (
              <PagePlaceholder
                title="Hardware"
                description="Topologia de leitores RFID, switches e servidores."
                icon={Server}
              />
            ),
          },
          {
            path: ROUTES.ADMIN.CHECKPOINTS,
            element: (
              <PagePlaceholder
                title="Checkpoints"
                description="Configuração de cada ponto de leitura no percurso."
                icon={MapPin}
              />
            ),
          },
          {
            path: ROUTES.ADMIN.RELATORIOS,
            element: (
              <PagePlaceholder
                title="Relatórios"
                description="Exportações e análises pós-prova."
                icon={FileText}
              />
            ),
          },
        ],
      },

      // ---------- CORREDOR (admin também acessa) ----------
      {
        element: (
          <ProtectedRoute allowedPerfis={['corredor', 'administrador']} />
        ),
        children: [
          {
            path: ROUTES.CORREDOR.DESEMPENHO,
            element: (
              <PagePlaceholder
                title="Meu Desempenho"
                description="Pace, tempos por checkpoint e comparação com edições anteriores."
                icon={Activity}
              />
            ),
          },
          {
            path: ROUTES.CORREDOR.FREQUENCIA,
            element: (
              <PagePlaceholder
                title="Minha Frequência"
                description="Histórico de BPM ao longo da prova e alertas de zona crítica."
                icon={HeartPulse}
              />
            ),
          },
          {
            path: ROUTES.CORREDOR.ROTA,
            element: (
              <PagePlaceholder
                title="Minha Rota"
                description="Trajeto no mapa com checkpoints e tempo decorrido em cada trecho."
                icon={Route}
              />
            ),
          },
        ],
      },

      // ---------- ESPECTADOR (todos acessam) ----------
      {
        element: (
          <ProtectedRoute
            allowedPerfis={['espectador', 'corredor', 'administrador']}
          />
        ),
        children: [
          {
            path: ROUTES.ESPECTADOR.RANKING,
            element: (
              <PagePlaceholder
                title="Ranking"
                description="Classificação ao vivo da prova."
                icon={Trophy}
              />
            ),
          },
          {
            path: ROUTES.ESPECTADOR.ACOMPANHAR,
            element: (
              <PagePlaceholder
                title="Acompanhar"
                description="Acompanhe um corredor específico em tempo real."
                icon={Activity}
              />
            ),
          },
          {
            path: ROUTES.ESPECTADOR.MAPA,
            element: (
              <PagePlaceholder
                title="Mapa da Corrida"
                description="Visualização geográfica do percurso e dos checkpoints."
                icon={Map}
              />
            ),
          },
          {
            path: ROUTES.ESPECTADOR.CORREDOR_DETALHE,
            element: (
              <PagePlaceholder
                title="Detalhes do Corredor"
                description="Perfil, parciais e BPM do corredor selecionado."
                icon={Users}
              />
            ),
          },
        ],
      },
    ],
  },

  { path: '*', element: <Navigate to={ROUTES.HOME} replace /> },
])
