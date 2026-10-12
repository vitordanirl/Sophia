using Sophia.Domain.Entities;

namespace Sophia.Application.Vendas;

internal static class VendaMappings
{
    public static VendaResponse ToResponse(this Venda venda) => new(
        venda.Id,
        venda.DataVenda,
        new VendaClienteResponse(venda.Cliente.Id, venda.Cliente.Cpf.Numero, venda.Cliente.Nome),
        venda.Itens
            .Select(i => new ItemVendaResponse(i.Id, i.ProdutoId, i.Produto.Nome, i.Quantidade, i.ValorUnitario, i.Subtotal))
            .ToList(),
        venda.Total);
}
