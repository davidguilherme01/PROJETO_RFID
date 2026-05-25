import { FileText, Timer, UserCheck } from 'lucide-react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { PagePlaceholder } from '@/components/shared/PagePlaceholder'
import { ROUTES } from '@/lib/constants'
import Home from '@/pages/Home'
import CheckpointsPage from '@/pages/admin/Checkpoints'
import CorredoresPage from '@/pages/admin/Corredores'
import DashboardAdminPage from '@/pages/admin/Dashboard'
import HardwarePage from '@/pages/admin/Hardware'
import Login from '@/pages/auth/Login'
import SemAcesso from '@/pages/auth/SemAcesso'
import MeuDesempenhoPage from '@/pages/corredor/MeuDesempenho'
import MinhaFrequenciaPage from '@/pages/corredor/MinhaFrequencia'
import MinhaRotaPage from '@/pages/corredor/MinhaRota'
import AcompanharPage from '@/pages/espectador/Acompanhar'
import CorredorDetalhePage from '@/pages/espectador/CorredorDetalhe'
import MapaPage from '@/pages/espectador/Mapa'
import RankingPage from '@/pages/espectador/Ranking'

// Rotas autenticadas vivem dentro do MainLayout. Apenas Espectadores e
// Administradores acessam tudo de Espectador; Corredor + Admin acessam
// as rotas /corredor/*; só Admin acessa /admin/*.

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
            element: (
              <PagePlaceholder
                title="Cronometragem"
                description="Tempos parciais e totais por checkpoint."
                icon={Timer}
              />
            ),
          },
          { path: ROUTES.ADMIN.HARDWARE, element: <HardwarePage /> },
          { path: ROUTES.ADMIN.CHECKPOINTS, element: <CheckpointsPage /> },
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

  { path: '*', element: <Navigate to={ROUTES.HOME} replace /> },
])
