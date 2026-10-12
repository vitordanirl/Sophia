import axios, { AxiosError } from 'axios'
import type { ProblemDetails } from '@/types/api'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

/**
 * Erro normalizado da API. Mantém a mensagem principal e os erros por campo
 * (chaves em camelCase, ex.: "cpf", "itens[0].quantidade").
 */
export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string>

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }

  get hasFieldErrors() {
    return Object.keys(this.fieldErrors).length > 0
  }
}

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ProblemDetails>) => Promise.reject(toApiError(error)),
)

function toApiError(error: AxiosError<ProblemDetails>): ApiError {
  if (!error.response) {
    return new ApiError(0, 'Não foi possível conectar ao servidor. Verifique se a API está em execução.')
  }

  const { status, data } = error.response
  const fieldErrors = Object.fromEntries(
    Object.entries(data?.errors ?? {}).map(([campo, mensagens]) => [campo, mensagens[0]]),
  )
  const message = data?.detail ?? data?.title ?? 'Ocorreu um erro inesperado.'

  return new ApiError(status, message, fieldErrors)
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocorreu um erro inesperado.'
}
