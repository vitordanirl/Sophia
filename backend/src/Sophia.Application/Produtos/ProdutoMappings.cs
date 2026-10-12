using Sophia.Domain.Entities;

namespace Sophia.Application.Produtos;

internal static class ProdutoMappings
{
    public static ProdutoResponse ToResponse(this Produto produto) =>
        new(produto.Id, produto.Nome, produto.ValorUnitario);
}
