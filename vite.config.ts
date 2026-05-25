import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
//
// `base` é condicional: em dev fica '/' para a URL não ficar prefixada;
// no build de produção usa '/PROJETO_RFID/' pra casar com o GitHub Pages
// (deploy em https://davidguilherme01.github.io/PROJETO_RFID/).
// Se trocar de host (ex.: Vercel raiz), retornar '/' no command 'build' também.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/PROJETO_RFID/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}))
