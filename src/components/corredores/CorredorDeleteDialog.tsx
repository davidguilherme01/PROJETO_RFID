import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { buttonVariants } from '@/components/ui/button'
import { useCorredoresStore } from '@/store/corredoresStore'
import { cn } from '@/lib/utils'
import type { Corredor } from '@/types'

interface CorredorDeleteDialogProps {
  corredor: Corredor | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CorredorDeleteDialog({
  corredor,
  open,
  onOpenChange,
}: CorredorDeleteDialogProps) {
  const deletar = useCorredoresStore((s) => s.deletar)

  if (!corredor) return null

  const handleConfirm = () => {
    deletar(corredor.id)
    toast.success(`${corredor.nome} foi removido.`)
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <AlertDialogTitle>Remover corredor?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <div className="rounded-lg border border-border bg-card/50 p-3 text-sm">
          <p className="font-medium text-foreground">{corredor.nome}</p>
          <p className="text-xs text-muted-foreground">
            #{corredor.numeroCamisa} · {corredor.cpf} · Tag {corredor.tagRFID}
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={cn(
              buttonVariants({ variant: 'destructive' }),
            )}
          >
            Remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
