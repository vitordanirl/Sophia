namespace Sophia.Application.Common.Models;

public sealed record Paginacao(int Pagina = 1, int TamanhoPagina = Paginacao.TamanhoPadrao)
{
    public const int TamanhoPadrao = 20;
    public const int TamanhoMaximo = 100;

    public int PaginaNormalizada => Math.Max(Pagina, 1);
    public int TamanhoNormalizado => Math.Clamp(TamanhoPagina, 1, TamanhoMaximo);
    public int Deslocamento => (PaginaNormalizada - 1) * TamanhoNormalizado;
}
