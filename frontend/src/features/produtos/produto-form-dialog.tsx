import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { ApiError, getErrorMessage } from '@/api/http'
import { CurrencyInput } from '@/components/common/currency-input'
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
import type { Produto } from '@/types/api'
import {
  produtoFormFields,
  produtoSchema,
  toProdutoFormValues,
  toProdutoRequest,
  type ProdutoFormValues,
} from './produto-schema'
import { useSalvarProduto } from './use-produtos'

interface ProdutoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Produto em edição; ausente para um novo cadastro. */
  produto?: Produto | null
}

export function ProdutoFormDialog({ open, onOpenChange, produto }: ProdutoFormDialogProps) {
  const editando = Boolean(produto)
  const salvar = useSalvarProduto()

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ProdutoFormValues>({
    resolver: zodResolver(produtoSchema),
    defaultValues: toProdutoFormValues(produto),
  })

  useEffect(() => {
    if (open) reset(toProdutoFormValues(produto))
  }, [open, produto, reset])

  const onSubmit = handleSubmit(async (values) => {
    try {
      await salvar.mutateAsync({ id: produto?.id, request: toProdutoRequest(values) })
      toast.success(editando ? 'Produto atualizado.' : 'Produto cadastrado.')
      onOpenChange(false)
    } catch (error) {
      if (applyServerErrors(error, setError, produtoFormFields)) return

      // Conflito de duplicidade: o único campo único do produto é o nome
      if (error instanceof ApiError && error.status === 409) {
        setError('nome', { type: 'server', message: error.message }, { shouldFocus: true })
        return
      }

      toast.error(getErrorMessage(error))
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editando ? 'Editar produto' : 'Novo produto'}</DialogTitle>
          <DialogDescription>
            {editando
              ? 'Alterar o valor não afeta vendas já realizadas.'
              : 'Campos marcados com * são obrigatórios.'}
          </DialogDescription>
        </DialogHeader>

        <form id="produto-form" onSubmit={onSubmit} className="grid gap-4" noValidate>
          <FormField label="Nome" htmlFor="nome" error={errors.nome?.message} required>
            <Input
              id="nome"
              placeholder="Nome do produto"
              autoFocus
              aria-invalid={Boolean(errors.nome)}
              {...register('nome')}
            />
          </FormField>

          <FormField label="Valor unitário" htmlFor="valorUnitario" error={errors.valorUnitario?.message} required>
            <Controller
              control={control}
              name="valorUnitario"
              render={({ field }) => (
                <CurrencyInput
                  id="valorUnitario"
                  aria-invalid={Boolean(errors.valorUnitario)}
                  ref={field.ref}
                  name={field.name}
                  onBlur={field.onBlur}
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
          </FormField>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={salvar.isPending}>
            Cancelar
          </Button>
          <Button type="submit" form="produto-form" disabled={salvar.isPending}>
            {salvar.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
