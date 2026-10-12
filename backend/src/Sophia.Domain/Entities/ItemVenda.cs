using Sophia.Domain.Common;

namespace Sophia.Domain.Entities;

public class ItemVenda : Entity
{
    public int VendaId { get; private set; }
    public int ProdutoId { get; private set; }
    public Produto Produto { get; private set; } = null!;
    public int Quantidade { get; private set; }

    /// <summary>
    /// Preço praticado no momento da venda. Fica gravado no item para que
    /// alterações futuras no cadastro do produto não mudem vendas já realizadas.
    /// </summary>
    public decimal ValorUnitario { get; private set; }

    public decimal Subtotal => Quantidade * ValorUnitario;

    // Construtor usado pelo EF Core
    private ItemVenda() { }

    internal ItemVenda(int produtoId, int quantidade, decimal valorUnitario)
    {
        if (produtoId <= 0)
            throw new DomainException("O produto do item é obrigatório.");

        if (valorUnitario <= 0)
            throw new DomainException("O valor unitário do item deve ser maior que zero.");

        ProdutoId = produtoId;
        ValorUnitario = valorUnitario;
        DefinirQuantidade(quantidade);
    }

    internal void AdicionarQuantidade(int quantidade) => DefinirQuantidade(Quantidade + quantidade);

    private void DefinirQuantidade(int quantidade)
    {
        if (quantidade <= 0)
            throw new DomainException("A quantidade do item deve ser maior que zero.");

        Quantidade = quantidade;
    }
}
