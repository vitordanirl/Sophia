import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { vendasApi, type ListarVendasParams } from '@/api/vendas'

export const vendasKeys = {
  all: ['vendas'] as const,
  list: (params: ListarVendasParams) => [...vendasKeys.all, 'list', params] as const,
  detail: (id: number) => [...vendasKeys.all, 'detail', id] as const,
}

export function useVendas(params: ListarVendasParams) {
  return useQuery({
    queryKey: vendasKeys.list(params),
    queryFn: () => vendasApi.listar(params),
    placeholderData: keepPreviousData,
  })
}

export function useVenda(id: number) {
  return useQuery({
    queryKey: vendasKeys.detail(id),
    queryFn: () => vendasApi.obter(id),
    enabled: Number.isInteger(id) && id > 0,
  })
}

export function useCriarVenda() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: vendasApi.criar,
    onSuccess: (venda) => {
      queryClient.setQueryData(vendasKeys.detail(venda.id), venda)
      return queryClient.invalidateQueries({ queryKey: [...vendasKeys.all, 'list'] })
    },
  })
}

export function useExcluirVenda() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: vendasApi.excluir,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: vendasKeys.detail(id) })
      return queryClient.invalidateQueries({ queryKey: [...vendasKeys.all, 'list'] })
    },
  })
}
