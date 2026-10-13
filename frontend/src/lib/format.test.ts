import { describe, expect, it } from 'vitest'
import { formatCpf, formatCurrency, formatDate, formatTelefone, onlyDigits } from './format'

describe('onlyDigits', () => {
  it('remove tudo que não for dígito', () => {
    expect(onlyDigits('529.982.247-25')).toBe('52998224725')
    expect(onlyDigits(null)).toBe('')
  })
})

describe('formatCpf', () => {
  it('aplica a máscara completa', () => {
    expect(formatCpf('52998224725')).toBe('529.982.247-25')
  })

  it('aplica a máscara parcialmente enquanto o usuário digita', () => {
    expect(formatCpf('529')).toBe('529')
    expect(formatCpf('5299')).toBe('529.9')
    expect(formatCpf('5299822')).toBe('529.982.2')
    expect(formatCpf('5299822472')).toBe('529.982.247-2')
  })

  it('ignora dígitos além do 11º', () => {
    expect(formatCpf('529982247259999')).toBe('529.982.247-25')
  })
})

describe('formatTelefone', () => {
  it('formata celular (11 dígitos) e fixo (10 dígitos)', () => {
    expect(formatTelefone('11987654321')).toBe('(11) 98765-4321')
    expect(formatTelefone('1133334444')).toBe('(11) 3333-4444')
  })

  it('formata valores parciais', () => {
    expect(formatTelefone('1')).toBe('(1')
    expect(formatTelefone('119')).toBe('(11) 9')
  })
})

describe('formatDate', () => {
  it('converte yyyy-MM-dd para dd/MM/yyyy sem deslocamento de fuso', () => {
    expect(formatDate('2026-01-01')).toBe('01/01/2026')
    expect(formatDate(null)).toBe('')
  })
})

describe('formatCurrency', () => {
  it('formata em reais', () => {
    // Intl usa espaço não separável entre "R$" e o valor
    expect(formatCurrency(1234.5).replace(/\s/g, ' ')).toBe('R$ 1.234,50')
  })
})
