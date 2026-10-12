import type { ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { formatCurrency, onlyDigits } from '@/lib/format'
import { cn } from '@/lib/utils'

type CurrencyInputProps = Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'type'> & {
  value: number | null | undefined
  onValueChange: (value: number) => void
}

/**
 * Campo monetário estilo "caixa registradora": o operador digita só números
 * e o valor é preenchido a partir dos centavos (1 → R$ 0,01, 1234 → R$ 12,34).
 */
export function CurrencyInput({ value, onValueChange, ...props }: CurrencyInputProps) {
  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      value={formatCurrency(value ?? 0)}
      onChange={(e) => {
        const centavos = Number(onlyDigits(e.target.value).slice(0, 13) || '0')
        onValueChange(centavos / 100)
      }}
      onFocus={(e) => {
        // Cursor sempre no fim, onde os dígitos entram
        const input = e.currentTarget
        requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length))
        props.onFocus?.(e)
      }}
      className={cn('text-right tabular-nums', props.className)}
    />
  )
}
