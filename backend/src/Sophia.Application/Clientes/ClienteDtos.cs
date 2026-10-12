namespace Sophia.Application.Clientes;

/// <summary>Dados para cadastro ou alteração de um cliente.</summary>
/// <param name="Cpf">CPF com ou sem máscara.</param>
/// <param name="Nome">Nome completo.</param>
/// <param name="DataNascimento">Data de nascimento (yyyy-MM-dd).</param>
/// <param name="Email">E-mail para contato.</param>
/// <param name="Telefone">Telefone com DDD, com ou sem máscara.</param>
public sealed record ClienteRequest(
    string Cpf,
    string Nome,
    DateOnly? DataNascimento,
    string? Email,
    string? Telefone);

/// <summary>Cliente cadastrado.</summary>
/// <param name="Cpf">CPF somente com dígitos.</param>
/// <param name="Telefone">Telefone somente com dígitos.</param>
public sealed record ClienteResponse(
    int Id,
    string Cpf,
    string Nome,
    DateOnly? DataNascimento,
    string? Email,
    string? Telefone);
