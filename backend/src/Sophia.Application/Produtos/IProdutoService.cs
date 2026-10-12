using Sophia.Application.Common.Models;

namespace Sophia.Application.Produtos;

public interface IProdutoService
{
    Task<PagedResult<ProdutoResponse>> ListarAsync(string? busca, Paginacao paginacao, CancellationToken cancellationToken = default);
    Task<ProdutoResponse> ObterPorIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ProdutoResponse> CriarAsync(ProdutoRequest request, CancellationToken cancellationToken = default);
    Task<ProdutoResponse> AtualizarAsync(int id, ProdutoRequest request, CancellationToken cancellationToken = default);
    Task ExcluirAsync(int id, CancellationToken cancellationToken = default);
}
