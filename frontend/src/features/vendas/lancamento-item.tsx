import { PlusIcon } from 'lucide-react'
import { useRef, useState, type KeyboardEvent, type Ref } from 'react'
import { CurrencyInput } from '@/components/common/currency-input'
import { FormField } from '@/components/common/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProdutoCombobox } from '@/features/produtos/produto-combobox'
import { formatCurrency } from '@/lib/format'
import type { Produto } from '@/types/api'
import { subtotal } from './nova-venda-state'

interface LancamentoItemProps {
  onLancar: (produto: Produto, quantidade: number, valorUnitario: number) => void
  produtoRef?: Ref<HTMLButtonElement>
}

/**
 * Linha de lançamento: produto → quantidade → valor unitário → Enter.
 * Ao escolher o produto, o foco vai para a quantidade e o valor de cadastro é sugerido.
 */
export function LancamentoItem({ onLancar, produtoRef }: LancamentoItemProps) {
  const [produto, setProduto] = useState<Produto | null>(null)
  const [quantidade, setQuantidade] = useState(1)
  const [valorUnitario, setValorUnitario] = useState(0)
  const [erro, setErro] = useState<string>()
  const quantidadeRef = useRef<HTMLInputElement>(null)

  const selecionarProduto = (selecionado: Produto) => {
    setProduto(selecionado)
    setValorUnitario(selecionado.valorUnitario)
    setQuantidade(1)
    setErro(undefined)
  }

  const lancar = () => {
    if (!produto) return setErro('Selecione o produto.')
    if (!Number.isInteger(quantidade) || quantidade <= 0) return setErro('A quantidade deve ser maior que zero.')
    if (valorUnitario <= 0) return setErro('O valor unitário deve ser maior que zero.')

    onLancar(produto, quantidade, valorUnitario)
    setProduto(null)
    setQuantidade(1)
    setValorUnitario(0)
    setErro(undefined)
  }

  const lancarComEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      lancar()
    }
  }

  return (
    <div className="@container space-y-2">
      <div className="grid gap-3 @xl:grid-cols-[minmax(0,1fr)_6rem_9rem_auto] @xl:items-end">
        <FormField label="Produto" htmlFor="lancamento-produto">
          <ProdutoCombobox
            id="lancamento-produto"
            value={produto}
            onChange={selecionarProduto}
            triggerRef={produtoRef}
            onAfterSelect={() => {
              quantidadeRef.current?.focus()
              quantidadeRef.current?.select()
            }}
          />
        </FormField>

        <FormField label="Quantidade" htmlFor="lancamento-quantidade">
          <Input
            id="lancamento-quantidade"
            ref={quantidadeRef}
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            className="text-right tabular-nums"
            value={quantidade || ''}
            onChange={(e) => setQuantidade(Number.parseInt(e.target.value, 10) || 0)}
            onKeyDown={lancarComEnter}
          />
        </FormField>

        <FormField label="Valor unitário" htmlFor="lancamento-valor">
          <CurrencyInput
            id="lancamento-valor"
            value={valorUnitario}
            onValueChange={setValorUnitario}
            onKeyDown={lancarComEnter}
          />
        </FormField>

        <Button type="button" onClick={lancar} disabled={!produto} className="@xl:mb-px">
          <PlusIcon /> Adicionar
        </Button>
      </div>

      <div className="flex min-h-5 items-center justify-between text-sm">
        {erro ? (
          <p role="alert" className="text-xs text-destructive">
            {erro}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Dica: escolha o produto, informe a quantidade e pressione <kbd className="rounded border bg-muted px-1">Enter</kbd>.
          </p>
        )}
        {produto && (
          <span className="text-muted-foreground tabular-nums">
            Subtotal: <span className="font-medium text-foreground">{formatCurrency(subtotal({ quantidade, valorUnitario }))}</span>
          </span>
        )}
      </div>
    </div>
  )
}
