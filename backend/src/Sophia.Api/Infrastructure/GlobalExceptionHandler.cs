using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Sophia.Application.Common.Exceptions;
using Sophia.Domain.Common;

namespace Sophia.Api.Infrastructure;

/// <summary>
/// Converte exceções em respostas ProblemDetails (RFC 9457) com mensagens claras para o usuário.
/// </summary>
internal sealed class GlobalExceptionHandler(
    IProblemDetailsService problemDetailsService,
    ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var problemDetails = exception switch
        {
            ValidationException validation => CriarValidationProblem(validation),
            DomainException => Criar(StatusCodes.Status400BadRequest, "Regra de negócio violada", exception.Message),
            NotFoundException => Criar(StatusCodes.Status404NotFound, "Recurso não encontrado", exception.Message),
            ConflictException => Criar(StatusCodes.Status409Conflict, "Conflito", exception.Message),
            _ => null
        };

        if (problemDetails is null)
        {
            logger.LogError(exception, "Erro não tratado ao processar {Method} {Path}", httpContext.Request.Method, httpContext.Request.Path);
            problemDetails = Criar(StatusCodes.Status500InternalServerError, "Erro interno", "Ocorreu um erro inesperado. Tente novamente mais tarde.");
        }

        httpContext.Response.StatusCode = problemDetails.Status!.Value;

        return await problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            ProblemDetails = problemDetails,
            Exception = exception
        });
    }

    private static ProblemDetails Criar(int status, string title, string detail) =>
        new() { Status = status, Title = title, Detail = detail };

    private static ValidationProblemDetails CriarValidationProblem(ValidationException exception)
    {
        var errors = exception.Errors
            .GroupBy(e => ParaCamelCase(e.PropertyName))
            .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).Distinct().ToArray());

        return new ValidationProblemDetails(errors)
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "Dados inválidos",
            Detail = "Corrija os campos destacados e tente novamente."
        };
    }

    /// <summary>
    /// "Itens[0].ProdutoId" → "itens[0].produtoId", seguindo a serialização JSON da API.
    /// </summary>
    private static string ParaCamelCase(string propertyName) => string.Join('.',
        propertyName.Split('.').Select(parte => parte.Length == 0 ? parte : char.ToLowerInvariant(parte[0]) + parte[1..]));
}
