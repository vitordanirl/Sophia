import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { ApiError } from '@/api/http'

/**
 * Aplica nos campos do formulário os erros devolvidos pela API (ProblemDetails.errors).
 * Retorna true se algum erro foi associado a um campo, para o chamador decidir se ainda exibe um toast.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  campos: readonly Path<T>[],
): boolean {
  if (!(error instanceof ApiError) || !error.hasFieldErrors) return false

  let aplicou = false
  for (const campo of campos) {
    const mensagem = error.fieldErrors[campo]
    if (mensagem) {
      setError(campo, { type: 'server', message: mensagem }, { shouldFocus: !aplicou })
      aplicou = true
    }
  }
  return aplicou
}
