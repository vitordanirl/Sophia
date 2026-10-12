using Sophia.Domain.Common;
using Sophia.Domain.ValueObjects;

namespace Sophia.Domain.Entities;

public class Cliente : Entity
{
    public const int NomeTamanhoMaximo = 150;
    public const int EmailTamanhoMaximo = 254;
    public const int TelefoneTamanhoMaximo = 11;

    public Cpf Cpf { get; private set; } = null!;
    public string Nome { get; private set; } = null!;
    public DateOnly? DataNascimento { get; private set; }
    public string? Email { get; private set; }
    public string? Telefone { get; private set; }

    // Construtor usado pelo EF Core
    private Cliente() { }

    public Cliente(Cpf cpf, string nome, DateOnly? dataNascimento, string? email, string? telefone)
    {
        Atualizar(cpf, nome, dataNascimento, email, telefone);
    }

    public void Atualizar(Cpf cpf, string nome, DateOnly? dataNascimento, string? email, string? telefone)
    {
        ArgumentNullException.ThrowIfNull(cpf);

        if (string.IsNullOrWhiteSpace(nome))
            throw new DomainException("O nome do cliente é obrigatório.");

        Cpf = cpf;
        Nome = nome.Trim();
        DataNascimento = dataNascimento;
        Email = string.IsNullOrWhiteSpace(email) ? null : email.Trim().ToLowerInvariant();
        Telefone = NormalizarTelefone(telefone);
    }

    private static string? NormalizarTelefone(string? telefone)
    {
        var digitos = telefone is null ? string.Empty : new string(telefone.Where(char.IsDigit).ToArray());
        return digitos.Length == 0 ? null : digitos;
    }
}
