import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clientesApi, type ListarClientesParams } from '@/api/clientes'
import type { ClienteRequest } from '@/types/api'

export const clientesKeys = {
  all: ['clientes'] as const,
  list: (params: ListarClientesParams) => [...clientesKeys.all, 'list', params] as const,
}

export function useClientes(params: ListarClientesParams) {
  return useQuery({
    queryKey: clientesKeys.list(params),
    queryFn: () => clientesApi.listar(params),
    placeholderData: keepPreviousData,
  })
}

export function useSalvarCliente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, request }: { id?: number; request: ClienteRequest }) =>
      id ? clientesApi.atualizar(id, request) : clientesApi.criar(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clientesKeys.all }),
  })
}

export function useExcluirCliente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: clientesApi.excluir,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clientesKeys.all }),
  })
}
