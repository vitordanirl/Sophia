import { createBrowserRouter, Navigate } from 'react-router'
import { AppLayout } from '@/components/layout/app-layout'
import { ClientesPage } from '@/features/clientes/clientes-page'
import { ProdutosPage } from '@/features/produtos/produtos-page'
import { NovaVendaPage, VendasPage } from '@/features/vendas/vendas-page'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/vendas" replace /> },
      { path: 'vendas', element: <VendasPage /> },
      { path: 'vendas/nova', element: <NovaVendaPage /> },
      { path: 'clientes', element: <ClientesPage /> },
      { path: 'produtos', element: <ProdutosPage /> },
      { path: '*', element: <Navigate to="/vendas" replace /> },
    ],
  },
])
