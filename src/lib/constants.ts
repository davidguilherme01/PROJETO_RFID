export const APP_NAME = 'RaceTrack RFID'
export const APP_TAGLINE = 'Monitoramento inteligente de corridas'

export const STORAGE_KEYS = {
  AUTH: 'racetrack:auth',
  THEME: 'racetrack:theme',
  FAVORITOS: 'racetrack:favoritos',
} as const

// Valores dos perfis. O tipo `PerfilUsuario` mora em `@/types`
// para evitar duplicação — importadores que precisam do tipo pegam de lá.
export const PERFIS = {
  ADMINISTRADOR: 'administrador',
  CORREDOR: 'corredor',
  ESPECTADOR: 'espectador',
} as const

export const ROUTES = {
  LOGIN: '/login',
  SEM_ACESSO: '/sem-acesso',
  HOME: '/',

  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    CORREDORES: '/admin/corredores',
    ESPECTADORES: '/admin/espectadores',
    CRONOMETRAGEM: '/admin/cronometragem',
    HARDWARE: '/admin/hardware',
    CHECKPOINTS: '/admin/checkpoints',
    RELATORIOS: '/admin/relatorios',
  },

  CORREDOR: {
    DESEMPENHO: '/corredor/meu-desempenho',
    FREQUENCIA: '/corredor/minha-frequencia',
    ROTA: '/corredor/minha-rota',
  },

  ESPECTADOR: {
    RANKING: '/espectador/ranking',
    ACOMPANHAR: '/espectador/acompanhar',
    MAPA: '/espectador/mapa',
    CORREDOR_DETALHE: '/espectador/corredor/:id',
  },
} as const

export const FAIXA_BPM_SEGURA = { min: 100, max: 180 }
