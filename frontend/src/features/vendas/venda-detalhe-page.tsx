import { ArrowLeftIcon, PlusIcon, SearchXIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { ApiError, getErrorMessage } from '@/api/http'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { EmptyState } from '@/components/common/empty-state'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCpf, formatCurrency, formatDate } from '@/lib/format'
import { useExcluirVenda, useVenda } from './use-vendas'

export function VendaDetalhePage() {
  const { id } = useParams()
  const vendaId = Number(id)
  const idValido = Number.isInteger(vendaId) && vendaId > 0
  const navigate = useNavigate()
  const { data: venda, isPending, error } = useVenda(vendaId)
  const excluir = useExcluirVenda()
  const [confirmarExclusao, setConfirmarExclusao] = useState(false)

  const voltar = (
    <Button variant="outline" asChild>
      <Link to="/vendas">
        <ArrowLeftIcon /> Vendas
      </Link>
    </Button>
  )

  if (isPending && idValido) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!venda) {
    const naoEncontrada = !idValido || (error instanceof ApiError && error.status === 404)
    return (
      <Card>
        <CardContent>
          <EmptyState
            icon={SearchXIcon}
            title={naoEncontrada ? 'Venda não encontrada' : 'Não foi possível carregar a venda'}
            description={naoEncontrada ? 'Ela pode ter sido excluída.' : getErrorMessage(error)}
            action={voltar}
          />
        </CardContent>
      </Card>
    )
  }

  const quantidadeTotal = venda.itens.reduce((soma, item) => soma + item.quantidade, 0)

  const handleExcluir = async () => {
    try {
      await excluir.mutateAsync(venda.id)
      toast.success(`Venda nº ${venda.id} excluída.`)
      navigate('/vendas')
    } catch (err) {
      toast.error(getErrorMessage(err))
      setConfirmarExclusao(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Venda nº ${venda.id}`}
        description={`Realizada em ${formatDate(venda.dataVenda)}`}
        actions={
          <>
            {voltar}
            <Button variant="outline" onClick={() => setConfirmarExclusao(true)}>
              <Trash2Icon className="text-destructive" /> Excluir
            </Button>
            <Button asChild>
              <Link to="/vendas/nova">
                <PlusIcon /> Nova venda
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{venda.cliente.nome}</p>
            <p className="text-sm text-muted-foreground tabular-nums">{formatCpf(venda.cliente.cpf)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">Itens</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium tabular-nums">
              {venda.itens.length} {venda.itens.length === 1 ? 'produto' : 'produtos'}
            </p>
            <p className="text-sm text-muted-foreground tabular-nums">{quantidadeTotal} unidades</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">Total da venda</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight tabular-nums">{formatCurrency(venda.total)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Qtd.</TableHead>
                <TableHead className="text-right">Valor unitário</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {venda.itens.map((item, indice) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground tabular-nums">{indice + 1}</TableCell>
                  <TableCell className="font-medium whitespace-normal">{item.produtoNome}</TableCell>
                  <TableCell className="text-right tabular-nums">{item.quantidade}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(item.valorUnitario)}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{formatCurrency(item.subtotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} className="text-right">
                  Total
                </TableCell>
                <TableCell className="text-right text-base font-semibold tabular-nums">{formatCurrency(venda.total)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmarExclusao}
        onOpenChange={setConfirmarExclusao}
        title={`Excluir a venda nº ${venda.id}?`}
        description="A venda e todos os seus itens serão excluídos. Esta ação não pode ser desfeita."
        loading={excluir.isPending}
        onConfirm={handleExcluir}
      />
    </div>
  )
}
