import { onlyDigits } from '@/lib/format'

/** Mesmo algoritmo do backend (Cpf.EhValido): 11 dígitos, não repetidos, com dígitos verificadores corretos. */
export function isValidCpf(value: string): boolean {
  const cpf = onlyDigits(value)
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false

  const digito = (quantidade: number) => {
    let soma = 0
    for (let i = 0; i < quantidade; i++) soma += Number(cpf[i]) * (quantidade + 1 - i)
    const resto = soma % 11
    return resto < 2 ? 0 : 11 - resto
  }

  return digito(9) === Number(cpf[9]) && digito(10) === Number(cpf[10])
}
