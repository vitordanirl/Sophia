import { describe, expect, it } from 'vitest'
import { isValidCpf } from './cpf'

// Mesmos casos do CpfTests do backend: as duas validações precisam concordar
describe('isValidCpf', () => {
  it.each(['52998224725', '529.982.247-25', '11144477735'])('aceita CPF válido: %s', (cpf) => {
    expect(isValidCpf(cpf)).toBe(true)
  })

  it.each([
    ['vazio', ''],
    ['10 dígitos', '5299822472'],
    ['12 dígitos', '529982247250'],
    ['segundo dígito verificador errado', '52998224724'],
    ['primeiro dígito verificador errado', '52998224715'],
    ['todos os dígitos iguais', '11111111111'],
    ['letras', 'abc.def.ghi-jk'],
  ])('rejeita CPF inválido (%s)', (_, cpf) => {
    expect(isValidCpf(cpf)).toBe(false)
  })
})
