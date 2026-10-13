import type { ClienteSelecionado } from '@/features/clientes/cliente-combobox'
import { todayIso } from '@/lib/format'
import type { CriarVendaRequest } from '@/types/api'

export interface ItemLancado {
  /** Identificador local da linha (estável entre edições). */
  chave: string
  produto: { id: number; nome: string }
  quantidade: number
  valorUnitario: number
}

export interface NovaVendaState {
  cliente: ClienteSelecionado | null
  dataVenda: string
  itens: ItemLancado[]
}

export type NovaVendaAction =
  | { type: 'definirCliente'; cliente: ClienteSelecionado }
  | { type: 'definirData'; dataVenda: string }
  | { type: 'lancarItem'; produto: ItemLancado['produto']; quantidade: number; valorUnitario: number }
  | { type: 'atualizarItem'; chave: string; campos: Partial<Pick<ItemLancado, 'quantidade' | 'valorUnitario'>> }
  | { type: 'removerItem'; chave: string }

export const estadoInicial = (): NovaVendaState => ({ cliente: null, dataVenda: todayIso(), itens: [] })

let sequencia = 0
const novaChave = () => `item-${++sequencia}`

export function novaVendaReducer(state: NovaVendaState, action: NovaVendaAction): NovaVendaState {
  switch (action.type) {
    case 'definirCliente':
      return { ...state, cliente: action.cliente }

    case 'definirData':
      return { ...state, dataVenda: action.dataVenda }

    case 'lancarItem': {
      // Mesma regra do backend: um produto aparece uma única vez na venda; relançá-lo soma a quantidade
      const existente = state.itens.find((i) => i.produto.id === action.produto.id)
      if (existente) {
        return {
          ...state,
          itens: state.itens.map((i) =>
            i.chave === existente.chave ? { ...i, quantidade: i.quantidade + action.quantidade } : i,
          ),
        }
      }
      const item: ItemLancado = {
        chave: novaChave(),
        produto: action.produto,
        quantidade: action.quantidade,
        valorUnitario: action.valorUnitario,
      }
      return { ...state, itens: [...state.itens, item] }
    }

    case 'atualizarItem':
      return {
        ...state,
        itens: state.itens.map((i) => (i.chave === action.chave ? { ...i, ...action.campos } : i)),
      }

    case 'removerItem':
      return { ...state, itens: state.itens.filter((i) => i.chave !== action.chave) }
  }
}

/** Arredonda para centavos evitando erros de ponto flutuante (ex.: 3 × 19,90). */
export const arredondar = (valor: number) => Math.round(valor * 100) / 100

export const subtotal = (item: Pick<ItemLancado, 'quantidade' | 'valorUnitario'>) =>
  arredondar(item.quantidade * item.valorUnitario)

export function totalizar(itens: ItemLancado[]) {
  return {
    quantidadeItens: itens.length,
    quantidadeTotal: itens.reduce((soma, i) => soma + i.quantidade, 0),
    total: arredondar(itens.reduce((soma, i) => soma + subtotal(i), 0)),
  }
}

export interface ErrosVenda {
  cliente?: string
  itens?: string
  linhas: Record<string, { produto?: string; quantidade?: string; valorUnitario?: string }>
}

export const semErros = (erros: ErrosVenda) =>
  !erros.cliente && !erros.itens && Object.keys(erros.linhas).length === 0

/** Mesmas regras do CriarVendaRequestValidator do backend. */
export function validar(state: NovaVendaState): ErrosVenda {
  const erros: ErrosVenda = { linhas: {} }

  if (!state.cliente) erros.cliente = 'Selecione o cliente da venda.'
  if (state.itens.length === 0) erros.itens = 'Lance pelo menos um produto na venda.'

  for (const item of state.itens) {
    const linha: ErrosVenda['linhas'][string] = {}
    if (!Number.isInteger(item.quantidade) || item.quantidade <= 0) linha.quantidade = 'A quantidade deve ser maior que zero.'
    if (item.valorUnitario <= 0) linha.valorUnitario = 'O valor unitário deve ser maior que zero.'
    if (Object.keys(linha).length > 0) erros.linhas[item.chave] = linha
  }

  return erros
}

/**
 * Converte os erros da API (ex.: "clienteId", "itens[1].quantidade") para o formato da tela,
 * associando cada índice à linha correspondente.
 */
export function errosDoServidor(fieldErrors: Record<string, string>, itens: ItemLancado[]): ErrosVenda {
  const erros: ErrosVenda = { linhas: {} }
  const campoDaLinha = { produtoId: 'produto', quantidade: 'quantidade', valorUnitario: 'valorUnitario' } as const

  for (const [chave, mensagem] of Object.entries(fieldErrors)) {
    if (chave === 'clienteId') {
      erros.cliente = mensagem
      continue
    }
    if (chave === 'itens') {
      erros.itens = mensagem
      continue
    }

    const match = /^itens\[(\d+)\]\.(\w+)$/.exec(chave)
    const item = match ? itens[Number(match[1])] : undefined
    const campo = match ? campoDaLinha[match[2] as keyof typeof campoDaLinha] : undefined
    if (item && campo) erros.linhas[item.chave] = { ...erros.linhas[item.chave], [campo]: mensagem }
  }

  return erros
}

export function toCriarVendaRequest(state: NovaVendaState): CriarVendaRequest {
  return {
    clienteId: state.cliente!.id,
    dataVenda: state.dataVenda || null,
    itens: state.itens.map((i) => ({
      produtoId: i.produto.id,
      quantidade: i.quantidade,
      valorUnitario: i.valorUnitario,
    })),
  }
}
