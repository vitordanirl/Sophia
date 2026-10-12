import { PackageIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/api/http'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { EmptyState } from '@/components/common/empty-state'
import { PageHeader } from '@/components/common/page-header'
import { Pagination } from '@/components/common/pagination'
import { SearchInput } from '@/components/common/search-input'
import { TableSkeleton } from '@/components/common/table-skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAjustarPagina, useListState } from '@/hooks/use-list-state'
import { formatCurrency } from '@/lib/format'
import type { Produto } from '@/types/api'
import { ProdutoFormDialog } from './produto-form-dialog'
import { useExcluirProduto, useProdutos } from './use-produtos'

const COLUNAS = 3

export function ProdutosPage() {
  const { busca, setBusca, buscaDebounced, pagina, setPagina } = useListState()
  const { data, isLoading, isError, error } = useProdutos({ busca: buscaDebounced || undefined, pagina })
  useAjustarPagina(pagina, data?.totalPaginas, setPagina)
  const excluir = useExcluirProduto()

  const [formAberto, setFormAberto] = useState(false)
  const [produtoEmEdicao, setProdutoEmEdicao] = useState<Produto | null>(null)
  const [produtoParaExcluir, setProdutoParaExcluir] = useState<Produto | null>(null)

  const abrirFormulario = (produto: Produto | null) => {
    setProdutoEmEdicao(produto)
    setFormAberto(true)
  }

  const confirmarExclusao = async () => {
    if (!produtoParaExcluir) return
    try {
      await excluir.mutateAsync(produtoParaExcluir.id)
      toast.success('Produto excluído.')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setProdutoParaExcluir(null)
    }
  }

  const produtos = data?.itens ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtos"
        description="Produtos comercializados pela empresa."
        actions={
          <Button onClick={() => abrirFormulario(null)}>
            <PlusIcon /> Novo produto
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4">
          <SearchInput value={busca} onChange={setBusca} placeholder="Buscar por nome" />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="text-right">Valor unitário</TableHead>
                <TableHead className="w-24 text-right">Ações</TableHead>
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
              ) : produtos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={COLUNAS}>
                    <EmptyState
                      icon={PackageIcon}
                      title={buscaDebounced ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                      description={buscaDebounced ? 'Tente buscar por outro nome.' : 'Cadastre o primeiro produto para começar.'}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                produtos.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-medium whitespace-normal">{produto.nome}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(produto.valorUnitario)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => abrirFormulario(produto)} aria-label={`Editar ${produto.nome}`}>
                              <PencilIcon />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setProdutoParaExcluir(produto)} aria-label={`Excluir ${produto.nome}`}>
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

      <ProdutoFormDialog open={formAberto} onOpenChange={setFormAberto} produto={produtoEmEdicao} />

      <ConfirmDialog
        open={produtoParaExcluir !== null}
        onOpenChange={(open) => !open && setProdutoParaExcluir(null)}
        title="Excluir produto"
        description={`Deseja realmente excluir o produto "${produtoParaExcluir?.nome}"? Esta ação não pode ser desfeita.`}
        loading={excluir.isPending}
        onConfirm={confirmarExclusao}
      />
    </div>
  )
}
