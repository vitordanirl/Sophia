import { useQuery } from '@tanstack/react-query'
import { useState, type Ref } from 'react'
import { produtosApi } from '@/api/produtos'
import { AsyncCombobox } from '@/components/common/async-combobox'
import { useDebounce } from '@/hooks/use-debounce'
import { formatCurrency } from '@/lib/format'
import type { Produto } from '@/types/api'
import { produtosKeys } from './use-produtos'

interface ProdutoComboboxProps {
  id?: string
  value: Produto | null
  onChange: (produto: Produto) => void
  invalid?: boolean
  triggerRef?: Ref<HTMLButtonElement>
  onAfterSelect?: () => void
}

/** Seleção de produto com busca por nome; mostra o valor unitário de cadastro. */
export function ProdutoCombobox({ id, value, onChange, invalid, triggerRef, onAfterSelect }: ProdutoComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const busca = useDebounce(search.trim(), 250)

  const params = { busca: busca || undefined, tamanhoPagina: 8 }
  const { data, isFetching } = useQuery({
    queryKey: produtosKeys.list(params),
    queryFn: () => produtosApi.listar(params),
    enabled: open,
  })

  return (
    <AsyncCombobox<Produto>
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
      getKey={(p) => p.id}
      renderValue={(p) => <span className="font-medium text-foreground">{p.nome}</span>}
      renderOption={(p) => (
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
          <span className="truncate">{p.nome}</span>
          <span className="text-xs text-muted-foreground tabular-nums">{formatCurrency(p.valorUnitario)}</span>
        </div>
      )}
      placeholder="Selecione o produto"
      searchPlaceholder="Nome do produto..."
      emptyText="Nenhum produto encontrado."
      invalid={invalid}
      triggerRef={triggerRef}
      onAfterSelect={onAfterSelect}
    />
  )
}
