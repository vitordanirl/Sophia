using Microsoft.AspNetCore.Mvc;
using Sophia.Application.Clientes;
using Sophia.Application.Common.Models;

namespace Sophia.Api.Controllers;

[ApiController]
[Route("api/clientes")]
[Produces("application/json")]
public class ClientesController(IClienteService clienteService) : ControllerBase
{
    /// <summary>Lista clientes, com busca por parte do nome ou pelo início do CPF.</summary>
    /// <param name="busca">Nome ou CPF (com ou sem máscara).</param>
    /// <param name="pagina">Página (a partir de 1).</param>
    /// <param name="tamanhoPagina">Itens por página (máximo 100).</param>
    [HttpGet]
    [ProducesResponseType<PagedResult<ClienteResponse>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Listar(
        [FromQuery] string? busca,
        [FromQuery] int pagina = 1,
        [FromQuery] int tamanhoPagina = Paginacao.TamanhoPadrao,
        CancellationToken cancellationToken = default)
    {
        var clientes = await clienteService.ListarAsync(busca, new Paginacao(pagina, tamanhoPagina), cancellationToken);
        return Ok(clientes);
    }

    /// <summary>Obtém um cliente pelo identificador.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType<ClienteResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Obter(int id, CancellationToken cancellationToken)
    {
        var cliente = await clienteService.ObterPorIdAsync(id, cancellationToken);
        return Ok(cliente);
    }

    /// <summary>Cadastra um cliente. O CPF não pode estar cadastrado para outro cliente.</summary>
    [HttpPost]
    [ProducesResponseType<ClienteResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Criar(ClienteRequest request, CancellationToken cancellationToken)
    {
        var cliente = await clienteService.CriarAsync(request, cancellationToken);
        return CreatedAtAction(nameof(Obter), new { id = cliente.Id }, cliente);
    }

    /// <summary>Altera os dados de um cliente.</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType<ClienteResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Atualizar(int id, ClienteRequest request, CancellationToken cancellationToken)
    {
        var cliente = await clienteService.AtualizarAsync(id, request, cancellationToken);
        return Ok(cliente);
    }

    /// <summary>Exclui um cliente. Clientes com vendas registradas não podem ser excluídos.</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Excluir(int id, CancellationToken cancellationToken)
    {
        await clienteService.ExcluirAsync(id, cancellationToken);
        return NoContent();
    }
}
