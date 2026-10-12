using FluentValidation;
using Sophia.Application.Abstractions;
using Sophia.Application.Common.Exceptions;
using Sophia.Application.Common.Models;
using Sophia.Domain.Entities;
using Sophia.Domain.ValueObjects;

namespace Sophia.Application.Clientes;

public sealed class ClienteService(
    IClienteRepository clienteRepository,
    IUnitOfWork unitOfWork,
    IValidator<ClienteRequest> validator) : IClienteService
{
    public async Task<PagedResult<ClienteResponse>> ListarAsync(string? busca, Paginacao paginacao, CancellationToken cancellationToken = default)
    {
        var clientes = await clienteRepository.ListarAsync(busca, paginacao, cancellationToken);
        return clientes.Map(c => c.ToResponse());
    }

    public async Task<ClienteResponse> ObterPorIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var cliente = await ObterExistenteAsync(id, cancellationToken);
        return cliente.ToResponse();
    }

    public async Task<ClienteResponse> CriarAsync(ClienteRequest request, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAndThrowAsync(request, cancellationToken);

        var cpf = Cpf.Criar(request.Cpf);
        await GarantirCpfDisponivelAsync(cpf, ignorarId: null, cancellationToken);

        var cliente = new Cliente(cpf, request.Nome, request.DataNascimento, request.Email, request.Telefone);

        clienteRepository.Adicionar(cliente);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return cliente.ToResponse();
    }

    public async Task<ClienteResponse> AtualizarAsync(int id, ClienteRequest request, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAndThrowAsync(request, cancellationToken);

        var cliente = await ObterExistenteAsync(id, cancellationToken);

        var cpf = Cpf.Criar(request.Cpf);
        await GarantirCpfDisponivelAsync(cpf, ignorarId: id, cancellationToken);

        cliente.Atualizar(cpf, request.Nome, request.DataNascimento, request.Email, request.Telefone);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return cliente.ToResponse();
    }

    public async Task ExcluirAsync(int id, CancellationToken cancellationToken = default)
    {
        var cliente = await ObterExistenteAsync(id, cancellationToken);

        if (await clienteRepository.PossuiVendasAsync(id, cancellationToken))
            throw new ConflictException("Não é possível excluir o cliente pois ele possui vendas registradas.");

        clienteRepository.Remover(cliente);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task<Cliente> ObterExistenteAsync(int id, CancellationToken cancellationToken) =>
        await clienteRepository.ObterPorIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Cliente {id} não encontrado.");

    private async Task GarantirCpfDisponivelAsync(Cpf cpf, int? ignorarId, CancellationToken cancellationToken)
    {
        if (await clienteRepository.ExisteCpfAsync(cpf.Numero, ignorarId, cancellationToken))
            throw new ConflictException($"Já existe um cliente cadastrado com o CPF {cpf.Formatado}.");
    }
}
