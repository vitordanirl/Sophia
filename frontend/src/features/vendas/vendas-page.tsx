import { EyeIcon, FilterXIcon, PlusIcon, ReceiptTextIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { getErrorMessage } from '@/api/http'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { EmptyState } from '@/components/common/empty-state'
import { FormField } from '@/components/common/form-field'
import { PageHeader } from '@/components/common/page-header'
import { Pagination } from '@/components/common/pagination'
import { TableSkeleton } from '@/components/common/table-skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ClienteCombobox, type ClienteSelecionado } from '@/features/clientes/cliente-combobox'
import { useAjustarPagina } from '@/hooks/use-list-state'
import { formatCpf, formatCurrency, formatDate } from '@/lib/format'
import type { VendaResumo } from '@/types/api'
import { useExcluirVenda, useVendas } from './use-vendas'

const COLUNAS = 6

interface Filtros {
  dataInicio: string
  dataFim: string
  cliente: ClienteSelecionado | null
}

const FILTROS_VAZIOS: Filtros = { dataInicio: '', dataFim: '', cliente: null }

export function VendasPage() {
  const navigate = useNavigate()
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VAZIOS)
  const [pagina, setPagina] = useState(1)
  const [vendaParaExcluir, setVendaParaExcluir] = useState<VendaResumo | null>(null)

  const periodoInvalido = Boolean(filtros.dataInicio && filtros.dataFim && filtros.dataFim < filtros.dataInicio)
  const temFiltros = filtros.dataInicio !== '' || filtros.dataFim !== '' || filtros.cliente !== null

  const { data, isLoading, isError, error } = useVendas({
    // Com período inválido, ignora as datas em vez de disparar uma requisição que a API recusaria
    dataInicio: (!periodoInvalido && filtros.dataInicio) || undefined,
    dataFim: (!periodoInvalido && filtros.dataFim) || undefined,
    clienteId: filtros.cliente?.id,
    pagina,
  })
  useAjustarPagina(pagina, data?.totalPaginas, setPagina)
  const excluir = useExcluirVenda()

  const alterarFiltros = (alteracao: Partial<Filtros>) => {
    setFiltros((atual) => ({ ...atual, ...alteracao }))
    setPagina(1)
  }

  const confirmarExclusao = async () => {
    if (!vendaParaExcluir) return
    try {
      await excluir.mutateAsync(vendaParaExcluir.id)
      toast.success(`Venda nº ${vendaParaExcluir.id} excluída.`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setVendaParaExcluir(null)
    }
  }

  const vendas = data?.itens ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendas"
        description="Vendas realizadas, das mais recentes para as mais antigas."
        actions={
          <Button asChild>
            <Link to="/vendas/nova">
              <PlusIcon /> Nova venda
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-[10rem_10rem_minmax(0,1fr)_auto] lg:items-end">
            <FormField label="De" htmlFor="filtro-inicio">
              <Input
                id="filtro-inicio"
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => alterarFiltros({ dataInicio: e.target.value })}
              />
            </FormField>
            <FormField label="Até" htmlFor="filtro-fim" error={periodoInvalido ? 'Data final anterior à inicial.' : undefined}>
              <Input
                id="filtro-fim"
                type="date"
                min={filtros.dataInicio || undefined}
                aria-invalid={periodoInvalido}
                value={filtros.dataFim}
                onChange={(e) => alterarFiltros({ dataFim: e.target.value })}
              />
            </FormField>
            <FormField label="Cliente" htmlFor="filtro-cliente" className="col-span-2 lg:col-span-1">
              <ClienteCombobox
                id="filtro-cliente"
                value={filtros.cliente}
                onChange={(cliente) => alterarFiltros({ cliente })}
                placeholder="Todos os clientes"
              />
            </FormField>
            <Button
              variant="ghost"
              onClick={() => alterarFiltros(FILTROS_VAZIOS)}
              disabled={!temFiltros}
              className="justify-self-start lg:mb-px"
            >
              <FilterXIcon /> Limpar filtros
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Nº</TableHead>
                <TableHead className="hidden w-28 sm:table-cell">Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden w-20 text-right sm:table-cell">Itens</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right sm:w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton columns={COLUNAS} />
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={COLUNAS} className="py-8 text-center text-destructive">
                    {getErrorMessage(error)}
                  </TableCell>
                </TableRow>
              ) : vendas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={COLUNAS}>
                    <EmptyState
                      icon={ReceiptTextIcon}
                      title={temFiltros ? 'Nenhuma venda encontrada' : 'Nenhuma venda registrada'}
                      description={temFiltros ? 'Ajuste os filtros para ver outras vendas.' : 'Registre a primeira venda para começar.'}
                      action={
                        !temFiltros && (
                          <Button asChild>
                            <Link to="/vendas/nova">
                              <PlusIcon /> Nova venda
                            </Link>
                          </Button>
                        )
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                vendas.map((venda) => (
                  <TableRow
                    key={venda.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/vendas/${venda.id}`)}
                  >
                    <TableCell className="font-medium tabular-nums">
                      <Link to={`/vendas/${venda.id}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                        {venda.id}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden tabular-nums sm:table-cell">{formatDate(venda.dataVenda)}</TableCell>
                    <TableCell className="whitespace-normal">
                      <span className="font-medium">{venda.clienteNome}</span>
                      <span className="block text-xs whitespace-nowrap text-muted-foreground tabular-nums">{formatCpf(venda.clienteCpf)}</span>
                      <span className="block text-xs text-muted-foreground tabular-nums sm:hidden">{formatDate(venda.dataVenda)}</span>
                    </TableCell>
                    <TableCell className="hidden text-right tabular-nums sm:table-cell">{venda.quantidadeItens}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{formatCurrency(venda.total)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild className="hidden sm:inline-flex">
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/vendas/${venda.id}`} aria-label={`Ver venda ${venda.id}`}>
                                <EyeIcon />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ver detalhes</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setVendaParaExcluir(venda)} aria-label={`Excluir venda ${venda.id}`}>
                              <Trash2Icon className="text-destructive" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Excluir</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {data && (
            <Pagination pagina={data.pagina} totalPaginas={data.totalPaginas} totalItens={data.totalItens} onChange={setPagina} />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={vendaParaExcluir !== null}
        onOpenChange={(open) => !open && setVendaParaExcluir(null)}
        title={`Excluir a venda nº ${vendaParaExcluir?.id}?`}
        description="A venda e todos os seus itens serão excluídos. Esta ação não pode ser desfeita."
        loading={excluir.isPending}
        onConfirm={confirmarExclusao}
      />
    </div>
  )
}
