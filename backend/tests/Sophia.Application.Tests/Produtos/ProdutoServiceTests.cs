using FluentAssertions;
using FluentValidation;
using NSubstitute;
using Sophia.Application.Abstractions;
using Sophia.Application.Common.Exceptions;
using Sophia.Application.Produtos;
using Sophia.Application.Tests.Support;
using Sophia.Domain.Entities;

namespace Sophia.Application.Tests.Produtos;

public class ProdutoServiceTests
{
    private readonly IProdutoRepository _repository = Substitute.For<IProdutoRepository>();
    private readonly IUnitOfWork _unitOfWork = Substitute.For<IUnitOfWork>();
    private readonly ProdutoService _service;

    public ProdutoServiceTests()
    {
        _service = new ProdutoService(_repository, _unitOfWork, new ProdutoRequestValidator());
    }

    [Fact]
    public async Task CriarAsync_ComDadosValidos_AdicionaESalva()
    {
        var response = await _service.CriarAsync(new ProdutoRequest("  Caneta Azul ", 2.50m));

        response.Nome.Should().Be("Caneta Azul");
        response.ValorUnitario.Should().Be(2.50m);
        _repository.Received(1).Adicionar(Arg.Any<Produto>());
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CriarAsync_ComNomeDuplicado_VerificaNomeSemEspacosELancaConflict()
    {
        _repository.ExisteNomeAsync("Caneta Azul", null, Arg.Any<CancellationToken>()).Returns(true);

        var criar = () => _service.CriarAsync(new ProdutoRequest("  Caneta Azul  ", 3m));

        await criar.Should().ThrowAsync<ConflictException>().WithMessage("*\"Caneta Azul\"*");
        _repository.DidNotReceive().Adicionar(Arg.Any<Produto>());
    }

    [Theory]
    [InlineData("", 10, nameof(ProdutoRequest.Nome))]
    [InlineData("Caneta", 0, nameof(ProdutoRequest.ValorUnitario))]
    [InlineData("Caneta", 1.999, nameof(ProdutoRequest.ValorUnitario))]
    public async Task CriarAsync_ComDadosInvalidos_LancaValidation(string nome, decimal valor, string campoComErro)
    {
        var criar = () => _service.CriarAsync(new ProdutoRequest(nome, valor));

        var erro = await criar.Should().ThrowAsync<ValidationException>();
        erro.Which.Errors.Should().Contain(e => e.PropertyName == campoComErro);
    }

    [Fact]
    public async Task AtualizarAsync_ComNomeDeOutroProduto_LancaConflict()
    {
        var produto = new Produto("Caneta", 2m).ComId(3);
        _repository.ObterPorIdAsync(3, Arg.Any<CancellationToken>()).Returns(produto);
        _repository.ExisteNomeAsync("Lápis", 3, Arg.Any<CancellationToken>()).Returns(true);

        var atualizar = () => _service.AtualizarAsync(3, new ProdutoRequest("Lápis", 2m));

        await atualizar.Should().ThrowAsync<ConflictException>();
        produto.Nome.Should().Be("Caneta");
    }

    [Fact]
    public async Task ExcluirAsync_ProdutoJaVendido_LancaConflict()
    {
        var produto = new Produto("Caneta", 2m).ComId(1);
        _repository.ObterPorIdAsync(1, Arg.Any<CancellationToken>()).Returns(produto);
        _repository.PossuiVendasAsync(1, Arg.Any<CancellationToken>()).Returns(true);

        var excluir = () => _service.ExcluirAsync(1);

        await excluir.Should().ThrowAsync<ConflictException>();
        _repository.DidNotReceive().Remover(Arg.Any<Produto>());
    }

    [Fact]
    public async Task ObterPorIdAsync_ProdutoInexistente_LancaNotFound()
    {
        var obter = () => _service.ObterPorIdAsync(42);

        await obter.Should().ThrowAsync<NotFoundException>().WithMessage("Produto 42 não encontrado.");
    }
}
