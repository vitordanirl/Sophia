import { Loader2Icon, TriangleAlertIcon } from 'lucide-react'
import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { EmptyState } from '@/components/common/empty-state'
import { Button } from '@/components/ui/button'

/** Exibido enquanto o código da página inicial é carregado. */
export function PageLoading() {
  return (
    <div className="flex min-h-svh items-center justify-center text-muted-foreground" role="status">
      <Loader2Icon className="size-6 animate-spin" />
      <span className="sr-only">Carregando...</span>
    </div>
  )
}

/** Erro inesperado ao renderizar uma rota (evita a tela branca). */
export function RouteError() {
  const error = useRouteError()
  const descricao = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Ocorreu um erro inesperado ao exibir esta página.'

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <EmptyState
        icon={TriangleAlertIcon}
        title="Algo deu errado"
        description={descricao}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Recarregar
            </Button>
            <Button asChild>
              <Link to="/vendas">Ir para Vendas</Link>
            </Button>
          </div>
        }
      />
    </div>
  )
}
