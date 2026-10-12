using Microsoft.EntityFrameworkCore;
using Sophia.Application.Abstractions;
using Sophia.Application.Common.Models;
using Sophia.Domain.Entities;

namespace Sophia.Infrastructure.Persistence.Repositories;

internal sealed class ClienteRepository(SophiaDbContext context) : IClienteRepository
{
    public Task<Cliente?> ObterPorIdAsync(int id, CancellationToken cancellationToken = default) =>
        context.Clientes.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

    public Task<bool> ExisteAsync(int id, CancellationToken cancellationToken = default) =>
        context.Clientes.AnyAsync(c => c.Id == id, cancellationToken);

    public Task<bool> ExisteCpfAsync(string cpf, int? ignorarId = null, CancellationToken cancellationToken = default) =>
        context.Clientes.AnyAsync(c => c.Cpf.Numero == cpf && c.Id != ignorarId, cancellationToken);

    public Task<bool> PossuiVendasAsync(int id, CancellationToken cancellationToken = default) =>
        context.Vendas.AnyAsync(v => v.ClienteId == id, cancellationToken);

    public Task<PagedResult<Cliente>> ListarAsync(string? busca, Paginacao paginacao, CancellationToken cancellationToken = default)
    {
        var query = context.Clientes.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(busca))
        {
            var termo = busca.Trim();
            var padraoNome = LikePattern.Contem(termo);
            var digitos = new string(termo.Where(char.IsDigit).ToArray());

            if (digitos.Length > 0)
            {
                var padraoCpf = LikePattern.IniciaCom(digitos);
                query = query.Where(c => EF.Functions.ILike(c.Nome, padraoNome) || EF.Functions.Like(c.Cpf.Numero, padraoCpf));
            }
            else
            {
                query = query.Where(c => EF.Functions.ILike(c.Nome, padraoNome));
            }
        }

        return query
            .OrderBy(c => c.Nome)
            .ThenBy(c => c.Id)
            .ToPagedResultAsync(paginacao, cancellationToken);
    }

    public void Adicionar(Cliente cliente) => context.Clientes.Add(cliente);

    public void Remover(Cliente cliente) => context.Clientes.Remove(cliente);
}
