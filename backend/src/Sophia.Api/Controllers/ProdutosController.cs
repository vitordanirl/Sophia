using Microsoft.AspNetCore.Mvc;
using Sophia.Application.Common.Models;
using Sophia.Application.Produtos;

namespace Sophia.Api.Controllers;

[ApiController]
[Route("api/produtos")]
[Produces("application/json")]
public class ProdutosController(IProdutoService produtoService) : ControllerBase
{
    /// <summary>Lista produtos, com busca por parte do nome.</summary>
    /// <param name="busca">Parte do nome do produto.</param>
    /// <param name="pagina">Página (a partir de 1).</param>
    /// <param name="tamanhoPagina">Itens por página (máximo 100).</param>
    [HttpGet]
    [ProducesResponseType<PagedResult<ProdutoResponse>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Listar(
        [FromQuery] string? busca,
        [FromQuery] int pagina = 1,
        [FromQuery] int tamanhoPagina = Paginacao.TamanhoPadrao,
        CancellationToken cancellationToken = default)
    {
        var produtos = await produtoService.ListarAsync(busca, new Paginacao(pagina, tamanhoPagina), cancellationToken);
        return Ok(produtos);
    }

    /// <summary>Obtém um produto pelo identificador.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType<ProdutoResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Obter(int id, CancellationToken cancellationToken)
    {
        var produto = await produtoService.ObterPorIdAsync(id, cancellationToken);
        return Ok(produto);
    }

    /// <summary>Cadastra um produto. O nome não pode se repetir (sem diferenciar maiúsculas/minúsculas).</summary>
    [HttpPost]
    [ProducesResponseType<ProdutoResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Criar(ProdutoRequest request, CancellationToken cancellationToken)
    {
        var produto = await produtoService.CriarAsync(request, cancellationToken);
        return CreatedAtAction(nameof(Obter), new { id = produto.Id }, produto);
    }

    /// <summary>Altera os dados de um produto. Vendas já realizadas mantêm o valor praticado.</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType<ProdutoResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Atualizar(int id, ProdutoRequest request, CancellationToken cancellationToken)
    {
        var produto = await produtoService.AtualizarAsync(id, request, cancellationToken);
        return Ok(produto);
    }

    /// <summary>Exclui um produto. Produtos já vendidos não podem ser excluídos.</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Excluir(int id, CancellationToken cancellationToken)
    {
        await produtoService.ExcluirAsync(id, cancellationToken);
        return NoContent();
    }
}
