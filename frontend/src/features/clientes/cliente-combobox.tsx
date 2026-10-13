import { useQuery } from '@tanstack/react-query'
import { useState, type Ref } from 'react'
import { clientesApi } from '@/api/clientes'
import { AsyncCombobox } from '@/components/common/async-combobox'
import { useDebounce } from '@/hooks/use-debounce'
import { formatCpf } from '@/lib/format'
import type { Cliente } from '@/types/api'
import { clientesKeys } from './use-clientes'

export type ClienteSelecionado = Pick<Cliente, 'id' | 'cpf' | 'nome'>

interface ClienteComboboxProps {
  id?: string
  value: ClienteSelecionado | null
  onChange: (cliente: ClienteSelecionado) => void
  invalid?: boolean
  placeholder?: string
  triggerRef?: Ref<HTMLButtonElement>
  onAfterSelect?: () => void
}

/** Seleção de cliente com busca por nome ou CPF. */
export function ClienteCombobox({
  id,
  value,
  onChange,
  invalid,
  placeholder = 'Selecione o cliente (busque por nome ou CPF)',
  triggerRef,
  onAfterSelect,
}: ClienteComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const busca = useDebounce(search.trim(), 250)

  const params = { busca: busca || undefined, tamanhoPagina: 8 }
  const { data, isFetching } = useQuery({
    queryKey: clientesKeys.list(params),
    queryFn: () => clientesApi.listar(params),
    enabled: open,
  })

  return (
    <AsyncCombobox<ClienteSelecionado>
      id={id}
      value={value}
      onChange={onChange}
      options={data?.itens}
      // Enquanto a busca digitada não foi respondida, não exibe resultados antigos (evita Enter selecionar o item errado)
      isLoading={search.trim() !== busca || (isFetching && !data)}
      search={search}
      onSearchChange={setSearch}
      open={open}
      onOpenChange={setOpen}
      getKey={(c) => c.id}
      renderValue={(c) => (
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-medium text-foreground">{c.nome}</span>
          <span className="text-xs text-muted-foreground tabular-nums">{formatCpf(c.cpf)}</span>
        </span>
      )}
      renderOption={(c) => (
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium">{c.nome}</span>
          <span className="text-xs text-muted-foreground tabular-nums">{formatCpf(c.cpf)}</span>
        </div>
      )}
      placeholder={placeholder}
      searchPlaceholder="Nome ou CPF..."
      emptyText="Nenhum cliente encontrado."
      invalid={invalid}
      triggerRef={triggerRef}
      onAfterSelect={onAfterSelect}
    />
  )
}
