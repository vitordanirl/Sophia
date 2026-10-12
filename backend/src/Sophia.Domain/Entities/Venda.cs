using Sophia.Domain.Common;

namespace Sophia.Domain.Entities;

public class Venda : Entity
{
    private readonly List<ItemVenda> _itens = [];

    public DateOnly DataVenda { get; private set; }
    public int ClienteId { get; private set; }
    public Cliente Cliente { get; private set; } = null!;
    public IReadOnlyCollection<ItemVenda> Itens => _itens.AsReadOnly();

    public decimal Total => _itens.Sum(i => i.Subtotal);

    // Construtor usado pelo EF Core
    private Venda() { }

    private Venda(int clienteId, DateOnly dataVenda)
    {
        if (clienteId <= 0)
            throw new DomainException("O cliente da venda é obrigatório.");

        ClienteId = clienteId;
        DataVenda = dataVenda;
    }

    /// <summary>
    /// Cria uma venda com todos os seus itens em uma única operação.
    /// </summary>
    public static Venda Criar(int clienteId, DateOnly dataVenda, IEnumerable<NovoItemVenda> itens)
    {
        ArgumentNullException.ThrowIfNull(itens);

        var venda = new Venda(clienteId, dataVenda);

        foreach (var item in itens)
            venda.AdicionarItem(item.ProdutoId, item.Quantidade, item.ValorUnitario);

        if (venda._itens.Count == 0)
            throw new DomainException("A venda deve possuir pelo menos um item.");

        return venda;
    }

    /// <summary>
    /// Lança um produto na venda. Se o produto já foi lançado com o mesmo valor
    /// unitário, a quantidade é somada ao item existente.
    /// </summary>
    private void AdicionarItem(int produtoId, int quantidade, decimal valorUnitario)
    {
        var existente = _itens.SingleOrDefault(i => i.ProdutoId == produtoId);

        if (existente is null)
        {
            _itens.Add(new ItemVenda(produtoId, quantidade, valorUnitario));
            return;
        }

        if (existente.ValorUnitario != valorUnitario)
            throw new DomainException("O mesmo produto não pode ser lançado com valores unitários diferentes na mesma venda.");

        existente.AdicionarQuantidade(quantidade);
    }
}

public sealed record NovoItemVenda(int ProdutoId, int Quantidade, decimal ValorUnitario);
