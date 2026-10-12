using FluentAssertions;
using Sophia.Domain.Common;
using Sophia.Domain.Entities;

namespace Sophia.Domain.Tests.Entities;

public class VendaTests
{
    private const int ClienteId = 1;
    private static readonly DateOnly Hoje = new(2026, 10, 12);

    [Fact]
    public void Criar_CalculaSubtotalPorItemETotalDaVenda()
    {
        var venda = Venda.Criar(ClienteId, Hoje,
        [
            new NovoItemVenda(ProdutoId: 1, Quantidade: 3, ValorUnitario: 2.50m),
            new NovoItemVenda(ProdutoId: 2, Quantidade: 2, ValorUnitario: 19.90m),
        ]);

        venda.Itens.Should().HaveCount(2);
        venda.Itens.Single(i => i.ProdutoId == 1).Subtotal.Should().Be(7.50m);
        venda.Itens.Single(i => i.ProdutoId == 2).Subtotal.Should().Be(39.80m);
        venda.Total.Should().Be(47.30m);
        venda.ClienteId.Should().Be(ClienteId);
        venda.DataVenda.Should().Be(Hoje);
    }

    [Fact]
    public void Criar_ComMesmoProdutoEMesmoValor_SomaAsQuantidadesEmUmUnicoItem()
    {
        var venda = Venda.Criar(ClienteId, Hoje,
        [
            new NovoItemVenda(1, 2, 10m),
            new NovoItemVenda(1, 3, 10m),
        ]);

        venda.Itens.Should().ContainSingle()
            .Which.Quantidade.Should().Be(5);
        venda.Total.Should().Be(50m);
    }

    [Fact]
    public void Criar_ComMesmoProdutoEValoresDiferentes_LancaDomainException()
    {
        var criar = () => Venda.Criar(ClienteId, Hoje,
        [
            new NovoItemVenda(1, 1, 10m),
            new NovoItemVenda(1, 1, 9m),
        ]);

        criar.Should().Throw<DomainException>().WithMessage("*valores unitários diferentes*");
    }

    [Fact]
    public void Criar_SemItens_LancaDomainException()
    {
        var criar = () => Venda.Criar(ClienteId, Hoje, []);

        criar.Should().Throw<DomainException>().WithMessage("A venda deve possuir pelo menos um item.");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Criar_SemCliente_LancaDomainException(int clienteId)
    {
        var criar = () => Venda.Criar(clienteId, Hoje, [new NovoItemVenda(1, 1, 10m)]);

        criar.Should().Throw<DomainException>().WithMessage("O cliente da venda é obrigatório.");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    public void Criar_ComQuantidadeInvalida_LancaDomainException(int quantidade)
    {
        var criar = () => Venda.Criar(ClienteId, Hoje, [new NovoItemVenda(1, quantidade, 10m)]);

        criar.Should().Throw<DomainException>().WithMessage("A quantidade do item deve ser maior que zero.");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-10)]
    public void Criar_ComValorUnitarioInvalido_LancaDomainException(decimal valor)
    {
        var criar = () => Venda.Criar(ClienteId, Hoje, [new NovoItemVenda(1, 1, valor)]);

        criar.Should().Throw<DomainException>().WithMessage("O valor unitário do item deve ser maior que zero.");
    }

    [Fact]
    public void Criar_SemProduto_LancaDomainException()
    {
        var criar = () => Venda.Criar(ClienteId, Hoje, [new NovoItemVenda(0, 1, 10m)]);

        criar.Should().Throw<DomainException>().WithMessage("O produto do item é obrigatório.");
    }
}
