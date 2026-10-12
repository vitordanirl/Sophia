namespace Sophia.Application.Common.Models;

public sealed record PagedResult<T>(IReadOnlyList<T> Itens, int Pagina, int TamanhoPagina, int TotalItens)
{
    public int TotalPaginas => TamanhoPagina == 0 ? 0 : (int)Math.Ceiling(TotalItens / (double)TamanhoPagina);

    public PagedResult<TDestino> Map<TDestino>(Func<T, TDestino> map) =>
        new(Itens.Select(map).ToList(), Pagina, TamanhoPagina, TotalItens);
}
