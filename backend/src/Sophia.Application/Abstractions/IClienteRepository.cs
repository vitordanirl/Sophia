using Sophia.Application.Common.Models;
using Sophia.Domain.Entities;

namespace Sophia.Application.Abstractions;

public interface IClienteRepository
{
    Task<Cliente?> ObterPorIdAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ExisteAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ExisteCpfAsync(string cpf, int? ignorarId = null, CancellationToken cancellationToken = default);
    Task<bool> PossuiVendasAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Lista clientes filtrando por parte do nome ou pelo início do CPF.
    /// </summary>
    Task<PagedResult<Cliente>> ListarAsync(string? busca, Paginacao paginacao, CancellationToken cancellationToken = default);

    void Adicionar(Cliente cliente);
    void Remover(Cliente cliente);
}
