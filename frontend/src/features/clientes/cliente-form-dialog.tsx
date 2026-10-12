import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { ApiError, getErrorMessage } from '@/api/http'
import { FormField } from '@/components/common/form-field'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { applyServerErrors } from '@/lib/form-errors'
import { formatCpf, formatTelefone, todayIso } from '@/lib/format'
import type { Cliente } from '@/types/api'
import {
  clienteFormFields,
  clienteSchema,
  toClienteFormValues,
  toClienteRequest,
  type ClienteFormValues,
} from './cliente-schema'
import { useSalvarCliente } from './use-clientes'

interface ClienteFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Cliente em edição; ausente para um novo cadastro. */
  cliente?: Cliente | null
}

export function ClienteFormDialog({ open, onOpenChange, cliente }: ClienteFormDialogProps) {
  const editando = Boolean(cliente)
  const salvar = useSalvarCliente()

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: toClienteFormValues(cliente),
  })

  useEffect(() => {
    if (open) reset(toClienteFormValues(cliente))
  }, [open, cliente, reset])

  const onSubmit = handleSubmit(async (values) => {
    try {
      await salvar.mutateAsync({ id: cliente?.id, request: toClienteRequest(values) })
      toast.success(editando ? 'Cliente atualizado.' : 'Cliente cadastrado.')
      onOpenChange(false)
    } catch (error) {
      if (applyServerErrors(error, setError, clienteFormFields)) return

      // Conflito de duplicidade: o único campo único do cliente é o CPF
      if (error instanceof ApiError && error.status === 409) {
        setError('cpf', { type: 'server', message: error.message }, { shouldFocus: true })
        return
      }

      toast.error(getErrorMessage(error))
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editando ? 'Editar cliente' : 'Novo cliente'}</DialogTitle>
          <DialogDescription>Campos marcados com * são obrigatórios.</DialogDescription>
        </DialogHeader>

        <form id="cliente-form" onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
          <FormField label="CPF" htmlFor="cpf" error={errors.cpf?.message} required>
            <Controller
              control={control}
              name="cpf"
              render={({ field }) => (
                <Input
                  id="cpf"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  autoFocus
                  aria-invalid={Boolean(errors.cpf)}
                  {...field}
                  value={formatCpf(field.value)}
                  onChange={(e) => field.onChange(formatCpf(e.target.value))}
                />
              )}
            />
          </FormField>

          <FormField label="Data de nascimento" htmlFor="dataNascimento" error={errors.dataNascimento?.message}>
            <Input
              id="dataNascimento"
              type="date"
              max={todayIso()}
              aria-invalid={Boolean(errors.dataNascimento)}
              {...register('dataNascimento')}
            />
          </FormField>

          <FormField label="Nome" htmlFor="nome" error={errors.nome?.message} required className="sm:col-span-2">
            <Input id="nome" placeholder="Nome completo" aria-invalid={Boolean(errors.nome)} {...register('nome')} />
          </FormField>

          <FormField label="E-mail" htmlFor="email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              placeholder="cliente@email.com"
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
          </FormField>

          <FormField label="Telefone" htmlFor="telefone" error={errors.telefone?.message}>
            <Controller
              control={control}
              name="telefone"
              render={({ field }) => (
                <Input
                  id="telefone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="(00) 00000-0000"
                  aria-invalid={Boolean(errors.telefone)}
                  {...field}
                  value={formatTelefone(field.value)}
                  onChange={(e) => field.onChange(formatTelefone(e.target.value))}
                />
              )}
            />
          </FormField>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={salvar.isPending}>
            Cancelar
          </Button>
          <Button type="submit" form="cliente-form" disabled={salvar.isPending}>
            {salvar.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
