using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Sophia.Api.Infrastructure;

/// <summary>
/// Padroniza os erros de binding (JSON malformado, tipos incompatíveis na query string etc.)
/// no mesmo formato e idioma dos erros de validação da aplicação.
/// </summary>
internal static class InvalidModelStateResponse
{
    private const string MensagemFormatoInvalido = "Valor em formato inválido.";

    public static IActionResult Criar(ActionContext context)
    {
        var parametrosDoCorpo = context.ActionDescriptor.Parameters
            .Where(p => p.BindingInfo?.BindingSource == BindingSource.Body)
            .Select(p => p.Name)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var errors = new Dictionary<string, string[]>();

        foreach (var (key, entry) in context.ModelState)
        {
            if (entry.Errors.Count == 0)
                continue;

            // Erro no corpo como um todo (ausente ou ilegível): só reporta se não houver erro de campo mais específico
            if (key.Length == 0 || key == "$" || parametrosDoCorpo.Contains(key))
            {
                errors.TryAdd("body", ["O corpo da requisição está ausente ou em formato inválido."]);
                continue;
            }

            // Erros do System.Text.Json vêm como "$.itens[0].quantidade"
            var campo = key.StartsWith("$.") ? key[2..] : key;
            errors[ParaCamelCase(campo)] = [MensagemFormatoInvalido];
        }

        if (errors.Count > 1)
            errors.Remove("body");

        var problemDetails = new ValidationProblemDetails(errors)
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "Dados inválidos",
            Detail = "Corrija os campos destacados e tente novamente."
        };
        problemDetails.Extensions["traceId"] = Activity.Current?.Id ?? context.HttpContext.TraceIdentifier;

        return new BadRequestObjectResult(problemDetails)
        {
            ContentTypes = { "application/problem+json" }
        };
    }

    private static string ParaCamelCase(string valor) =>
        valor.Length == 0 ? valor : char.ToLowerInvariant(valor[0]) + valor[1..];
}
