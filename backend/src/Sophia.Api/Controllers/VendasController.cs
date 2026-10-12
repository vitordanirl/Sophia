using Microsoft.AspNetCore.Mvc;
using Sophia.Application.Common.Models;
using Sophia.Application.Vendas;

namespace Sophia.Api.Controllers;

[ApiController]
[Route("api/vendas")]
[Produces("application/json")]
public class VendasController(IVendaService vendaService) : ControllerBase
{
    /// <summary>Lista as vendas (mais recentes primeiro) com cliente e total.</summary>
    /// <param name="dataInicio">Data inicial, inclusive (yyyy-MM-dd).</param>
    /// <param name="dataFim">Data final, inclusive (yyyy-MM-dd).</param>
    /// <param name="clienteId">Somente vendas deste cliente.</param>
    /// <param name="pagina">Página (a partir de 1).</param>
    /// <param name="tamanhoPagina">Itens por página (máximo 100).</param>
    [HttpGet]
    [ProducesResponseType<PagedResult<VendaResumoResponse>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Listar(
        [FromQuery] DateOnly? dataInicio,
        [FromQuery] DateOnly? dataFim,
        [FromQuery] int? clienteId,
        [FromQuery] int pagina = 1,
        [FromQuery] int tamanhoPagina = Paginacao.TamanhoPadrao,
        CancellationToken cancellationToken = default)
    {
        var filtro = new VendaFiltro(dataInicio, dataFim, clienteId);
        var vendas = await vendaService.ListarAsync(filtro, new Paginacao(pagina, tamanhoPagina), cancellationToken);
        return Ok(vendas);
    }

    /// <summary>Obtém uma venda completa, com itens e totalizadores.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType<VendaResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Obter(int id, CancellationToken cancellationToken)
    {
        var venda = await vendaService.ObterPorIdAsync(id, cancellationToken);
        return Ok(venda);
    }

    /// <summary>Registra uma venda com todos os seus itens em uma única operação.</summary>
    [HttpPost]
    [ProducesResponseType<VendaResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Criar(CriarVendaRequest request, CancellationToken cancellationToken)
    {
        var venda = await vendaService.CriarAsync(request, cancellationToken);
        return CreatedAtAction(nameof(Obter), new { id = venda.Id }, venda);
    }

    /// <summary>Exclui uma venda e seus itens.</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Excluir(int id, CancellationToken cancellationToken)
    {
        await vendaService.ExcluirAsync(id, cancellationToken);
        return NoContent();
    }
}
