namespace Sophia.Application.Common.Exceptions;

/// <summary>
/// O recurso solicitado não foi encontrado.
/// </summary>
public class NotFoundException(string message) : Exception(message);
