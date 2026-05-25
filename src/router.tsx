import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { ROUTES } from '@/lib/constants'
import Erro from '@/pages/Erro'
import Home from '@/pages/Home'
import Login from '@/pages/auth/Login'
import SemAcesso from '@/pages/auth/SemAcesso'
import NotFound from '@/pages/NotFound'

// Páginas pesadas (gráficos, formulários, tabelas grandes) viram chunks
// separados. As pequenas (Home/Login/SemAcesso/NotFound/Erro) ficam eager
// para evitar overhead na primeira pintura crítica.
const DashboardAdminPage = lazy(() => import('@/pages/admin/Dashboard'))
const CorredoresPage = lazy(() => import('@/pages/admin/Corredores'))
const CronometragemPage = lazy(() => import('@/pages/admin/Cronometragem'))
const HardwarePage = lazy(() => import('@/pages/admin/Hardware'))
const CheckpointsPage = lazy(() => import('@/pages/admin/Checkpoints'))
const RelatoriosPage = lazy(() => import('@/pages/admin/Relatorios'))
const MeuDesempenhoPage = lazy(() => import('@/pages/corredor/MeuDesempenho'))
const MinhaFrequenciaPage = lazy(
  () => import('@/pages/corredor/MinhaFrequencia'),
)
const MinhaRotaPage = lazy(() => import('@/pages/corredor/MinhaRota'))
const RankingPage = lazy(() => import('@/pages/espectador/Ranking'))
const AcompanharPage = lazy(() => import('@/pages/espectador/Acompanhar'))
const MapaPage = lazy(() => import('@/pages/espectador/Mapa'))
const CorredorDetalhePage = lazy(
  () => import('@/pages/espectador/CorredorDetalhe'),
)

// Placeholder leve para rotas admin ainda sem página dedicada.
import { PagePlaceholder } from '@/components/shared/PagePlaceholder'
import { UserCheck } from 'lucide-react'

// basename = base do Vite sem barra final. Em dev BASE_URL='/' → ''.
// Em prod no GH Pages BASE_URL='/PROJETO_RFID/' → '/PROJETO_RFID'.
// React Router prefixa todos os `to="/foo"` com esse basename automaticamente.
const ROUTER_BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

export const router = createBrowserRouter(
  [
  { path: ROUTES.HOME, element: <Home />, errorElement: <Erro /> },
  { path: ROUTES.LOGIN, element: <Login />, errorElement: <Erro /> },
  { path: ROUTES.SEM_ACESSO, element: <SemAcesso />, errorElement: <Erro /> },

  {
    element: <MainLayout />,
    errorElement: <Erro />,
    children: [
      // ---------- ADMINISTRADOR ----------
      {
        element: <ProtectedRoute allowedPerfis={['administrador']} />,
        children: [
          { path: ROUTES.ADMIN.DASHBOARD, element: <DashboardAdminPage /> },
          { path: ROUTES.ADMIN.CORREDORES, element: <CorredoresPage /> },
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
            element: <CronometragemPage />,
          },
          { path: ROUTES.ADMIN.HARDWARE, element: <HardwarePage /> },
          { path: ROUTES.ADMIN.CHECKPOINTS, element: <CheckpointsPage /> },
          { path: ROUTES.ADMIN.RELATORIOS, element: <RelatoriosPage /> },
        ],
      },

      // ---------- CORREDOR (admin também acessa) ----------
      {
        element: (
          <ProtectedRoute allowedPerfis={['corredor', 'administrador']} />
        ),
        children: [
          { path: ROUTES.CORREDOR.DESEMPENHO, element: <MeuDesempenhoPage /> },
          {
            path: ROUTES.CORREDOR.FREQUENCIA,
            element: <MinhaFrequenciaPage />,
          },
          { path: ROUTES.CORREDOR.ROTA, element: <MinhaRotaPage /> },
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
          { path: ROUTES.ESPECTADOR.RANKING, element: <RankingPage /> },
          { path: ROUTES.ESPECTADOR.ACOMPANHAR, element: <AcompanharPage /> },
          { path: ROUTES.ESPECTADOR.MAPA, element: <MapaPage /> },
          {
            path: ROUTES.ESPECTADOR.CORREDOR_DETALHE,
            element: <CorredorDetalhePage />,
          },
        ],
      },
    ],
  },

    // Catch-all 404 — fora do MainLayout para ter sua própria identidade.
    { path: '*', element: <NotFound /> },
  ],
  { basename: ROUTER_BASENAME === '/' ? undefined : ROUTER_BASENAME },
)
