import { ArrowLeftIcon } from 'lucide-react'
import { useReducer, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { ApiError, getErrorMessage } from '@/api/http'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { FormField } from '@/components/common/form-field'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ClienteCombobox } from '@/features/clientes/cliente-combobox'
import { formatCurrency } from '@/lib/format'
import type { Produto } from '@/types/api'
import { ItensVendaTable } from './itens-venda-table'
import { LancamentoItem } from './lancamento-item'
import {
  errosDoServidor,
  estadoInicial,
  novaVendaReducer,
  semErros,
  toCriarVendaRequest,
  totalizar,
  validar,
  type ErrosVenda,
  type NovaVendaAction,
} from './nova-venda-state'
import { ResumoVendaBarra, ResumoVendaCard } from './resumo-venda'
import { useCriarVenda } from './use-vendas'

const SEM_ERROS: ErrosVenda = { linhas: {} }

export function NovaVendaPage() {
  const navigate = useNavigate()
  const criar = useCriarVenda()
  const [state, dispatch] = useReducer(novaVendaReducer, undefined, estadoInicial)
  const [tentouFinalizar, setTentouFinalizar] = useState(false)
  const [errosServidor, setErrosServidor] = useState<ErrosVenda | null>(null)
  const [confirmarDescarte, setConfirmarDescarte] = useState(false)
  const clienteRef = useRef<HTMLButtonElement>(null)
  const produtoRef = useRef<HTMLButtonElement>(null)

  const totais = totalizar(state.itens)
  // Erros do servidor valem até a próxima edição; depois da 1ª tentativa, a validação local acompanha a digitação
  const erros = errosServidor ?? (tentouFinalizar ? validar(state) : SEM_ERROS)
  const temAlteracoes = state.cliente !== null || state.itens.length > 0

  const executar = (action: NovaVendaAction) => {
    setErrosServidor(null)
    dispatch(action)
  }

  const lancarItem = (produto: Produto, quantidade: number, valorUnitario: number) => {
    const existente = state.itens.find((i) => i.produto.id === produto.id)
    executar({ type: 'lancarItem', produto: { id: produto.id, nome: produto.nome }, quantidade, valorUnitario })

    if (existente) {
      const aviso = existente.valorUnitario !== valorUnitario ? ' O valor unitário do item foi mantido.' : ''
      toast.info(`Quantidade somada ao item "${produto.nome}" já lançado.${aviso}`)
    }
    produtoRef.current?.focus()
  }

  const finalizar = async () => {
    if (criar.isPending) return
    setTentouFinalizar(true)

    const errosLocais = validar(state)
    if (!semErros(errosLocais)) {
      if (errosLocais.cliente) clienteRef.current?.focus()
      toast.error('Verifique os campos destacados antes de finalizar.')
      return
    }

    try {
      const venda = await criar.mutateAsync(toCriarVendaRequest(state))
      toast.success(`Venda nº ${venda.id} registrada no valor de ${formatCurrency(venda.total)}.`)
      navigate(`/vendas/${venda.id}`)
    } catch (error) {
      if (error instanceof ApiError && error.hasFieldErrors) {
        setErrosServidor(errosDoServidor(error.fieldErrors, state.itens))
        toast.error('Verifique os campos destacados antes de finalizar.')
        return
      }
      toast.error(getErrorMessage(error))
    }
  }

  const resumo = {
    cliente: state.cliente,
    dataVenda: state.dataVenda,
    totais,
    finalizando: criar.isPending,
    onFinalizar: () => void finalizar(),
  }

  const sair = () => (temAlteracoes ? setConfirmarDescarte(true) : navigate('/vendas'))

  const atalhos = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      void finalizar()
    }
  }

  return (
    <div className="space-y-6" onKeyDown={atalhos}>
      <PageHeader
        title="Nova venda"
        description="Selecione o cliente, lance os produtos e finalize a venda."
        actions={
          <Button variant="outline" onClick={sair}>
            <ArrowLeftIcon /> Voltar
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados da venda</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]">
              <FormField label="Cliente" htmlFor="cliente" error={erros.cliente} required>
                <ClienteCombobox
                  id="cliente"
                  value={state.cliente}
                  onChange={(cliente) => executar({ type: 'definirCliente', cliente })}
                  invalid={Boolean(erros.cliente)}
                  triggerRef={clienteRef}
                  onAfterSelect={() => produtoRef.current?.focus()}
                />
              </FormField>
              <FormField label="Data da venda" htmlFor="dataVenda">
                <Input
                  id="dataVenda"
                  type="date"
                  value={state.dataVenda}
                  onChange={(e) => executar({ type: 'definirData', dataVenda: e.target.value })}
                />
              </FormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produtos</CardTitle>
              <CardDescription>Lance quantos produtos forem necessários nesta venda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <LancamentoItem onLancar={lancarItem} produtoRef={produtoRef} />
              <Separator />
              {erros.itens && (
                <p role="alert" className="text-sm text-destructive">
                  {erros.itens}
                </p>
              )}
              <ItensVendaTable
                itens={state.itens}
                erros={erros.linhas}
                onAtualizar={(chave, campos) => executar({ type: 'atualizarItem', chave, campos })}
                onRemover={(chave) => executar({ type: 'removerItem', chave })}
              />
            </CardContent>
          </Card>
        </div>

        <aside className="hidden xl:block">
          <ResumoVendaCard {...resumo} />
        </aside>
      </div>

      <div className="xl:hidden">
        <ResumoVendaBarra {...resumo} />
      </div>

      <ConfirmDialog
        open={confirmarDescarte}
        onOpenChange={setConfirmarDescarte}
        title="Descartar venda?"
        description="Os dados lançados nesta venda serão perdidos."
        confirmLabel="Descartar"
        onConfirm={() => navigate('/vendas')}
      />
    </div>
  )
}
