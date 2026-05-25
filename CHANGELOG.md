# Changelog

Notação semântica `vMAJOR.MINOR.PATCH`. Cada minor abaixo equivale a uma "etapa" do trabalho.

## v0.8.0 — Cronometragem, relatórios e polimento

- `/admin/cronometragem` com 3 tabs (por corredor, por checkpoint, tabela geral colorida + export CSV).
- `/admin/relatorios` com 6 cards e modal de pré-visualização (mock de PDF).
- `NotFound.tsx` (404 estilizado) e `Erro.tsx` (capturado por `errorElement` do router).
- Lazy loading + Suspense em todas as páginas pesadas. Bundle inicial cai significativamente.
- Wrapper `lib/notifications.ts` em torno do sonner com defaults do projeto.
- Splash screen (1.6s, sessionStorage) no primeiro load.
- Easter eggs: Konami no Dashboard, glow do hero do Login ao digitar "admin".
- `.env.example` versionado, `.env*.local` no `.gitignore`.
- Documentação reescrita: README, ARCHITECTURE.md, CHANGELOG.md, NEXT_STEPS.md.

## v0.7.0 — Telas mobile-first do corredor e do espectador

- Corredor: Meu Desempenho, Minha Frequência (gráfico grande com ReferenceArea/Line/Dot), Minha Rota (SVG senoidal com pulso na posição).
- Espectador: Ranking (pódio + lista com animação de variação), Acompanhar (favoritos + busca em modal), CorredorDetalhe (visão pública), Mapa (SVG com pontos).
- Componentes compartilhados: `BPMDisplay` (heartbeat acelera com BPM), `CorredorCard`, `BottomNav`, `useFavoritos` (persisted).
- Bottom nav substitui sidebar para corredor/espectador no mobile.
- Demo `u-corredor` migrado para COR-018 (em prova e monitorado).

## v0.6.0 — Gestão de corredores e hardware

- `/admin/corredores` com tabela ordenável + paginada (15/pág), filtros com debounce, bulk delete, export CSV, Sheet de detalhes (4 tabs), Dialog de criação/edição com react-hook-form + zod.
- `/admin/hardware` com 4 KPIs, topologia SVG interativa (13 nodes, fluxo animado, redundância tracejada), tabela do catálogo financeiro (11 categorias), monitoramento ao vivo de 10 antenas.
- `/admin/checkpoints` com 5 cards e timeline das últimas 10 passagens.
- `data/mockEquipamentos.ts` com catálogo real do briefing.
- `corredoresStore` (CRUD + filtros) e `dispositivosStore` (seleção).
- `useDebounce`.

## v0.5.0 — Dashboard do administrador

- `/admin/dashboard` em 5 linhas: 4 KPIs + gráfico tabbed + status dos equipamentos + pódio top 3 + últimas leituras + distribuição no percurso + alertas cardíacos.
- 4 hooks ao vivo: `useRealTimeMetrics`, `useLeiturasRecentes`, `useRankingLive`, `useAlertasCardiacos`.
- Animação de entrada escalonada via framer-motion.
- Skeleton inicial de 600ms.

## v0.4.0 — Layout base

- `MainLayout` orquestrando Sidebar colapsável + Header sticky + Outlet com fade-in por rota.
- Sidebar: logo customizado (SVG), badge por perfil (azul/verde/roxo), menu dinâmico via `menuConfig`, footer com user dropdown e indicador "AO VIVO".
- Header: breadcrumb, pílula "PROVA EM ANDAMENTO" com cronômetro, busca Cmd+K, bell, theme toggle dark/light, avatar.
- Theme system completo (paleta light/dark via CSS vars, bootstrap anti-FOUC em `index.html`, `themeStore` com persist).
- Shared: `PageHeader`, `PagePlaceholder` (refatorado), `StatusBadge` (5 tons), `EmptyState`, `UserMenu` reutilizado.
- Command Palette via cmdk com atalho global Ctrl/Cmd+K.

## v0.3.0 — Autenticação e roteamento

- `authStore` Zustand persisted com 3 perfis demo (admin, corredor, espectador).
- `ProtectedRoute` por perfil, `Home` redirector, `Login` split-screen com 3 botões de demo, `SemAcesso` (403).
- `mockUsuarios.ts` com email demo + corredorId vinculado a um Corredor real.
- 16 componentes shadcn instalados (input, label, card, dialog, table, tabs, select, tooltip, skeleton, sonner, form, checkbox, switch, alert, command, alert-dialog).
- `date-fns` adicionado.

## v0.2.0 — Modelo de dados e mocks

- `src/types/index.ts` com 9 interfaces de domínio (Corredor, Espectador, TagRFID, LeituraRFID, Checkpoint, FrequenciaCardiaca, Cronometragem, DispositivoHardware, RankingItem).
- 7 arquivos mock em `src/data/` coerentes entre si (20 corredores, 5 checkpoints, 50 leituras, 76 cronometragens, 150 amostras de BPM).
- Cronometragem é gerada a partir de paces por corredor; leituras derivam dela.

## v0.1.0 — Setup inicial e identidade

- Vite + React 19 + TypeScript.
- TailwindCSS 3 dark-mode.
- shadcn/ui configurado (`components.json`, alias `@/*`).
- React Router, Zustand, Lucide, Recharts.
- Estrutura de pastas, primeira árvore, README inicial.
