namespace Sophia.Application.Common.Exceptions;

/// <summary>
/// A operação conflita com o estado atual dos dados (duplicidade, registro em uso etc.).
/// </summary>
public class ConflictException(string message) : Exception(message);
