import { PencilIcon, PlusIcon, Trash2Icon, UsersIcon } from 'lucide-react'
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
import { formatCpf, formatDate, formatTelefone } from '@/lib/format'
import type { Cliente } from '@/types/api'
import { ClienteFormDialog } from './cliente-form-dialog'
import { useClientes, useExcluirCliente } from './use-clientes'

const COLUNAS = 6

export function ClientesPage() {
  const { busca, setBusca, buscaDebounced, pagina, setPagina } = useListState()
  const { data, isLoading, isError, error } = useClientes({ busca: buscaDebounced || undefined, pagina })
  useAjustarPagina(pagina, data?.totalPaginas, setPagina)
  const excluir = useExcluirCliente()

  const [formAberto, setFormAberto] = useState(false)
  const [clienteEmEdicao, setClienteEmEdicao] = useState<Cliente | null>(null)
  const [clienteParaExcluir, setClienteParaExcluir] = useState<Cliente | null>(null)

  const abrirFormulario = (cliente: Cliente | null) => {
    setClienteEmEdicao(cliente)
    setFormAberto(true)
  }

  const confirmarExclusao = async () => {
    if (!clienteParaExcluir) return
    try {
      await excluir.mutateAsync(clienteParaExcluir.id)
      toast.success('Cliente excluído.')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setClienteParaExcluir(null)
    }
  }

  const clientes = data?.itens ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Cadastro dos clientes da empresa."
        actions={
          <Button onClick={() => abrirFormulario(null)}>
            <PlusIcon /> Novo cliente
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4">
          <SearchInput value={busca} onChange={setBusca} placeholder="Buscar por nome ou CPF" />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden sm:table-cell">CPF</TableHead>
                <TableHead className="hidden md:table-cell">Nascimento</TableHead>
                <TableHead className="hidden xl:table-cell">E-mail</TableHead>
                <TableHead className="hidden xl:table-cell">Telefone</TableHead>
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
              ) : clientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={COLUNAS}>
                    <EmptyState
                      icon={UsersIcon}
                      title={buscaDebounced ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                      description={buscaDebounced ? 'Tente buscar por outro nome ou CPF.' : 'Cadastre o primeiro cliente para começar.'}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                clientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium whitespace-normal">
                      {cliente.nome}
                      <div className="text-xs font-normal text-muted-foreground tabular-nums sm:hidden">{formatCpf(cliente.cpf)}</div>
                    </TableCell>
                    <TableCell className="hidden tabular-nums sm:table-cell">{formatCpf(cliente.cpf)}</TableCell>
                    <TableCell className="hidden tabular-nums md:table-cell">{formatDate(cliente.dataNascimento) || '—'}</TableCell>
                    <TableCell className="hidden xl:table-cell">{cliente.email ?? '—'}</TableCell>
                    <TableCell className="hidden tabular-nums xl:table-cell">{formatTelefone(cliente.telefone) || '—'}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => abrirFormulario(cliente)} aria-label={`Editar ${cliente.nome}`}>
                              <PencilIcon />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setClienteParaExcluir(cliente)} aria-label={`Excluir ${cliente.nome}`}>
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

      <ClienteFormDialog open={formAberto} onOpenChange={setFormAberto} cliente={clienteEmEdicao} />

      <ConfirmDialog
        open={clienteParaExcluir !== null}
        onOpenChange={(open) => !open && setClienteParaExcluir(null)}
        title="Excluir cliente"
        description={`Deseja realmente excluir o cliente "${clienteParaExcluir?.nome}"? Esta ação não pode ser desfeita.`}
        loading={excluir.isPending}
        onConfirm={confirmarExclusao}
      />
    </div>
  )
}
