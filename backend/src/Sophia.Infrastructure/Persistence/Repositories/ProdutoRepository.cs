using Microsoft.EntityFrameworkCore;
using Sophia.Application.Abstractions;
using Sophia.Application.Common.Models;
using Sophia.Domain.Entities;

namespace Sophia.Infrastructure.Persistence.Repositories;

internal sealed class ProdutoRepository(SophiaDbContext context) : IProdutoRepository
{
    public Task<Produto?> ObterPorIdAsync(int id, CancellationToken cancellationToken = default) =>
        context.Produtos.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public async Task<IReadOnlyList<int>> ObterIdsExistentesAsync(IEnumerable<int> ids, CancellationToken cancellationToken = default)
    {
        var lista = ids.ToList();

        return await context.Produtos
            .Where(p => lista.Contains(p.Id))
            .Select(p => p.Id)
            .ToListAsync(cancellationToken);
    }

    // ILIKE sem curingas: comparação exata ignorando maiúsculas/minúsculas, igual ao índice único (citext)
    public Task<bool> ExisteNomeAsync(string nome, int? ignorarId = null, CancellationToken cancellationToken = default) =>
        context.Produtos.AnyAsync(p => EF.Functions.ILike(p.Nome, LikePattern.Exato(nome)) && p.Id != ignorarId, cancellationToken);

    public Task<bool> PossuiVendasAsync(int id, CancellationToken cancellationToken = default) =>
        context.Set<ItemVenda>().AnyAsync(i => i.ProdutoId == id, cancellationToken);

    public Task<PagedResult<Produto>> ListarAsync(string? busca, Paginacao paginacao, CancellationToken cancellationToken = default)
    {
        var query = context.Produtos.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(busca))
        {
            var padrao = LikePattern.Contem(busca.Trim());
            query = query.Where(p => EF.Functions.ILike(p.Nome, padrao));
        }

        return query
            .OrderBy(p => p.Nome)
            .ThenBy(p => p.Id)
            .ToPagedResultAsync(paginacao, cancellationToken);
    }

    public void Adicionar(Produto produto) => context.Produtos.Add(produto);

    public void Remover(Produto produto) => context.Produtos.Remove(produto);
}
