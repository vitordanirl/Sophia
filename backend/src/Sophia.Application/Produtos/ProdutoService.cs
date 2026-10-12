using FluentValidation;
using Sophia.Application.Abstractions;
using Sophia.Application.Common.Exceptions;
using Sophia.Application.Common.Models;
using Sophia.Domain.Entities;

namespace Sophia.Application.Produtos;

public sealed class ProdutoService(
    IProdutoRepository produtoRepository,
    IUnitOfWork unitOfWork,
    IValidator<ProdutoRequest> validator) : IProdutoService
{
    public async Task<PagedResult<ProdutoResponse>> ListarAsync(string? busca, Paginacao paginacao, CancellationToken cancellationToken = default)
    {
        var produtos = await produtoRepository.ListarAsync(busca, paginacao, cancellationToken);
        return produtos.Map(p => p.ToResponse());
    }

    public async Task<ProdutoResponse> ObterPorIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var produto = await ObterExistenteAsync(id, cancellationToken);
        return produto.ToResponse();
    }

    public async Task<ProdutoResponse> CriarAsync(ProdutoRequest request, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAndThrowAsync(request, cancellationToken);
        await GarantirNomeDisponivelAsync(request.Nome, ignorarId: null, cancellationToken);

        var produto = new Produto(request.Nome, request.ValorUnitario);

        produtoRepository.Adicionar(produto);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return produto.ToResponse();
    }

    public async Task<ProdutoResponse> AtualizarAsync(int id, ProdutoRequest request, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAndThrowAsync(request, cancellationToken);

        var produto = await ObterExistenteAsync(id, cancellationToken);
        await GarantirNomeDisponivelAsync(request.Nome, ignorarId: id, cancellationToken);

        produto.Atualizar(request.Nome, request.ValorUnitario);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return produto.ToResponse();
    }

    public async Task ExcluirAsync(int id, CancellationToken cancellationToken = default)
    {
        var produto = await ObterExistenteAsync(id, cancellationToken);

        if (await produtoRepository.PossuiVendasAsync(id, cancellationToken))
            throw new ConflictException("Não é possível excluir o produto pois ele já foi utilizado em vendas.");

        produtoRepository.Remover(produto);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task<Produto> ObterExistenteAsync(int id, CancellationToken cancellationToken) =>
        await produtoRepository.ObterPorIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Produto {id} não encontrado.");

    private async Task GarantirNomeDisponivelAsync(string nome, int? ignorarId, CancellationToken cancellationToken)
    {
        var nomeNormalizado = nome.Trim();

        if (await produtoRepository.ExisteNomeAsync(nomeNormalizado, ignorarId, cancellationToken))
            throw new ConflictException($"Já existe um produto cadastrado com o nome \"{nomeNormalizado}\".");
    }
}
