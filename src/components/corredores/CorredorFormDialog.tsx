import { zodResolver } from '@hookform/resolvers/zod'
import { Sparkles } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCorredoresStore } from '@/store/corredoresStore'
import type { CategoriaCorredor, Corredor } from '@/types'

const categorias: CategoriaCorredor[] = [
  'M Geral',
  'M 30-39',
  'M 40-49',
  'M 50+',
  'F Geral',
  'F 30-39',
  'F 40-49',
  'F 50+',
]

const cintasDisponiveis = [
  { id: 'CIN-H10-001', label: 'XOSS H10 #001 (disponível)' },
  { id: 'CIN-H10-014', label: 'XOSS H10 #014 (disponível)' },
  { id: 'CIN-H10-027', label: 'XOSS H10 #027 (disponível)' },
  { id: 'CIN-H10-052', label: 'XOSS H10 #052 (disponível)' },
  { id: 'CIN-H10-088', label: 'XOSS H10 #088 (disponível)' },
]

// Máscara CPF: aceita só dígitos e formata XXX.XXX.XXX-XX.
function aplicarMascaraCpf(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11)
  const p1 = d.slice(0, 3)
  const p2 = d.slice(3, 6)
  const p3 = d.slice(6, 9)
  const p4 = d.slice(9, 11)
  if (d.length > 9) return `${p1}.${p2}.${p3}-${p4}`
  if (d.length > 6) return `${p1}.${p2}.${p3}`
  if (d.length > 3) return `${p1}.${p2}`
  return p1
}

function aplicarMascaraTelefone(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function gerarTagAleatoria(): string {
  const n = String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')
  return `TAG-${n}`
}

const corredorSchema = z.object({
  nome: z.string().min(3, 'Nome muito curto (mín. 3 caracteres)'),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'Formato esperado: XXX.XXX.XXX-XX'),
  email: z.string().email('Email inválido').or(z.literal('')).optional(),
  telefone: z.string().min(8, 'Telefone incompleto').or(z.literal('')).optional(),
  idade: z.coerce
    .number({ message: 'Idade inválida' })
    .int()
    .min(14, 'Idade mínima: 14 anos')
    .max(99),
  sexo: z.enum(['M', 'F', 'O']).optional(),
  categoria: z.enum([
    'M Geral',
    'M 30-39',
    'M 40-49',
    'M 50+',
    'F Geral',
    'F 30-39',
    'F 40-49',
    'F 50+',
  ]),
  numeroCamisa: z.coerce
    .number({ message: 'Número inválido' })
    .int()
    .min(1)
    .max(9999),
  tagRFID: z.string().min(3, 'Tag RFID obrigatória'),
  cintaCardiacaId: z.string().optional(),
  emergenciaNome: z.string().optional(),
  emergenciaTelefone: z.string().optional(),
  emergenciaParentesco: z.string().optional(),
})

// Input = forma do que o formulário renderiza (idade/numeroCamisa podem
// vir como string do <input>). Output = depois do parse pelo zod (number).
type CorredorFormInput = z.input<typeof corredorSchema>
type CorredorFormOutput = z.output<typeof corredorSchema>

interface CorredorFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  corredorParaEditar?: Corredor | null
}

function nextId(): string {
  return `COR-${Date.now().toString().slice(-6)}`
}

export function CorredorFormDialog({
  open,
  onOpenChange,
  corredorParaEditar,
}: CorredorFormDialogProps) {
  const adicionar = useCorredoresStore((s) => s.adicionar)
  const atualizar = useCorredoresStore((s) => s.atualizar)
  const editando = !!corredorParaEditar

  const form = useForm<CorredorFormInput, undefined, CorredorFormOutput>({
    resolver: zodResolver(corredorSchema),
    defaultValues: {
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
      idade: 18,
      sexo: 'M',
      categoria: 'M Geral',
      numeroCamisa: 100,
      tagRFID: '',
      cintaCardiacaId: '',
      emergenciaNome: '',
      emergenciaTelefone: '',
      emergenciaParentesco: '',
    },
  })

  // Sincroniza form quando o corredor para editar muda (ou abre pra novo).
  useEffect(() => {
    if (!open) return
    if (corredorParaEditar) {
      form.reset({
        nome: corredorParaEditar.nome,
        cpf: corredorParaEditar.cpf,
        email: corredorParaEditar.email ?? '',
        telefone: corredorParaEditar.telefone ?? '',
        idade: corredorParaEditar.idade,
        sexo: corredorParaEditar.sexo ?? 'M',
        categoria: corredorParaEditar.categoria,
        numeroCamisa: corredorParaEditar.numeroCamisa,
        tagRFID: corredorParaEditar.tagRFID,
        cintaCardiacaId: corredorParaEditar.cintaCardiacaId ?? '',
        emergenciaNome: corredorParaEditar.contatoEmergencia?.nome ?? '',
        emergenciaTelefone:
          corredorParaEditar.contatoEmergencia?.telefone ?? '',
        emergenciaParentesco:
          corredorParaEditar.contatoEmergencia?.parentesco ?? '',
      })
    } else {
      form.reset({
        nome: '',
        cpf: '',
        email: '',
        telefone: '',
        idade: 18,
        sexo: 'M',
        categoria: 'M Geral',
        numeroCamisa: 100,
        tagRFID: gerarTagAleatoria(),
        cintaCardiacaId: '',
        emergenciaNome: '',
        emergenciaTelefone: '',
        emergenciaParentesco: '',
      })
    }
  }, [open, corredorParaEditar, form])

  const onSubmit = (data: CorredorFormOutput) => {
    const corredor: Corredor = {
      id: corredorParaEditar?.id ?? nextId(),
      nome: data.nome.trim(),
      cpf: data.cpf,
      idade: data.idade,
      numeroCamisa: data.numeroCamisa,
      tagRFID: data.tagRFID.trim(),
      categoria: data.categoria,
      status: corredorParaEditar?.status ?? 'ativo',
      dataInscricao:
        corredorParaEditar?.dataInscricao ?? new Date().toISOString(),
      foto: corredorParaEditar?.foto,
      email: data.email || undefined,
      telefone: data.telefone || undefined,
      sexo: data.sexo,
      cintaCardiacaId: data.cintaCardiacaId || undefined,
      contatoEmergencia: data.emergenciaNome
        ? {
            nome: data.emergenciaNome,
            telefone: data.emergenciaTelefone ?? '',
            parentesco: data.emergenciaParentesco ?? '',
          }
        : undefined,
    }

    if (editando) {
      atualizar(corredor.id, corredor)
      toast.success(`Corredor ${corredor.nome} atualizado.`)
    } else {
      adicionar(corredor)
      toast.success(`Corredor ${corredor.nome} cadastrado.`)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editando ? 'Editar corredor' : 'Novo corredor'}
          </DialogTitle>
          <DialogDescription>
            {editando
              ? 'Atualize as informações do atleta.'
              : 'Cadastre um novo atleta na prova.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 pt-2"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Ana Carolina Silva"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000.000.000-00"
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(aplicarMascaraCpf(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="atleta@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(11) 99999-9999"
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            aplicarMascaraTelefone(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="idade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idade</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={14}
                        max={99}
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={field.value as number}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sexo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sexo</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Feminino</SelectItem>
                        <SelectItem value="O">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categorias.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numeroCamisa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nº da camisa</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={9999}
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={field.value as number}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tagRFID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tag RFID</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          placeholder="TAG-XXX"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            field.onChange(gerarTagAleatoria())
                          }
                          aria-label="Gerar tag aleatória"
                        >
                          <Sparkles className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cintaCardiacaId"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Cinta cardíaca</FormLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma cinta disponível" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cintasDisponiveis.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3 rounded-lg border border-border bg-card/50 p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Contato de emergência
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="emergenciaNome"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do contato" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergenciaParentesco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parentesco</FormLabel>
                      <FormControl>
                        <Input placeholder="Pai, esposa..." {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergenciaTelefone"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(11) 99999-9999"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              aplicarMascaraTelefone(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editando ? 'Salvar alterações' : 'Cadastrar corredor'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
