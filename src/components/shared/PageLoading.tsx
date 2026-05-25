import { Skeleton } from '@/components/ui/skeleton'

// Fallback genérico para React.Suspense — desenha um esqueleto que parece
// um PageHeader + bloco de conteúdo enquanto o chunk da página carrega.
export function PageLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[320px] rounded-xl" />
    </div>
  )
}
