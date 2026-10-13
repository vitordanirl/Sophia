import { http } from '@/api/http'
import type { CriarVendaRequest, PagedResult, PaginacaoParams, Venda, VendaResumo } from '@/types/api'

export interface ListarVendasParams extends PaginacaoParams {
  dataInicio?: string
  dataFim?: string
  clienteId?: number
}

export const vendasApi = {
  listar: async (params: ListarVendasParams) =>
    (await http.get<PagedResult<VendaResumo>>('/vendas', { params })).data,

  obter: async (id: number) => (await http.get<Venda>(`/vendas/${id}`)).data,

  criar: async (request: CriarVendaRequest) => (await http.post<Venda>('/vendas', request)).data,

  excluir: async (id: number) => {
    await http.delete(`/vendas/${id}`)
  },
}
