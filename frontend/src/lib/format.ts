const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function onlyDigits(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '')
}

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

/** 52998224725 → 529.982.247-25 (aceita valores parciais, para uso como máscara). */
export function formatCpf(value: string | null | undefined): string {
  const digits = onlyDigits(value).slice(0, 11)
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2')
}

/** 11987654321 → (11) 98765-4321 | 1133334444 → (11) 3333-4444 (aceita valores parciais). */
export function formatTelefone(value: string | null | undefined): string {
  const digits = onlyDigits(value).slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''

  const ddd = digits.slice(0, 2)
  const numero = digits.slice(2)
  const corte = digits.length === 11 ? 5 : 4
  return numero.length > corte
    ? `(${ddd}) ${numero.slice(0, corte)}-${numero.slice(corte)}`
    : `(${ddd}) ${numero}`
}

/**
 * yyyy-MM-dd → dd/MM/yyyy. Converte a string diretamente, sem passar por Date,
 * para não sofrer deslocamento de fuso horário.
 */
export function formatDate(value: string | null | undefined): string {
  if (!value) return ''
  const [ano, mes, dia] = value.split('-')
  return `${dia}/${mes}/${ano}`
}

/** Data de hoje no fuso local, no formato yyyy-MM-dd. */
export function todayIso(): string {
  const hoje = new Date()
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const dia = String(hoje.getDate()).padStart(2, '0')
  return `${hoje.getFullYear()}-${mes}-${dia}`
}
