import { createBrowserRouter, Navigate } from 'react-router'
import { AppLayout } from '@/components/layout/app-layout'
import { ClientesPage } from '@/features/clientes/clientes-page'
import { ProdutosPage } from '@/features/produtos/produtos-page'
import { NovaVendaPage } from '@/features/vendas/nova-venda-page'
import { VendaDetalhePage } from '@/features/vendas/venda-detalhe-page'
import { VendasPage } from '@/features/vendas/vendas-page'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/vendas" replace /> },
      { path: 'vendas', element: <VendasPage /> },
      { path: 'vendas/nova', element: <NovaVendaPage /> },
      { path: 'vendas/:id', element: <VendaDetalhePage /> },
      { path: 'clientes', element: <ClientesPage /> },
      { path: 'produtos', element: <ProdutosPage /> },
      { path: '*', element: <Navigate to="/vendas" replace /> },
    ],
  },
])
