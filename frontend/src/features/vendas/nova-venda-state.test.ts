import { describe, expect, it } from 'vitest'
import {
  errosDoServidor,
  estadoInicial,
  novaVendaReducer,
  semErros,
  subtotal,
  toCriarVendaRequest,
  totalizar,
  validar,
  type NovaVendaAction,
  type NovaVendaState,
} from './nova-venda-state'

const caneta = { id: 10, nome: 'Caneta' }
const caderno = { id: 20, nome: 'Caderno' }
const cliente = { id: 1, cpf: '52998224725', nome: 'Ana' }

const aplicar = (...actions: NovaVendaAction[]) => actions.reduce(novaVendaReducer, estadoInicial())

describe('novaVendaReducer', () => {
  it('lança itens distintos em linhas separadas', () => {
    const state = aplicar(
      { type: 'lancarItem', produto: caneta, quantidade: 2, valorUnitario: 2.5 },
      { type: 'lancarItem', produto: caderno, quantidade: 1, valorUnitario: 19.9 },
    )

    expect(state.itens.map((i) => i.produto.nome)).toEqual(['Caneta', 'Caderno'])
  })

  it('relançar um produto soma a quantidade na linha existente e mantém o valor unitário', () => {
    const state = aplicar(
      { type: 'lancarItem', produto: caneta, quantidade: 2, valorUnitario: 2.5 },
      { type: 'lancarItem', produto: caneta, quantidade: 3, valorUnitario: 9.99 },
    )

    expect(state.itens).toHaveLength(1)
    expect(state.itens[0]).toMatchObject({ quantidade: 5, valorUnitario: 2.5 })
  })

  it('atualiza e remove itens pela chave', () => {
    const lancado = aplicar({ type: 'lancarItem', produto: caneta, quantidade: 1, valorUnitario: 2.5 })
    const chave = lancado.itens[0].chave

    const atualizado = novaVendaReducer(lancado, { type: 'atualizarItem', chave, campos: { quantidade: 4 } })
    expect(atualizado.itens[0].quantidade).toBe(4)

    const removido = novaVendaReducer(atualizado, { type: 'removerItem', chave })
    expect(removido.itens).toHaveLength(0)
  })
})

describe('totalizadores', () => {
  it('arredonda o subtotal para centavos (evita 3 × 19,90 = 59,699999...)', () => {
    expect(subtotal({ quantidade: 3, valorUnitario: 19.9 })).toBe(59.7)
  })

  it('calcula quantidade de itens, unidades e total da venda', () => {
    const state = aplicar(
      { type: 'lancarItem', produto: caneta, quantidade: 4, valorUnitario: 2.5 },
      { type: 'lancarItem', produto: caderno, quantidade: 3, valorUnitario: 19.9 },
    )

    expect(totalizar(state.itens)).toEqual({ quantidadeItens: 2, quantidadeTotal: 7, total: 69.7 })
  })
})

describe('validar', () => {
  it('exige cliente e pelo menos um item', () => {
    const erros = validar(estadoInicial())

    expect(erros.cliente).toBeDefined()
    expect(erros.itens).toBeDefined()
    expect(semErros(erros)).toBe(false)
  })

  it('aponta a linha com quantidade ou valor inválido', () => {
    const lancado = aplicar(
      { type: 'definirCliente', cliente },
      { type: 'lancarItem', produto: caneta, quantidade: 1, valorUnitario: 2.5 },
    )
    const chave = lancado.itens[0].chave
    const state = novaVendaReducer(lancado, { type: 'atualizarItem', chave, campos: { quantidade: 0, valorUnitario: 0 } })

    const erros = validar(state)

    expect(Object.keys(erros.linhas[chave])).toEqual(['quantidade', 'valorUnitario'])
  })

  it('não aponta erros em uma venda válida', () => {
    const state = aplicar(
      { type: 'definirCliente', cliente },
      { type: 'lancarItem', produto: caneta, quantidade: 1, valorUnitario: 2.5 },
    )

    expect(semErros(validar(state))).toBe(true)
  })
})

describe('errosDoServidor', () => {
  it('associa os erros indexados da API (itens[i].campo) às linhas da tela', () => {
    const state = aplicar(
      { type: 'lancarItem', produto: caneta, quantidade: 1, valorUnitario: 2.5 },
      { type: 'lancarItem', produto: caderno, quantidade: 1, valorUnitario: 19.9 },
    )

    const erros = errosDoServidor(
      { clienteId: 'Cliente não encontrado.', 'itens[1].produtoId': 'Produto não encontrado.' },
      state.itens,
    )

    expect(erros.cliente).toBe('Cliente não encontrado.')
    expect(erros.linhas[state.itens[1].chave]).toEqual({ produto: 'Produto não encontrado.' })
    expect(erros.linhas[state.itens[0].chave]).toBeUndefined()
  })
})

describe('toCriarVendaRequest', () => {
  it('monta o payload da API', () => {
    const state: NovaVendaState = aplicar(
      { type: 'definirCliente', cliente },
      { type: 'definirData', dataVenda: '2026-10-01' },
      { type: 'lancarItem', produto: caneta, quantidade: 2, valorUnitario: 2.5 },
    )

    expect(toCriarVendaRequest(state)).toEqual({
      clienteId: 1,
      dataVenda: '2026-10-01',
      itens: [{ produtoId: 10, quantidade: 2, valorUnitario: 2.5 }],
    })
  })
})
