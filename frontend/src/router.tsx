import { createBrowserRouter, Navigate } from 'react-router'
import { AppLayout } from '@/components/layout/app-layout'
import { PageLoading, RouteError } from '@/components/layout/route-states'

// Cada página é carregada sob demanda, mantendo o bundle inicial pequeno
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteError />,
    hydrateFallbackElement: <PageLoading />,
    children: [
      { index: true, element: <Navigate to="/vendas" replace /> },
      {
        path: 'vendas',
        lazy: async () => ({ Component: (await import('@/features/vendas/vendas-page')).VendasPage }),
      },
      {
        path: 'vendas/nova',
        lazy: async () => ({ Component: (await import('@/features/vendas/nova-venda-page')).NovaVendaPage }),
      },
      {
        path: 'vendas/:id',
        lazy: async () => ({ Component: (await import('@/features/vendas/venda-detalhe-page')).VendaDetalhePage }),
      },
      {
        path: 'clientes',
        lazy: async () => ({ Component: (await import('@/features/clientes/clientes-page')).ClientesPage }),
      },
      {
        path: 'produtos',
        lazy: async () => ({ Component: (await import('@/features/produtos/produtos-page')).ProdutosPage }),
      },
      { path: '*', element: <Navigate to="/vendas" replace /> },
    ],
  },
])
