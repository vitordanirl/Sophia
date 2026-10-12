import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  pagina: number
  totalPaginas: number
  totalItens: number
  onChange: (pagina: number) => void
}

export function Pagination({ pagina, totalPaginas, totalItens, onChange }: PaginationProps) {
  if (totalItens === 0) return null

  return (
    <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
      <span>
        {totalItens} {totalItens === 1 ? 'registro' : 'registros'}
      </span>
      <div className="flex items-center gap-2">
        <span>
          Página {pagina} de {Math.max(totalPaginas, 1)}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onChange(pagina - 1)}
          disabled={pagina <= 1}
          aria-label="Página anterior"
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onChange(pagina + 1)}
          disabled={pagina >= totalPaginas}
          aria-label="Próxima página"
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  )
}
