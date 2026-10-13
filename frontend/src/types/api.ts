export interface PagedResult<T> {
  itens: T[]
  pagina: number
  tamanhoPagina: number
  totalItens: number
  totalPaginas: number
}

export interface PaginacaoParams {
  pagina?: number
  tamanhoPagina?: number
}

/** Resposta de erro da API (RFC 9457). */
export interface ProblemDetails {
  type?: string
  title?: string
  status?: number
  detail?: string
  traceId?: string
  errors?: Record<string, string[]>
}

export interface Cliente {
  id: number
  /** Somente dígitos. */
  cpf: string
  nome: string
  /** yyyy-MM-dd */
  dataNascimento: string | null
  email: string | null
  /** Somente dígitos. */
  telefone: string | null
}

export interface ClienteRequest {
  cpf: string
  nome: string
  dataNascimento: string | null
  email: string | null
  telefone: string | null
}

export interface Produto {
  id: number
  nome: string
  valorUnitario: number
}

export interface ProdutoRequest {
  nome: string
  valorUnitario: number
}

export interface ItemVendaRequest {
  produtoId: number
  quantidade: number
  valorUnitario: number
}

export interface CriarVendaRequest {
  clienteId: number
  /** yyyy-MM-dd; se omitida, a API assume a data de hoje. */
  dataVenda: string | null
  itens: ItemVendaRequest[]
}

export interface ItemVenda {
  id: number
  produtoId: number
  produtoNome: string
  quantidade: number
  valorUnitario: number
  subtotal: number
}

export interface Venda {
  id: number
  dataVenda: string
  cliente: { id: number; cpf: string; nome: string }
  itens: ItemVenda[]
  total: number
}

export interface VendaResumo {
  id: number
  dataVenda: string
  clienteId: number
  clienteCpf: string
  clienteNome: string
  quantidadeItens: number
  total: number
}
