import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { produtosApi, type ListarProdutosParams } from '@/api/produtos'
import type { ProdutoRequest } from '@/types/api'

export const produtosKeys = {
  all: ['produtos'] as const,
  list: (params: ListarProdutosParams) => [...produtosKeys.all, 'list', params] as const,
}

export function useProdutos(params: ListarProdutosParams) {
  return useQuery({
    queryKey: produtosKeys.list(params),
    queryFn: () => produtosApi.listar(params),
    placeholderData: keepPreviousData,
  })
}

export function useSalvarProduto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, request }: { id?: number; request: ProdutoRequest }) =>
      id ? produtosApi.atualizar(id, request) : produtosApi.criar(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: produtosKeys.all }),
  })
}

export function useExcluirProduto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: produtosApi.excluir,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: produtosKeys.all }),
  })
}
