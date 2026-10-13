import { CheckIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { ClienteSelecionado } from '@/features/clientes/cliente-combobox'
import { formatCpf, formatCurrency, formatDate } from '@/lib/format'
import type { totalizar } from './nova-venda-state'

interface ResumoVendaProps {
  cliente: ClienteSelecionado | null
  dataVenda: string
  totais: ReturnType<typeof totalizar>
  finalizando: boolean
  onFinalizar: () => void
}

const descreverItens = ({ quantidadeItens, quantidadeTotal }: ResumoVendaProps['totais']) =>
  `${quantidadeItens} ${quantidadeItens === 1 ? 'produto' : 'produtos'} · ${quantidadeTotal} un.`

function BotaoFinalizar({ finalizando, onFinalizar, className }: Pick<ResumoVendaProps, 'finalizando' | 'onFinalizar'> & { className?: string }) {
  return (
    <Button size="lg" onClick={onFinalizar} disabled={finalizando} className={className}>
      <CheckIcon /> {finalizando ? 'Finalizando...' : 'Finalizar venda'}
    </Button>
  )
}

/** Resumo lateral (telas largas): cliente, data, itens, total e finalização. */
export function ResumoVendaCard({ cliente, dataVenda, totais, finalizando, onFinalizar }: ResumoVendaProps) {
  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle>Resumo</CardTitle>
        <CardDescription>O número da venda é gerado ao finalizar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Cliente</dt>
            <dd className="text-right font-medium">
              {cliente ? (
                <>
                  {cliente.nome}
                  <span className="block text-xs font-normal text-muted-foreground tabular-nums">{formatCpf(cliente.cpf)}</span>
                </>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Data</dt>
            <dd className="font-medium tabular-nums">{formatDate(dataVenda) || 'Hoje'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Itens</dt>
            <dd className="font-medium tabular-nums">{descreverItens(totais)}</dd>
          </div>
        </dl>

        <Separator />

        <div className="flex items-baseline justify-between gap-4">
          <span className="text-sm text-muted-foreground">Total da venda</span>
          <span className="text-3xl font-semibold tracking-tight tabular-nums" aria-live="polite">
            {formatCurrency(totais.total)}
          </span>
        </div>

        <div className="grid gap-2">
          <BotaoFinalizar finalizando={finalizando} onFinalizar={onFinalizar} />
          <p className="text-center text-xs text-muted-foreground">
            Atalho: <kbd className="rounded border bg-muted px-1">Ctrl</kbd> + <kbd className="rounded border bg-muted px-1">Enter</kbd>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/** Barra fixa no rodapé (telas menores): mantém o total e a finalização sempre visíveis durante os lançamentos. */
export function ResumoVendaBarra({ totais, finalizando, onFinalizar }: ResumoVendaProps) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 -mb-6 border-t bg-background/95 px-4 py-3 backdrop-blur md:-mx-8 md:-mb-8 md:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground tabular-nums">{descreverItens(totais)}</p>
          <p className="text-2xl font-semibold tracking-tight tabular-nums" aria-live="polite">
            {formatCurrency(totais.total)}
          </p>
        </div>
        <BotaoFinalizar finalizando={finalizando} onFinalizar={onFinalizar} />
      </div>
    </div>
  )
}
