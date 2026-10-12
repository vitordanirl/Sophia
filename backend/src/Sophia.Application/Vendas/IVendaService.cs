using Sophia.Application.Common.Models;

namespace Sophia.Application.Vendas;

public interface IVendaService
{
    Task<PagedResult<VendaResumoResponse>> ListarAsync(VendaFiltro filtro, Paginacao paginacao, CancellationToken cancellationToken = default);
    Task<VendaResponse> ObterPorIdAsync(int id, CancellationToken cancellationToken = default);
    Task<VendaResponse> CriarAsync(CriarVendaRequest request, CancellationToken cancellationToken = default);
    Task ExcluirAsync(int id, CancellationToken cancellationToken = default);
}
