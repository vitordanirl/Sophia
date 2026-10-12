using Microsoft.EntityFrameworkCore;
using Sophia.Application.Common.Models;

namespace Sophia.Infrastructure.Persistence;

internal static class QueryableExtensions
{
    public static async Task<PagedResult<T>> ToPagedResultAsync<T>(
        this IQueryable<T> query,
        Paginacao paginacao,
        CancellationToken cancellationToken)
    {
        var total = await query.CountAsync(cancellationToken);

        var itens = await query
            .Skip(paginacao.Deslocamento)
            .Take(paginacao.TamanhoNormalizado)
            .ToListAsync(cancellationToken);

        return new PagedResult<T>(itens, paginacao.PaginaNormalizada, paginacao.TamanhoNormalizado, total);
    }
}

/// <summary>
/// Monta padrões para LIKE/ILIKE escapando os curingas digitados pelo usuário.
/// </summary>
internal static class LikePattern
{
    public static string Exato(string valor) => Escapar(valor);
    public static string Contem(string valor) => $"%{Escapar(valor)}%";
    public static string IniciaCom(string valor) => $"{Escapar(valor)}%";

    // No PostgreSQL a barra invertida é o caractere de escape padrão do LIKE
    private static string Escapar(string valor) => valor
        .Replace(@"\", @"\\")
        .Replace("%", @"\%")
        .Replace("_", @"\_");
}
