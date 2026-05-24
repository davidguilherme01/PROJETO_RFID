# RFID Race Manager

Aplicação web para um **Sistema de Gerenciamento de Corrida com RFID**.

Este repositório contém apenas a **base do projeto** — configurações, estrutura
de pastas e tema visual. As páginas e componentes de negócio serão adicionados
nas próximas etapas.

## Stack

- **Vite** + **React 19** + **TypeScript**
- **TailwindCSS** (dark mode habilitado por padrão)
- **shadcn/ui** (configurado, pronto para `npx shadcn@latest add <componente>`)
- **React Router DOM** (roteamento)
- **Lucide React** (ícones)
- **Recharts** (gráficos)
- **Zustand** (gerenciamento de estado)

## Paleta (dark theme)

| Token            | Cor        |
| ---------------- | ---------- |
| Background       | `#0a0a0a`  |
| Card             | `#1a1a1a`  |
| Border           | `#2a2a2a`  |
| Accent / Primary | `#22c55e`  |
| Foreground       | `#fafafa`  |
| Muted foreground | `#a1a1aa`  |

As cores são expostas como CSS variables em [src/index.css](src/index.css) e
mapeadas para utilitários Tailwind (`bg-background`, `text-foreground`,
`border-border`, `bg-primary`, etc.).

## Pré-requisitos

- Node.js **≥ 20.19** (recomendado: 22 LTS)
- npm **≥ 10**

## Instalação

```bash
npm install
```

## Scripts

```bash
npm run dev       # inicia o servidor de desenvolvimento (Vite)
npm run build     # type-check + build de produção
npm run preview   # serve o build de produção localmente
npm run lint      # roda o ESLint
```

Após `npm run dev`, abra <http://localhost:5173>.

## Estrutura de pastas

```
src/
├── components/
│   ├── ui/         # componentes do shadcn/ui
│   ├── layout/     # Sidebar, Header, layouts de página
│   └── shared/     # componentes reutilizáveis de negócio
├── pages/          # uma página por rota
├── hooks/          # custom hooks
├── data/           # dados mock
├── types/          # interfaces / tipos TypeScript
├── lib/            # utilitários (cn, helpers, etc.)
├── store/          # stores Zustand
├── App.tsx         # rotas raiz (BrowserRouter)
├── main.tsx        # entrypoint
└── index.css       # Tailwind + variáveis de tema
```

O alias `@/` aponta para `src/`, configurado em
[vite.config.ts](vite.config.ts) e [tsconfig.app.json](tsconfig.app.json).

## Adicionando componentes do shadcn/ui

A configuração do shadcn já está pronta em [components.json](components.json).
Para incluir um componente:

```bash
npx shadcn@latest add button
npx shadcn@latest add card dialog input
```

Os componentes serão criados em `src/components/ui/`.
