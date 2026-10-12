using Microsoft.EntityFrameworkCore;
using Sophia.Application.Abstractions;
using Sophia.Application.Common.Models;
using Sophia.Application.Vendas;
using Sophia.Domain.Entities;

namespace Sophia.Infrastructure.Persistence.Repositories;

internal sealed class VendaRepository(SophiaDbContext context) : IVendaRepository
{
    public Task<Venda?> ObterPorIdAsync(int id, CancellationToken cancellationToken = default) =>
        context.Vendas
            .Include(v => v.Cliente)
            .Include(v => v.Itens).ThenInclude(i => i.Produto)
            .AsSplitQuery()
            .FirstOrDefaultAsync(v => v.Id == id, cancellationToken);

    public Task<PagedResult<VendaResumoResponse>> ListarAsync(VendaFiltro filtro, Paginacao paginacao, CancellationToken cancellationToken = default)
    {
        var query = context.Vendas.AsNoTracking();

        if (filtro.DataInicio is { } dataInicio)
            query = query.Where(v => v.DataVenda >= dataInicio);

        if (filtro.DataFim is { } dataFim)
            query = query.Where(v => v.DataVenda <= dataFim);

        if (filtro.ClienteId is { } clienteId)
            query = query.Where(v => v.ClienteId == clienteId);

        // Projeção direto no banco: totais calculados via SQL, sem carregar os itens em memória
        return query
            .OrderByDescending(v => v.DataVenda)
            .ThenByDescending(v => v.Id)
            .Select(v => new VendaResumoResponse(
                v.Id,
                v.DataVenda,
                v.ClienteId,
                v.Cliente.Cpf.Numero,
                v.Cliente.Nome,
                v.Itens.Count,
                Math.Round(v.Itens.Sum(i => i.Quantidade * i.ValorUnitario), 2)))
            .ToPagedResultAsync(paginacao, cancellationToken);
    }

    public void Adicionar(Venda venda) => context.Vendas.Add(venda);

    public void Remover(Venda venda) => context.Vendas.Remove(venda);
}
