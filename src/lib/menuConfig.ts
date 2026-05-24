import {
  Activity,
  Eye,
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
  type LucideIcon,
} from 'lucide-react'
import type { PerfilUsuario } from '@/types'
import { ROUTES } from './constants'

export interface NavItem {
  label: string
  icon: LucideIcon
  path: string
}

export const menuPorPerfil: Record<PerfilUsuario, NavItem[]> = {
  administrador: [
    { label: 'Dashboard', icon: LayoutDashboard, path: ROUTES.ADMIN.DASHBOARD },
    { label: 'Corredores', icon: Users, path: ROUTES.ADMIN.CORREDORES },
    {
      label: 'Espectadores',
      icon: UserCheck,
      path: ROUTES.ADMIN.ESPECTADORES,
    },
    {
      label: 'Cronometragem',
      icon: Timer,
      path: ROUTES.ADMIN.CRONOMETRAGEM,
    },
    { label: 'Hardware', icon: Server, path: ROUTES.ADMIN.HARDWARE },
    { label: 'Checkpoints', icon: MapPin, path: ROUTES.ADMIN.CHECKPOINTS },
    { label: 'Relatórios', icon: FileText, path: ROUTES.ADMIN.RELATORIOS },
  ],
  corredor: [
    {
      label: 'Meu Desempenho',
      icon: Activity,
      path: ROUTES.CORREDOR.DESEMPENHO,
    },
    {
      label: 'Frequência Cardíaca',
      icon: HeartPulse,
      path: ROUTES.CORREDOR.FREQUENCIA,
    },
    { label: 'Minha Rota', icon: Route, path: ROUTES.CORREDOR.ROTA },
    { label: 'Ranking Geral', icon: Trophy, path: ROUTES.ESPECTADOR.RANKING },
  ],
  espectador: [
    { label: 'Ranking', icon: Trophy, path: ROUTES.ESPECTADOR.RANKING },
    { label: 'Acompanhar', icon: Eye, path: ROUTES.ESPECTADOR.ACOMPANHAR },
    { label: 'Mapa da Corrida', icon: Map, path: ROUTES.ESPECTADOR.MAPA },
  ],
}
