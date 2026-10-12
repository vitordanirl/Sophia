using FluentAssertions;
using Sophia.Domain.Common;
using Sophia.Domain.Entities;

namespace Sophia.Domain.Tests.Entities;

public class ProdutoTests
{
    [Fact]
    public void Criar_ComDadosValidos_RemoveEspacosDoNome()
    {
        var produto = new Produto("  Caneta Azul ", 2.50m);

        produto.Nome.Should().Be("Caneta Azul");
        produto.ValorUnitario.Should().Be(2.50m);
    }

    [Theory]
    [InlineData("")]
    [InlineData("  ")]
    public void Criar_SemNome_LancaDomainException(string nome)
    {
        var criar = () => new Produto(nome, 10m);

        criar.Should().Throw<DomainException>().WithMessage("O nome do produto é obrigatório.");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-0.01)]
    [InlineData(-100)]
    public void Criar_ComValorMenorOuIgualAZero_LancaDomainException(decimal valor)
    {
        var criar = () => new Produto("Caneta", valor);

        criar.Should().Throw<DomainException>().WithMessage("O valor unitário do produto deve ser maior que zero.");
    }

    [Fact]
    public void Atualizar_ComValorInvalido_MantemDadosAnteriores()
    {
        var produto = new Produto("Caneta", 2.50m);

        var atualizar = () => produto.Atualizar("Caneta Nova", 0);

        atualizar.Should().Throw<DomainException>();
        produto.Nome.Should().Be("Caneta");
        produto.ValorUnitario.Should().Be(2.50m);
    }
}
