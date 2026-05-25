# Próximos passos

Sugestões organizadas por prioridade para evoluir o RaceTrack RFID além do MVP atual.

---

## 🥇 Caminho crítico: backend real

### 1. API REST

Estrutura sugerida (NestJS, FastAPI ou Express + Prisma):

```
POST   /auth/login                  → { email, senha }            → { token, usuario }
GET    /auth/me                                                    → Usuario

GET    /corredores                  ?status&categoria&q&page       → { items: Corredor[], total }
POST   /corredores                                                  → Corredor
GET    /corredores/:id                                              → Corredor
PUT    /corredores/:id                                              → Corredor
DELETE /corredores/:id

GET    /leituras                    ?checkpoint&since              → LeituraRFID[]
GET    /leituras/recentes           ?limit=50                      → LeituraRFID[]

GET    /cronometragem               ?corredorId&checkpoint         → Cronometragem[]
GET    /cronometragem/ranking                                       → RankingItem[]

GET    /frequencia/:corredorId      ?from&to                       → FrequenciaCardiaca[]
GET    /alertas/cardiacos           ?resolved=false                → AlertaCardiaco[]
POST   /alertas/cardiacos/:id/resolver

GET    /checkpoints                                                 → Checkpoint[]
GET    /dispositivos                                                → DispositivoHardware[]
GET    /equipamentos                                                → ItemEquipamento[]
```

Cada endpoint mapeia para um mock atual. Trocar o mock por `fetch()` mexe apenas nos hooks `hooks/use*.ts` — telas continuam intocadas.

### 2. WebSocket para tempo real

Substituir `setInterval` dos hooks atuais por eventos pushados. Canais sugeridos:

- `leituras.novo` — leitura RFID ao entrar na fila do leitor
- `ranking.atualizado` — quando posição de qualquer um muda
- `bpm.alerta` — disparo de alerta cardíaco
- `dispositivo.status` — antena cai / volta

Stack sugerida: **Socket.IO** ou **ws nativo** atrás de `wss://`. Em produção, considere **MQTT** se a latência dos leitores for crítica.

### 3. Web Bluetooth para Polar H10

Implementar coleta direta de BPM **no celular do atleta** via [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API). Service UUID do Polar H10: `0x180D` (Heart Rate). Característica: `0x2A37`. Funciona em Chrome/Edge Android — não no iOS Safari (limitação da plataforma).

```ts
const device = await navigator.bluetooth.requestDevice({
  filters: [{ services: ['heart_rate'] }],
})
const server = await device.gatt.connect()
const service = await server.getPrimaryService('heart_rate')
const char = await service.getCharacteristic('heart_rate_measurement')
await char.startNotifications()
char.addEventListener('characteristicvaluechanged', (e) => {
  const value = (e.target as BluetoothRemoteGATTCharacteristic).value
  const bpm = value.getUint8(1)
  // POST para o backend
})
```

---

## 🥈 Qualidade e experiência

### 4. PWA + offline-first

Vital para o perfil corredor — o atleta passa por áreas com sinal ruim no percurso.

- `vite-plugin-pwa` para gerar `manifest.json` + Service Worker.
- **Strategy `NetworkFirst` com fallback cache** para `/api/cronometragem`, `/api/ranking`.
- **Strategy `StaleWhileRevalidate`** para assets estáticos.
- IndexedDB para enfileirar POSTs de BPM quando offline e reenviar quando voltar.
- Botão "Instalar app" no perfil corredor.

### 5. Notificações push

Espectador habilita push e recebe quando o corredor que acompanha cruza um checkpoint ou entra em zona de alerta cardíaco.

- Web Push API + VAPID keys.
- Backend dispara via `web-push` (Node).
- Permissão pedida só depois da primeira interação significativa, nunca ao carregar a página.

### 6. Geração real de PDF

Os relatórios atuais mostram apenas pré-visualização. Para geração real:

- **`@react-pdf/renderer`** se quiser componentes React → PDF (mais flexível, ~150KB).
- **`jsPDF` + `jspdf-autotable`** se quiser dar render no cliente sem dependência pesada (~80KB).
- **Servidor**: gere com Puppeteer/Playwright (mais fiel ao HTML/CSS).

### 7. Internacionalização (i18n)

`react-i18next` ou `react-aria` para `pt-BR / en / es`. Datas via `date-fns` já vem com locales; cores e ícones são neutras.

---

## 🥉 Robustez

### 8. Testes automatizados

Stack sugerida — toda em ESM, plug-and-play com Vite:

- **Vitest** + **@testing-library/react** para componentes/hooks.
- **MSW** (Mock Service Worker) para interceptar fetches em testes de integração.
- **Playwright** para E2E (login → CRUD → logout em cada perfil).

Cobertura mínima recomendada:
- `corredoresStore` (CRUD, filtros, ordenação)
- `useRankingLive` (swap aleatório respeita posições)
- `Login` → fluxo dos 3 botões demo
- `Corredores` → criar/editar/deletar
- `ProtectedRoute` → redirect por perfil

### 9. Virtualização

Quando `leituras` passar de ~100 itens visíveis na tabela, usar **TanStack Virtual** (`@tanstack/react-virtual`). Aplica em:
- `/admin/corredores` (se a base subir de 20 → 200)
- `/admin/cronometragem` → Tabela Geral

### 10. Observabilidade

- **Sentry** (`@sentry/react`) para erros em produção. Já temos `errorElement` capturando — só precisa instrumentar.
- **PostHog** ou **Plausible** para analytics simples (página, evento, perfil ativo).
- **Web Vitals** via `web-vitals` lib enviando para o backend.

---

## 🚀 Deploy

| Plataforma | Por que | Custo |
|---|---|---|
| **Vercel** | Zero-config para Vite, edge functions se precisar de backend leve | gratuito |
| **Cloudflare Pages** | Edge global rápido + R2 storage barato pras tags/PDFs | gratuito |
| **Netlify** | Forms grátis (útil pro contato de inscrição) | gratuito |
| **Railway / Render** | Quando juntar API + Postgres no mesmo lugar | ~US$ 5/mês |

CI sugerido: GitHub Actions com `npm ci && npm run build && npm test` em cada PR, deploy automático no main.

---

## 🎓 Bom de aprender / pesquisar

- **Antenas circulares vs lineares** — afeta taxa de leitura quando atleta passa em ângulos variados.
- **EPC Gen2 Memory Bank** — onde guardar nº de camisa direto na tag (evita lookup no banco a cada leitura).
- **MQTT vs WebSocket** — MQTT é mais comum em IoT industrial, WebSocket é nativo no browser.
- **Bluetooth GATT profiles** — Heart Rate Service (`0x180D`) é padrão, vale entender o protocolo.
- **HSL color space** — usar `hsl(var(--primary) / 0.4)` permite opacidade controlada sem inventar tokens novos.

---

## TL;DR

| Quando você quiser… | Trabalho relativo |
|---|---:|
| API real + WebSocket | médio |
| PWA + offline | médio |
| Web Bluetooth | pequeno (~1 dia) |
| Push notifications | pequeno |
| PDF de verdade | pequeno |
| i18n | médio |
| Testes (cobertura básica) | médio |
| Virtualização | pequeno |
| Deploy Vercel | trivial (~30min) |
