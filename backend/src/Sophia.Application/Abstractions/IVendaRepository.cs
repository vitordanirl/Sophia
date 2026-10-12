using Sophia.Application.Common.Models;
using Sophia.Application.Vendas;
using Sophia.Domain.Entities;

namespace Sophia.Application.Abstractions;

public interface IVendaRepository
{
    /// <summary>
    /// Obtém a venda completa: cliente e itens com seus produtos.
    /// </summary>
    Task<Venda?> ObterPorIdAsync(int id, CancellationToken cancellationToken = default);

    Task<PagedResult<VendaResumoResponse>> ListarAsync(VendaFiltro filtro, Paginacao paginacao, CancellationToken cancellationToken = default);

    void Adicionar(Venda venda);
    void Remover(Venda venda);
}
