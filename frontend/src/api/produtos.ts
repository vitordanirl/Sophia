import { http } from '@/api/http'
import type { PagedResult, PaginacaoParams, Produto, ProdutoRequest } from '@/types/api'

export interface ListarProdutosParams extends PaginacaoParams {
  busca?: string
}

export const produtosApi = {
  listar: async (params: ListarProdutosParams) =>
    (await http.get<PagedResult<Produto>>('/produtos', { params })).data,

  obter: async (id: number) => (await http.get<Produto>(`/produtos/${id}`)).data,

  criar: async (request: ProdutoRequest) => (await http.post<Produto>('/produtos', request)).data,

  atualizar: async (id: number, request: ProdutoRequest) =>
    (await http.put<Produto>(`/produtos/${id}`, request)).data,

  excluir: async (id: number) => {
    await http.delete(`/produtos/${id}`)
  },
}
