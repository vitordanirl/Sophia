using FluentAssertions;
using FluentValidation;
using Microsoft.Extensions.Time.Testing;
using NSubstitute;
using Sophia.Application.Abstractions;
using Sophia.Application.Common.Exceptions;
using Sophia.Application.Tests.Support;
using Sophia.Application.Vendas;
using Sophia.Domain.Common;
using Sophia.Domain.Entities;
using Sophia.Domain.ValueObjects;

namespace Sophia.Application.Tests.Vendas;

public class VendaServiceTests
{
    private static readonly DateOnly Hoje = new(2026, 10, 12);

    private readonly IVendaRepository _vendaRepository = Substitute.For<IVendaRepository>();
    private readonly IClienteRepository _clienteRepository = Substitute.For<IClienteRepository>();
    private readonly IProdutoRepository _produtoRepository = Substitute.For<IProdutoRepository>();
    private readonly IUnitOfWork _unitOfWork = Substitute.For<IUnitOfWork>();
    private readonly VendaService _service;

    private readonly Cliente _cliente = new Cliente(Cpf.Criar("52998224725"), "Ana Souza", null, null, null).ComId(1);
    private readonly Produto _caneta = new Produto("Caneta", 2.50m).ComId(10);
    private readonly Produto _caderno = new Produto("Caderno", 19.90m).ComId(20);

    private Venda? _vendaAdicionada;

    public VendaServiceTests()
    {
        var timeProvider = new FakeTimeProvider(new DateTimeOffset(Hoje.ToDateTime(new TimeOnly(15, 0)), TimeSpan.Zero));
        timeProvider.SetLocalTimeZone(TimeZoneInfo.Utc);

        _service = new VendaService(
            _vendaRepository, _clienteRepository, _produtoRepository, _unitOfWork,
            new CriarVendaRequestValidator(), new VendaFiltroValidator(), timeProvider);

        _clienteRepository.ExisteAsync(_cliente.Id, Arg.Any<CancellationToken>()).Returns(true);
        _produtoRepository.ObterIdsExistentesAsync(Arg.Any<IEnumerable<int>>(), Arg.Any<CancellationToken>())
            .Returns(call => call.Arg<IEnumerable<int>>().Where(id => id is 10 or 20).ToList());

        // Simula a gravação e a releitura da venda com cliente e produtos, como o EF faria
        _vendaRepository.When(r => r.Adicionar(Arg.Any<Venda>())).Do(call => _vendaAdicionada = call.Arg<Venda>());
        _vendaRepository.ObterPorIdAsync(Arg.Any<int>(), Arg.Any<CancellationToken>()).Returns(_ => CarregarVendaAdicionada());
    }

    private Venda? CarregarVendaAdicionada()
    {
        if (_vendaAdicionada is null)
            return null;

        _vendaAdicionada.Definir(nameof(Venda.Cliente), _cliente);
        foreach (var item in _vendaAdicionada.Itens)
            item.Definir(nameof(ItemVenda.Produto), item.ProdutoId == _caneta.Id ? _caneta : _caderno);

        return _vendaAdicionada;
    }

    [Fact]
    public async Task CriarAsync_ComDadosValidos_SalvaERetornaTotalizadores()
    {
        var request = new CriarVendaRequest(_cliente.Id, new DateOnly(2026, 10, 1),
        [
            new ItemVendaRequest(_caneta.Id, 4, 2.50m),
            new ItemVendaRequest(_caderno.Id, 2, 18.00m),
        ]);

        var response = await _service.CriarAsync(request);

        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        response.DataVenda.Should().Be(new DateOnly(2026, 10, 1));
        response.Cliente.Nome.Should().Be("Ana Souza");
        response.Cliente.Cpf.Should().Be("52998224725");
        response.Itens.Should().BeEquivalentTo(new[]
        {
            new { ProdutoNome = "Caneta", Quantidade = 4, ValorUnitario = 2.50m, Subtotal = 10.00m },
            new { ProdutoNome = "Caderno", Quantidade = 2, ValorUnitario = 18.00m, Subtotal = 36.00m },
        });
        response.Total.Should().Be(46.00m);
    }

    [Fact]
    public async Task CriarAsync_SemDataInformada_UsaADataDeHoje()
    {
        var request = new CriarVendaRequest(_cliente.Id, null, [new ItemVendaRequest(_caneta.Id, 1, 2.50m)]);

        var response = await _service.CriarAsync(request);

        response.DataVenda.Should().Be(Hoje);
    }

    [Fact]
    public async Task CriarAsync_ComClienteEProdutoInexistentes_ApontaOsCamposComErro()
    {
        var request = new CriarVendaRequest(999,
            null,
            [
                new ItemVendaRequest(_caneta.Id, 1, 2.50m),
                new ItemVendaRequest(777, 1, 5m),
            ]);

        var criar = () => _service.CriarAsync(request);

        var erro = await criar.Should().ThrowAsync<ValidationException>();
        erro.Which.Errors.Select(e => e.PropertyName).Should().BeEquivalentTo("ClienteId", "Itens[1].ProdutoId");
        _vendaRepository.DidNotReceive().Adicionar(Arg.Any<Venda>());
    }

    [Fact]
    public async Task CriarAsync_SemItens_LancaValidation()
    {
        var criar = () => _service.CriarAsync(new CriarVendaRequest(_cliente.Id, null, []));

        var erro = await criar.Should().ThrowAsync<ValidationException>();
        erro.Which.Errors.Should().ContainSingle(e => e.PropertyName == "Itens");
    }

    [Fact]
    public async Task CriarAsync_ComItemInvalido_LancaValidationComIndiceDoItem()
    {
        var request = new CriarVendaRequest(_cliente.Id, null,
        [
            new ItemVendaRequest(_caneta.Id, 1, 2.50m),
            new ItemVendaRequest(_caderno.Id, 0, 19.90m),
        ]);

        var criar = () => _service.CriarAsync(request);

        var erro = await criar.Should().ThrowAsync<ValidationException>();
        erro.Which.Errors.Should().ContainSingle(e => e.PropertyName == "Itens[1].Quantidade");
    }

    [Fact]
    public async Task CriarAsync_MesmoProdutoComValoresDiferentes_PropagaRegraDoDominio()
    {
        var request = new CriarVendaRequest(_cliente.Id, null,
        [
            new ItemVendaRequest(_caneta.Id, 1, 2.50m),
            new ItemVendaRequest(_caneta.Id, 1, 2.00m),
        ]);

        var criar = () => _service.CriarAsync(request);

        await criar.Should().ThrowAsync<DomainException>();
        await _unitOfWork.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ListarAsync_ComDataFinalAnteriorAInicial_LancaValidation()
    {
        var filtro = new VendaFiltro(DataInicio: new DateOnly(2026, 10, 10), DataFim: new DateOnly(2026, 10, 1));

        var listar = () => _service.ListarAsync(filtro, new());

        await listar.Should().ThrowAsync<ValidationException>();
    }

    [Fact]
    public async Task ExcluirAsync_VendaInexistente_LancaNotFound()
    {
        var excluir = () => _service.ExcluirAsync(5);

        await excluir.Should().ThrowAsync<NotFoundException>().WithMessage("Venda 5 não encontrada.");
    }
}
