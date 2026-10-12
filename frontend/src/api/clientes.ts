import { http } from '@/api/http'
import type { Cliente, ClienteRequest, PagedResult, PaginacaoParams } from '@/types/api'

export interface ListarClientesParams extends PaginacaoParams {
  busca?: string
}

export const clientesApi = {
  listar: async (params: ListarClientesParams) =>
    (await http.get<PagedResult<Cliente>>('/clientes', { params })).data,

  obter: async (id: number) => (await http.get<Cliente>(`/clientes/${id}`)).data,

  criar: async (request: ClienteRequest) => (await http.post<Cliente>('/clientes', request)).data,

  atualizar: async (id: number, request: ClienteRequest) =>
    (await http.put<Cliente>(`/clientes/${id}`, request)).data,

  excluir: async (id: number) => {
    await http.delete(`/clientes/${id}`)
  },
}
