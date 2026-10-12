using FluentAssertions;
using FluentValidation;
using Microsoft.Extensions.Time.Testing;
using NSubstitute;
using Sophia.Application.Abstractions;
using Sophia.Application.Clientes;
using Sophia.Application.Common.Exceptions;
using Sophia.Application.Tests.Support;
using Sophia.Domain.Entities;
using Sophia.Domain.ValueObjects;

namespace Sophia.Application.Tests.Clientes;

public class ClienteServiceTests
{
    private readonly IClienteRepository _repository = Substitute.For<IClienteRepository>();
    private readonly IUnitOfWork _unitOfWork = Substitute.For<IUnitOfWork>();
    private readonly ClienteService _service;

    public ClienteServiceTests()
    {
        var timeProvider = new FakeTimeProvider(new DateTimeOffset(2026, 10, 12, 12, 0, 0, TimeSpan.Zero));
        _service = new ClienteService(_repository, _unitOfWork, new ClienteRequestValidator(timeProvider));
    }

    private static ClienteRequest RequestValido(string cpf = "529.982.247-25") =>
        new(cpf, "Ana Souza", new DateOnly(1990, 3, 15), "ana@email.com", "(11) 98765-4321");

    [Fact]
    public async Task CriarAsync_ComDadosValidos_AdicionaESalva()
    {
        var response = await _service.CriarAsync(RequestValido());

        response.Cpf.Should().Be("52998224725");
        response.Nome.Should().Be("Ana Souza");
        response.Telefone.Should().Be("11987654321");
        _repository.Received(1).Adicionar(Arg.Is<Cliente>(c => c.Cpf.Numero == "52998224725"));
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CriarAsync_ComCpfDuplicado_LancaConflictESemSalvar()
    {
        _repository.ExisteCpfAsync("52998224725", null, Arg.Any<CancellationToken>()).Returns(true);

        var criar = () => _service.CriarAsync(RequestValido());

        await criar.Should().ThrowAsync<ConflictException>().WithMessage("*529.982.247-25*");
        _repository.DidNotReceive().Adicionar(Arg.Any<Cliente>());
        await _unitOfWork.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CriarAsync_ComDadosInvalidos_LancaValidationComErroPorCampo()
    {
        var request = new ClienteRequest("123.456.789-00", "", new DateOnly(2030, 1, 1), "email-invalido", "123");

        var criar = () => _service.CriarAsync(request);

        var erro = await criar.Should().ThrowAsync<ValidationException>();
        erro.Which.Errors.Select(e => e.PropertyName).Should().BeEquivalentTo(
            nameof(ClienteRequest.Cpf),
            nameof(ClienteRequest.Nome),
            nameof(ClienteRequest.DataNascimento),
            nameof(ClienteRequest.Email),
            nameof(ClienteRequest.Telefone));
        await _repository.DidNotReceiveWithAnyArgs().ExisteCpfAsync(default!);
    }

    [Fact]
    public async Task AtualizarAsync_IgnoraOProprioClienteNaVerificacaoDeCpf()
    {
        var cliente = new Cliente(Cpf.Criar("52998224725"), "Ana", null, null, null).ComId(7);
        _repository.ObterPorIdAsync(7, Arg.Any<CancellationToken>()).Returns(cliente);

        await _service.AtualizarAsync(7, RequestValido() with { Nome = "Ana Paula" });

        await _repository.Received(1).ExisteCpfAsync("52998224725", 7, Arg.Any<CancellationToken>());
        cliente.Nome.Should().Be("Ana Paula");
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AtualizarAsync_ClienteInexistente_LancaNotFound()
    {
        var atualizar = () => _service.AtualizarAsync(99, RequestValido());

        await atualizar.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task ExcluirAsync_ClienteComVendas_LancaConflictESemRemover()
    {
        var cliente = new Cliente(Cpf.Criar("52998224725"), "Ana", null, null, null).ComId(1);
        _repository.ObterPorIdAsync(1, Arg.Any<CancellationToken>()).Returns(cliente);
        _repository.PossuiVendasAsync(1, Arg.Any<CancellationToken>()).Returns(true);

        var excluir = () => _service.ExcluirAsync(1);

        await excluir.Should().ThrowAsync<ConflictException>();
        _repository.DidNotReceive().Remover(Arg.Any<Cliente>());
    }

    [Fact]
    public async Task ExcluirAsync_ClienteSemVendas_RemoveESalva()
    {
        var cliente = new Cliente(Cpf.Criar("52998224725"), "Ana", null, null, null).ComId(1);
        _repository.ObterPorIdAsync(1, Arg.Any<CancellationToken>()).Returns(cliente);

        await _service.ExcluirAsync(1);

        _repository.Received(1).Remover(cliente);
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }
}
