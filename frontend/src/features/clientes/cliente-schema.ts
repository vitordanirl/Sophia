import { z } from 'zod'
import { isValidCpf } from '@/lib/cpf'
import { onlyDigits, todayIso } from '@/lib/format'
import type { Cliente, ClienteRequest } from '@/types/api'

/** Espelha as regras do ClienteRequestValidator do backend para dar feedback imediato. */
export const clienteSchema = z.object({
  cpf: z
    .string()
    .min(1, 'O CPF é obrigatório.')
    .refine(isValidCpf, 'CPF inválido.'),
  nome: z
    .string()
    .trim()
    .min(1, 'O nome é obrigatório.')
    .max(150, 'O nome deve ter no máximo 150 caracteres.'),
  dataNascimento: z
    .string()
    .refine((data) => !data || data >= '1900-01-01', 'Data de nascimento inválida.')
    .refine((data) => !data || data <= todayIso(), 'A data de nascimento não pode estar no futuro.'),
  email: z
    .string()
    .trim()
    .max(254, 'O e-mail deve ter no máximo 254 caracteres.')
    .refine((email) => !email || z.string().email().safeParse(email).success, 'E-mail inválido.'),
  telefone: z
    .string()
    .refine((tel) => !tel || [10, 11].includes(onlyDigits(tel).length), 'Telefone inválido. Informe o DDD e o número.'),
})

export type ClienteFormValues = z.infer<typeof clienteSchema>

export const clienteFormFields = ['cpf', 'nome', 'dataNascimento', 'email', 'telefone'] as const

export function toClienteFormValues(cliente?: Cliente | null): ClienteFormValues {
  return {
    cpf: cliente?.cpf ?? '',
    nome: cliente?.nome ?? '',
    dataNascimento: cliente?.dataNascimento ?? '',
    email: cliente?.email ?? '',
    telefone: cliente?.telefone ?? '',
  }
}

export function toClienteRequest(values: ClienteFormValues): ClienteRequest {
  return {
    cpf: onlyDigits(values.cpf),
    nome: values.nome,
    dataNascimento: values.dataNascimento || null,
    email: values.email || null,
    telefone: onlyDigits(values.telefone) || null,
  }
}
