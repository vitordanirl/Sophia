using FluentValidation;
using FluentValidation.Results;
using Sophia.Application.Abstractions;
using Sophia.Application.Common.Exceptions;
using Sophia.Application.Common.Models;
using Sophia.Domain.Entities;

namespace Sophia.Application.Vendas;

public sealed class VendaService(
    IVendaRepository vendaRepository,
    IClienteRepository clienteRepository,
    IProdutoRepository produtoRepository,
    IUnitOfWork unitOfWork,
    IValidator<CriarVendaRequest> criarValidator,
    IValidator<VendaFiltro> filtroValidator,
    TimeProvider timeProvider) : IVendaService
{
    public async Task<PagedResult<VendaResumoResponse>> ListarAsync(VendaFiltro filtro, Paginacao paginacao, CancellationToken cancellationToken = default)
    {
        await filtroValidator.ValidateAndThrowAsync(filtro, cancellationToken);
        return await vendaRepository.ListarAsync(filtro, paginacao, cancellationToken);
    }

    public async Task<VendaResponse> ObterPorIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var venda = await ObterExistenteAsync(id, cancellationToken);
        return venda.ToResponse();
    }

    public async Task<VendaResponse> CriarAsync(CriarVendaRequest request, CancellationToken cancellationToken = default)
    {
        await criarValidator.ValidateAndThrowAsync(request, cancellationToken);
        await GarantirReferenciasExistentesAsync(request, cancellationToken);

        var dataVenda = request.DataVenda ?? DateOnly.FromDateTime(timeProvider.GetLocalNow().DateTime);
        var itens = request.Itens.Select(i => new NovoItemVenda(i.ProdutoId, i.Quantidade, i.ValorUnitario));

        var venda = Venda.Criar(request.ClienteId, dataVenda, itens);

        vendaRepository.Adicionar(venda);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        // Recarrega com cliente e produtos para montar a resposta completa
        return await ObterPorIdAsync(venda.Id, cancellationToken);
    }

    public async Task ExcluirAsync(int id, CancellationToken cancellationToken = default)
    {
        var venda = await ObterExistenteAsync(id, cancellationToken);

        vendaRepository.Remover(venda);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task<Venda> ObterExistenteAsync(int id, CancellationToken cancellationToken) =>
        await vendaRepository.ObterPorIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Venda {id} não encontrada.");

    /// <summary>
    /// Confere se o cliente e os produtos informados existem, apontando o campo exato de cada erro.
    /// </summary>
    private async Task GarantirReferenciasExistentesAsync(CriarVendaRequest request, CancellationToken cancellationToken)
    {
        var falhas = new List<ValidationFailure>();

        if (!await clienteRepository.ExisteAsync(request.ClienteId, cancellationToken))
            falhas.Add(new ValidationFailure(nameof(request.ClienteId), "Cliente não encontrado."));

        var produtosExistentes = (await produtoRepository.ObterIdsExistentesAsync(
            request.Itens.Select(i => i.ProdutoId).Distinct(), cancellationToken)).ToHashSet();

        for (var i = 0; i < request.Itens.Count; i++)
        {
            if (!produtosExistentes.Contains(request.Itens[i].ProdutoId))
                falhas.Add(new ValidationFailure($"{nameof(request.Itens)}[{i}].{nameof(ItemVendaRequest.ProdutoId)}", "Produto não encontrado."));
        }

        if (falhas.Count > 0)
            throw new ValidationException(falhas);
    }
}
