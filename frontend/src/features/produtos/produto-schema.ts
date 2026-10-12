import { z } from 'zod'
import type { Produto, ProdutoRequest } from '@/types/api'

/** Espelha as regras do ProdutoRequestValidator do backend. */
export const produtoSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, 'O nome é obrigatório.')
    .max(120, 'O nome deve ter no máximo 120 caracteres.'),
  valorUnitario: z.number().positive('O valor unitário deve ser maior que zero.'),
})

export type ProdutoFormValues = z.infer<typeof produtoSchema>

export const produtoFormFields = ['nome', 'valorUnitario'] as const

export function toProdutoFormValues(produto?: Produto | null): ProdutoFormValues {
  return {
    nome: produto?.nome ?? '',
    valorUnitario: produto?.valorUnitario ?? 0,
  }
}

export function toProdutoRequest(values: ProdutoFormValues): ProdutoRequest {
  return { nome: values.nome, valorUnitario: values.valorUnitario }
}
