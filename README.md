# RaceTrack RFID

> Sistema de **monitoramento de corridas com RFID UHF + Bluetooth** — front-end completo em React, multi-perfil, mobile-first nas áreas públicas.

![screenshot](docs/screenshots/dashboard-placeholder.png)
<sub>_Placeholder de screenshot — gere com `npm run dev` e capture as telas principais._</sub>

---

## O que é

Plataforma de visualização e gerenciamento de uma corrida de rua com instrumentação RFID:

- **Antenas UHF (860–960 MHz)** distribuídas em 5 checkpoints leem **tags passivas** costuradas nas camisas dos atletas.
- **Cintas cardíacas Polar/XOSS H10** transmitem BPM via **Bluetooth** para os celulares dos corredores, que repassam por HTTP ao servidor de aplicação.
- Toda a infraestrutura conversa por uma rede ethernet (switch TP-Link 48p + roteador + AP Ubiquiti) com 2 servidores Dell PowerEdge em redundância (Banco + Aplicação).

A app cobre **3 perfis** de usuário:

| Perfil | Acesso | Principais telas |
|---|---|---|
| **Administrador** | Comando central da prova | Dashboard, Corredores (CRUD), Cronometragem, Hardware, Checkpoints, Relatórios |
| **Corredor** | Acessa via QR Code do peito | Meu desempenho, Frequência cardíaca, Minha rota |
| **Espectador** | Acessa via QR Code do material da prova | Ranking ao vivo, Acompanhar corredores favoritos, Mapa, Detalhe público de corredor |

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | **React 19** + **TypeScript** + **Vite 8** |
| Estilo | **TailwindCSS 3** (dark mode `class`) |
| Componentes | **shadcn/ui** (~25 componentes instalados) |
| Roteamento | **React Router DOM 7** com lazy-loading + `errorElement` |
| Estado | **Zustand 5** + middleware `persist` |
| Formulários | **react-hook-form 7** + **zod 4** |
| Gráficos | **Recharts 3** |
| Ícones | **lucide-react** |
| Animações | **framer-motion** + Tailwind keyframes customizados |
| Toasts | **sonner** (via wrapper `notifications.ts`) |
| Datas | **date-fns** com locale `ptBR` |

---

## Arquitetura de rede (ASCII)

```
                              ┌──────────────┐
                              │ Camisa + Tag │
                              │   UHF passi. │
                              └──────┬───────┘
                                     │ 860-960 MHz (UHF)
                                     ▼
                              ┌──────────────┐
                              │  Antena RFID │ × 10
                              │  (Intelbras) │
                              └──────┬───────┘
                                     │ cabo coaxial
                                     ▼
                              ┌──────────────┐
                              │  Leitor RFID │
                              │ YANZEO SR681 │
                              └──────┬───────┘
                                     │ Ethernet TCP/IP
                                     ▼
┌─────────────┐                ┌──────────────┐                 ┌──────────────┐
│  Roteador   │ ───────────── │    Switch    │ ─────────────── │ Access Point │
│ (gateway)   │                │  TP-Link 48p │                 │  Ubiquiti 6  │
└─────────────┘                └──────┬───────┘                 └──────────────┘
                                      │
                          ┌───────────┴───────────┐
                          ▼                       ▼
                ┌──────────────┐         ┌──────────────┐
                │  Servidor 1  │◄───────►│  Servidor 2  │
                │    Banco     │ redund. │  Aplicação   │
                └──────────────┘         └──────┬───────┘
                                                ▲
                                                │ HTTP
                       ┌────────────┐    ┌──────┴───────┐
                       │ Polar H10  │───►│   Celular    │
                       │   cinta    │ BT │  (corredor)  │
                       └────────────┘    └──────────────┘

                              ┌──────┬──────┬──────────┐
   Acessam o Servidor 2:      │  COR │ ADM  │  ESPECT  │
                              └──────┴──────┴──────────┘
```

Diagrama interativo em **`/admin/hardware` → Topologia da rede** (SVG clicável com fluxo de dados animado).

---

## Estrutura de pastas

```
src/
├── App.tsx                        # entrypoint do React (Splash + Router + Toaster)
├── main.tsx
├── router.tsx                     # rotas com lazy + errorElement
├── index.css                      # palette light/dark via CSS vars
├── components/
│   ├── layout/                    # Sidebar, Header, MainLayout, BottomNav, ProtectedRoute, Splash, CommandPalette
│   ├── shared/                    # PageHeader, PagePlaceholder, EmptyState, StatusBadge, BPMDisplay, CorredorCard, UserMenu, PageLoading
│   ├── dashboard/                 # KPIs, gráfico de atividade, top 3, alertas, etc
│   ├── corredores/                # Sheet detalhes + FormDialog + DeleteDialog
│   ├── hardware/                  # Topologia SVG + monitoramento ao vivo das antenas
│   ├── cronometragem/             # 3 tabs (por corredor, por checkpoint, tabela geral)
│   └── ui/                        # 25 componentes shadcn
├── data/
│   ├── index.ts                   # barrel
│   ├── mockCorredores.ts          # 20 atletas
│   ├── mockCronometragem.ts       # tempos derivados de pace
│   ├── mockLeiturasRFID.ts        # leituras espalhadas pelos checkpoints
│   ├── mockFrequencia.ts          # série de BPM por corredor monitorado
│   ├── mockCheckpoints.ts         # 5 pontos (0, 5, 10, 15, 21 km)
│   ├── mockDispositivos.ts        # 6 dispositivos ativos
│   ├── mockEquipamentos.ts        # catálogo financeiro real (11 categorias)
│   ├── mockEspectadores.ts
│   └── mockUsuarios.ts            # 3 usuários demo (1 por perfil)
├── hooks/
│   ├── useRealTimeMetrics.ts      # random walk com pull-to-baseline (BPM/leituras/velocidade)
│   ├── useRankingLive.ts          # ranking + swap aleatório vizinho
│   ├── useLeiturasRecentes.ts     # nova leitura a cada 3-7s
│   ├── useAlertasCardiacos.ts
│   ├── useFavoritos.ts            # persisted
│   ├── useDebounce.ts
│   └── useKonamiCode.ts
├── lib/
│   ├── constants.ts               # APP_NAME, PERFIS, ROUTES, STORAGE_KEYS, FAIXA_BPM_SEGURA
│   ├── menuConfig.ts              # menu dinâmico por perfil
│   ├── race.ts                    # T0 da prova (consumido pelo cronômetro)
│   ├── notifications.ts           # wrapper sonner com defaults do projeto
│   └── utils.ts                   # cn()
├── pages/
│   ├── Home.tsx                   # redirect inteligente por perfil
│   ├── NotFound.tsx               # 404 estilizado
│   ├── Erro.tsx                   # capturado por errorElement
│   ├── auth/                      # Login (split-screen) + SemAcesso (403)
│   ├── admin/                     # 7 telas administrativas
│   ├── corredor/                  # 3 telas do atleta
│   └── espectador/                # 4 telas públicas
├── store/
│   ├── authStore.ts               # login mockado + 3 perfis demo
│   ├── themeStore.ts              # dark/light com persist
│   ├── corredoresStore.ts         # CRUD + filtros + seleção
│   └── dispositivosStore.ts
└── types/
    └── index.ts
```

---

## Pré-requisitos

- Node.js **≥ 20.19** (testado em 22 LTS)
- npm **≥ 10**

## Instalação

```bash
git clone https://github.com/davidguilherme01/PROJETO_RFID.git
cd PROJETO_RFID
npm install
cp .env.example .env       # opcional — app roda 100% com mocks
npm run dev
```

Abra <http://localhost:5173>. Você cairá no `/login`.

## Scripts

```bash
npm run dev       # Vite dev server (HMR)
npm run build     # tsc -b && vite build
npm run preview   # serve o build de produção
npm run lint      # ESLint
```

---

## Credenciais de demo

A autenticação é **mockada** — qualquer senha funciona para os 3 emails abaixo. Há também 3 **botões de demo** na tela de login que entram direto.

| Perfil | Email | Quem é | Para onde redireciona |
|---|---|---|---|
| Administrador | `admin@racetrack.com` | Carlos Mendes | `/admin/dashboard` |
| Corredor | `corredor@racetrack.com` | Thiago Macedo Cavalcanti (#999, 17 km percorridos) | `/corredor/meu-desempenho` |
| Espectador | `espectador@racetrack.com` | Roberto Almeida | `/espectador/ranking` |

A sessão persiste no `localStorage` (chave `racetrack:auth`).

---

## Screenshots por perfil

| Admin · Dashboard | Admin · Hardware | Admin · Cronometragem |
|---|---|---|
| ![](docs/screenshots/admin-dashboard.png) | ![](docs/screenshots/admin-hardware.png) | ![](docs/screenshots/admin-crono.png) |

| Corredor · Desempenho | Espectador · Ranking | Espectador · Mapa |
|---|---|---|
| ![](docs/screenshots/corredor-desempenho.png) | ![](docs/screenshots/espectador-ranking.png) | ![](docs/screenshots/espectador-mapa.png) |

<sub>_Placeholders — substituir por capturas reais após primeiro `npm run dev`._</sub>

---

## Tabela de custos dos equipamentos

Catálogo real do briefing, exibido também em `/admin/hardware`.

| Categoria | Modelo | Qtd | Valor unit. | Valor total |
|---|---|---:|---:|---:|
| Antena RFID | Intelbras UHF | 10 | R$ 6.583,00 | R$ 65.830,00 |
| Tag RFID | UHF EPC Gen2 | 200 | R$ 97,96 | R$ 19.592,00 |
| Servidor | Dell PowerEdge | 2 | R$ 17.183,00 | R$ 34.366,00 |
| Rack | Padrão 19" 24U | 1 | R$ 2.564,38 | R$ 2.564,38 |
| Access Point | Ubiquiti WiFi 6 | 1 | R$ 1.299,00 | R$ 1.299,00 |
| Roteador | Enterprise | 1 | R$ 8.365,26 | R$ 8.365,26 |
| Switch | TP-Link 48p | 1 | R$ 1.662,00 | R$ 1.662,00 |
| Leitor RFID | YANZEO SR681 | 1 | R$ 2.042,08 | R$ 2.042,08 |
| Monitor | Acer 23.8" | 2 | R$ 629,81 | R$ 1.259,62 |
| Camisa RFID | Personalizada | 200 | R$ 49,99 | R$ 9.998,00 |
| Cinta Cardíaca | XOSS H10 | 200 | R$ 179,99 | R$ 35.998,00 |
| **TOTAL** | | | | **R$ 182.976,34** |

> O somatório real bate em **R$ 182.976,34** com os preços acima. O briefing original mencionava **R$ 174.976,34** — há R$ 8.000 de divergência (provavelmente erro de transcrição em um dos unitários). O app sempre mostra o total dinâmico.

---

## Easter eggs

- **Splash de boas-vindas** — primeira visita por sessão (1.6s, com pulse do logo).
- **Login com "admin" no email** — o gradient do hero esquerdo intensifica.
- **Cmd/Ctrl+K em qualquer página** — Command Palette com navegação + ações rápidas.
- **Konami code no dashboard admin** (↑↑↓↓←→←→BA) — desbloqueia "modo demo" (toast por enquanto).

---

## Próximos passos / Roadmap

Veja [NEXT_STEPS.md](./NEXT_STEPS.md) para o detalhamento. Resumo:

- [ ] Integração com backend real (REST + WebSocket)
- [ ] PWA + offline-first (corredor sem sinal)
- [ ] Web Bluetooth API para Polar H10 direto no navegador
- [ ] Geração real de PDF (`jsPDF` ou `react-pdf`)
- [ ] Notificações push para espectadores
- [ ] i18n (pt-BR + en + es)
- [ ] Testes (Vitest + Testing Library + Playwright)
- [ ] Deploy (Vercel ou Cloudflare Pages)

---

## Histórico de versões

Veja [CHANGELOG.md](./CHANGELOG.md). Última versão: **v0.8.0** (cronometragem, relatórios e polimento final).

## Arquitetura detalhada

Veja [ARCHITECTURE.md](./ARCHITECTURE.md) para a divisão em camadas (hardware/rede/software), fluxo de dados e protocolos.

---

Projeto acadêmico — IA / IoT · 2026.
