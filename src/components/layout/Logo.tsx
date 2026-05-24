import { cn } from '@/lib/utils'

// Logo customizado: ondas RFID concêntricas + check no canto inferior direito.
// Tudo em currentColor para herdar a cor do contexto (text-primary, etc).
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn('h-5 w-5', className)}
    >
      <path d="M3 11.5a9 9 0 0 1 9-9" />
      <path d="M6.5 11.5a5.5 5.5 0 0 1 5.5-5.5" />
      <circle cx="12" cy="11.5" r="1.4" fill="currentColor" stroke="none" />
      <path d="M13.5 18.5l2.2 2.2 5-5" />
    </svg>
  )
}
