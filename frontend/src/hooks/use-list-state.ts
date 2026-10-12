import { useEffect, useState } from 'react'
import { useDebounce } from '@/hooks/use-debounce'

/**
 * Estado comum das listagens: texto de busca (com debounce) e página atual.
 * Alterar a busca volta para a primeira página.
 */
export function useListState() {
  const [busca, setBuscaState] = useState('')
  const [pagina, setPagina] = useState(1)
  const buscaDebounced = useDebounce(busca.trim())

  const setBusca = (valor: string) => {
    setBuscaState(valor)
    setPagina(1)
  }

  return { busca, setBusca, buscaDebounced, pagina, setPagina }
}

/**
 * Se a página atual deixou de existir (ex.: exclusão do último item da última página),
 * volta para a última página disponível.
 */
export function useAjustarPagina(pagina: number, totalPaginas: number | undefined, setPagina: (pagina: number) => void) {
  useEffect(() => {
    if (totalPaginas !== undefined && totalPaginas > 0 && pagina > totalPaginas) setPagina(totalPaginas)
  }, [pagina, totalPaginas, setPagina])
}
