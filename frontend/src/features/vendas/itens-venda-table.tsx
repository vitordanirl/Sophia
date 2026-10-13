import { PackageOpenIcon, Trash2Icon } from 'lucide-react'
import { CurrencyInput } from '@/components/common/currency-input'
import { EmptyState } from '@/components/common/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/format'
import { subtotal, type ErrosVenda, type ItemLancado } from './nova-venda-state'

interface ItensVendaTableProps {
  itens: ItemLancado[]
  erros: ErrosVenda['linhas']
  onAtualizar: (chave: string, campos: Partial<Pick<ItemLancado, 'quantidade' | 'valorUnitario'>>) => void
  onRemover: (chave: string) => void
}

/** Itens lançados, com quantidade e valor editáveis na própria linha e subtotal por item. */
export function ItensVendaTable({ itens, erros, onAtualizar, onRemover }: ItensVendaTableProps) {
  if (itens.length === 0) {
    return (
      <EmptyState
        icon={PackageOpenIcon}
        title="Nenhum produto lançado"
        description="Os produtos adicionados aparecerão aqui."
      />
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">#</TableHead>
          <TableHead>Produto</TableHead>
          <TableHead className="w-24 text-right">Qtd.</TableHead>
          <TableHead className="w-36 text-right">Valor unitário</TableHead>
          <TableHead className="w-32 text-right">Subtotal</TableHead>
          <TableHead className="w-12">
            <span className="sr-only">Ações</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {itens.map((item, indice) => {
          const erro = erros[item.chave]
          return (
            <TableRow key={item.chave} className="align-top">
              <TableCell className="pt-3.5 text-muted-foreground tabular-nums">{indice + 1}</TableCell>
              <TableCell className="pt-3.5 font-medium whitespace-normal">
                {item.produto.nome}
                {erro?.produto && <p className="text-xs font-normal text-destructive">{erro.produto}</p>}
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  aria-label={`Quantidade de ${item.produto.nome}`}
                  aria-invalid={Boolean(erro?.quantidade)}
                  className="text-right tabular-nums"
                  value={item.quantidade || ''}
                  onChange={(e) => onAtualizar(item.chave, { quantidade: Number.parseInt(e.target.value, 10) || 0 })}
                />
                {erro?.quantidade && <p className="mt-1 text-xs whitespace-normal text-destructive">{erro.quantidade}</p>}
              </TableCell>
              <TableCell>
                <CurrencyInput
                  aria-label={`Valor unitário de ${item.produto.nome}`}
                  aria-invalid={Boolean(erro?.valorUnitario)}
                  value={item.valorUnitario}
                  onValueChange={(valorUnitario) => onAtualizar(item.chave, { valorUnitario })}
                />
                {erro?.valorUnitario && <p className="mt-1 text-xs whitespace-normal text-destructive">{erro.valorUnitario}</p>}
              </TableCell>
              <TableCell className="pt-3.5 text-right font-medium tabular-nums">{formatCurrency(subtotal(item))}</TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemover(item.chave)}
                  aria-label={`Remover ${item.produto.nome}`}
                >
                  <Trash2Icon className="text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
