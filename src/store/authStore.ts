import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockUsuarios } from '@/data'
import { STORAGE_KEYS } from '@/lib/constants'
import type { PerfilUsuario, Usuario } from '@/types'

interface AuthState {
  usuario: Usuario | null
  isAuthenticated: boolean
  // Mock: aceita qualquer senha para os emails de demo.
  // Retorna true se o email bate com algum usuário; false caso contrário.
  login: (email: string, senha: string) => boolean
  loginDemo: (perfil: PerfilUsuario) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      isAuthenticated: false,

      login: (email, _senha) => {
        const usuario = mockUsuarios.find(
          (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
        )
        if (usuario) {
          set({ usuario, isAuthenticated: true })
          return true
        }
        return false
      },

      loginDemo: (perfil) => {
        const usuario = mockUsuarios.find((u) => u.perfil === perfil)
        if (usuario) {
          set({ usuario, isAuthenticated: true })
        }
      },

      logout: () => set({ usuario: null, isAuthenticated: false }),
    }),
    { name: STORAGE_KEYS.AUTH },
  ),
)
