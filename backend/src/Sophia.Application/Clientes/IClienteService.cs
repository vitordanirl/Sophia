using Sophia.Application.Common.Models;

namespace Sophia.Application.Clientes;

public interface IClienteService
{
    Task<PagedResult<ClienteResponse>> ListarAsync(string? busca, Paginacao paginacao, CancellationToken cancellationToken = default);
    Task<ClienteResponse> ObterPorIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ClienteResponse> CriarAsync(ClienteRequest request, CancellationToken cancellationToken = default);
    Task<ClienteResponse> AtualizarAsync(int id, ClienteRequest request, CancellationToken cancellationToken = default);
    Task ExcluirAsync(int id, CancellationToken cancellationToken = default);
}
