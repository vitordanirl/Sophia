import { ReceiptTextIcon } from 'lucide-react'
import { EmptyState } from '@/components/common/empty-state'
import { PageHeader } from '@/components/common/page-header'
import { Card, CardContent } from '@/components/ui/card'

// Implementada na Fase 6
export function VendasPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Vendas" description="Vendas realizadas." />
      <Card>
        <CardContent>
          <EmptyState icon={ReceiptTextIcon} title="Em construção" description="A listagem de vendas será implementada na próxima fase." />
        </CardContent>
      </Card>
    </div>
  )
}

export function NovaVendaPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Nova venda" />
      <Card>
        <CardContent>
          <EmptyState icon={ReceiptTextIcon} title="Em construção" description="A tela de vendas será implementada na próxima fase." />
        </CardContent>
      </Card>
    </div>
  )
}
