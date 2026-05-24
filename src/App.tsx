import { BrowserRouter, Route, Routes } from 'react-router-dom'

function Placeholder() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="rounded-full border border-border bg-card px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
        Base do projeto
      </span>
      <h1 className="text-3xl font-semibold text-foreground">
        Sistema de Gerenciamento de Corrida RFID
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Estrutura inicial pronta. As páginas e componentes de negócio serão
        adicionados nas próximas etapas.
      </p>
      <div className="mt-4 inline-flex h-2 w-24 rounded-full bg-primary/80 shadow-[0_0_24px_4px_hsl(var(--primary)/0.45)]" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Placeholder />} />
      </Routes>
    </BrowserRouter>
  )
}
