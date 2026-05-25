import { toast, type ExternalToast } from 'sonner'

// Wrapper centralizado em torno do sonner — define defaults do projeto
// (duração, ícones, position) e expõe helpers semânticos. Use em vez de
// chamar `toast` direto para manter consistência visual.

const DEFAULT_DURATION = 4000

export const notify = {
  success(msg: string, opts?: ExternalToast) {
    return toast.success(msg, { duration: DEFAULT_DURATION, ...opts })
  },

  error(msg: string, opts?: ExternalToast) {
    return toast.error(msg, { duration: DEFAULT_DURATION + 2000, ...opts })
  },

  info(msg: string, opts?: ExternalToast) {
    return toast.info(msg, { duration: DEFAULT_DURATION, ...opts })
  },

  warning(msg: string, opts?: ExternalToast) {
    return toast.warning(msg, { duration: DEFAULT_DURATION + 1000, ...opts })
  },

  loading(msg: string, opts?: ExternalToast) {
    return toast.loading(msg, opts)
  },

  // Notificação persistente — não desaparece sozinha.
  // Use para alertas que exigem ação humana (ex.: BPM crítico).
  alertaCritico(
    titulo: string,
    descricao?: string,
    onAcao?: { label: string; handler: () => void },
  ) {
    return toast.error(titulo, {
      description: descricao,
      duration: Infinity,
      action: onAcao
        ? { label: onAcao.label, onClick: onAcao.handler }
        : undefined,
    })
  },

  promise<T>(
    p: Promise<T>,
    msgs: { loading: string; success: string; error: string },
  ) {
    return toast.promise(p, msgs)
  },

  dismiss(id?: string | number) {
    toast.dismiss(id)
  },
}

// Re-export do `toast` original para casos avançados que precisem da API
// completa do sonner.
export { toast }
