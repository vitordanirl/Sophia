import { PackageIcon, PlusIcon, ReceiptTextIcon, ShoppingCartIcon, UsersIcon } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navegacao = [
  { to: '/vendas', label: 'Vendas', icon: ReceiptTextIcon, end: true },
  { to: '/clientes', label: 'Clientes', icon: UsersIcon, end: false },
  { to: '/produtos', label: 'Produtos', icon: PackageIcon, end: false },
]

function Marca() {
  return (
    <Link to="/vendas" className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <ShoppingCartIcon className="size-4" />
      </span>
      Sophia Vendas
    </Link>
  )
}

function itemClassName({ isActive }: { isActive: boolean }) {
  return cn(
    'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
      : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
  )
}

export function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-muted/40 md:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-60 shrink-0 flex-col gap-6 border-r bg-sidebar p-4 md:flex">
        <Marca />
        <Button asChild>
          <Link to="/vendas/nova">
            <PlusIcon /> Nova venda
          </Link>
        </Button>
        <nav className="flex flex-col gap-1" aria-label="Menu principal">
          {navegacao.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={itemClassName}>
              <Icon className="size-4" /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Barra superior (mobile) */}
      <header className="sticky top-0 z-10 flex flex-col gap-3 border-b bg-sidebar px-4 py-3 md:hidden">
        <div className="flex items-center justify-between">
          <Marca />
          <Button asChild size="sm">
            <Link to="/vendas/nova">
              <PlusIcon /> Nova venda
            </Link>
          </Button>
        </div>
        <nav className="flex gap-1 overflow-x-auto" aria-label="Menu principal">
          {navegacao.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={itemClassName}>
              <Icon className="size-4" /> {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
