using Sophia.Application.Common.Models;
using Sophia.Domain.Entities;

namespace Sophia.Application.Abstractions;

public interface IProdutoRepository
{
    Task<Produto?> ObterPorIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<int>> ObterIdsExistentesAsync(IEnumerable<int> ids, CancellationToken cancellationToken = default);
    Task<bool> ExisteNomeAsync(string nome, int? ignorarId = null, CancellationToken cancellationToken = default);
    Task<bool> PossuiVendasAsync(int id, CancellationToken cancellationToken = default);
    Task<PagedResult<Produto>> ListarAsync(string? busca, Paginacao paginacao, CancellationToken cancellationToken = default);

    void Adicionar(Produto produto);
    void Remover(Produto produto);
}
