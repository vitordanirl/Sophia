using Sophia.Domain.Common;

namespace Sophia.Domain.ValueObjects;

/// <summary>
/// CPF válido, armazenado apenas com os 11 dígitos.
/// </summary>
public sealed record Cpf
{
    public const int Tamanho = 11;

    public string Numero { get; }

    private Cpf(string numero) => Numero = numero;

    public static Cpf Criar(string? valor)
    {
        var numero = ApenasDigitos(valor);

        if (!EhValido(numero))
            throw new DomainException("CPF inválido.");

        return new Cpf(numero);
    }

    public static bool EhValido(string? valor)
    {
        var numero = ApenasDigitos(valor);

        if (numero.Length != Tamanho || numero.Distinct().Count() == 1)
            return false;

        return numero[9] - '0' == CalcularDigito(numero, 9)
            && numero[10] - '0' == CalcularDigito(numero, 10);
    }

    public string Formatado => $"{Numero[..3]}.{Numero[3..6]}.{Numero[6..9]}-{Numero[9..]}";

    public override string ToString() => Formatado;

    private static int CalcularDigito(string numero, int quantidadeDigitos)
    {
        var soma = 0;
        for (var i = 0; i < quantidadeDigitos; i++)
            soma += (numero[i] - '0') * (quantidadeDigitos + 1 - i);

        var resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }

    private static string ApenasDigitos(string? valor) =>
        string.IsNullOrWhiteSpace(valor) ? string.Empty : new string(valor.Where(char.IsDigit).ToArray());
}
