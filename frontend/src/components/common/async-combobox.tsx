import { ChevronsUpDownIcon, Loader2Icon } from 'lucide-react'
import { useRef, type KeyboardEvent, type ReactNode, type Ref } from 'react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface AsyncComboboxProps<T> {
  id?: string
  value: T | null
  onChange: (value: T) => void
  /** Opções já filtradas pelo servidor para o texto em `search`. */
  options: T[] | undefined
  isLoading: boolean
  search: string
  onSearchChange: (search: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  getKey: (item: T) => number
  renderOption: (item: T) => ReactNode
  renderValue: (item: T) => ReactNode
  placeholder: string
  searchPlaceholder: string
  emptyText: string
  invalid?: boolean
  className?: string
  triggerRef?: Ref<HTMLButtonElement>
  /** Chamado ao escolher uma opção, no lugar de devolver o foco ao campo (ex.: pular para o próximo campo). */
  onAfterSelect?: () => void
}

/**
 * Combobox com busca no servidor (o filtro do cmdk fica desligado).
 * Com o campo focado, digitar qualquer caractere já abre a lista com a busca iniciada.
 */
export function AsyncCombobox<T>({
  id,
  value,
  onChange,
  options,
  isLoading,
  search,
  onSearchChange,
  open,
  onOpenChange,
  getKey,
  renderOption,
  renderValue,
  placeholder,
  searchPlaceholder,
  emptyText,
  invalid,
  className,
  triggerRef,
  onAfterSelect,
}: AsyncComboboxProps<T>) {
  const selecionouRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Aberto por clique/Enter/Espaço: começa com a busca vazia
  const handleOpenChange = (aberto: boolean) => {
    if (aberto) onSearchChange('')
    onOpenChange(aberto)
  }

  // Aberto digitando: o caractere inicia a busca. Até o foco chegar ao campo de busca,
  // as teclas seguintes continuam sendo capturadas aqui para não se perderem.
  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    // Lista aberta com o foco ainda no campo: Enter/setas levam o foco à busca em vez de fechar a lista
    if (open && ['Enter', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
      e.preventDefault()
      focarBusca()
      return
    }

    const caractereImprimivel = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey
    if (!caractereImprimivel) return
    // Com a lista fechada, o espaço mantém o comportamento padrão do botão (abrir)
    if (!open && e.key === ' ') return

    e.preventDefault()
    if (open) {
      onSearchChange(search + e.key)
      focarBusca()
    } else {
      onSearchChange(e.key)
      onOpenChange(true)
    }
  }

  const focarBusca = () => {
    const input = inputRef.current
    if (!input) return
    input.focus()
    input.setSelectionRange(input.value.length, input.value.length)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          ref={triggerRef}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          onKeyDown={handleTriggerKeyDown}
          className={cn(
            'h-auto min-h-8 w-full justify-between px-2.5 py-1.5 font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <span className="min-w-0 flex-1 truncate text-left">{value ? renderValue(value) : placeholder}</span>
          <ChevronsUpDownIcon className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) min-w-72 p-0"
        align="start"
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          focarBusca()
        }}
        onCloseAutoFocus={(e) => {
          // O foco já foi movido em onSelect; impede o Radix de devolvê-lo ao gatilho
          if (selecionouRef.current && onAfterSelect) e.preventDefault()
          selecionouRef.current = false
        }}
      >
        <Command shouldFilter={false}>
          <CommandInput ref={inputRef} placeholder={searchPlaceholder} value={search} onValueChange={onSearchChange} />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2Icon className="size-4 animate-spin" /> Buscando...
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyText}</CommandEmpty>
                <CommandGroup>
                  {options?.map((item) => (
                    <CommandItem
                      key={getKey(item)}
                      value={String(getKey(item))}
                      data-checked={value !== null && getKey(value) === getKey(item)}
                      onSelect={() => {
                        selecionouRef.current = true
                        onChange(item)
                        onOpenChange(false)
                        // Move o foco imediatamente, sem esperar a animação de fechamento,
                        // para que as próximas teclas do operador já caiam no campo seguinte
                        onAfterSelect?.()
                      }}
                    >
                      {renderOption(item)}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
