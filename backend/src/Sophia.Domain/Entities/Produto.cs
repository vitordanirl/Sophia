using Sophia.Domain.Common;

namespace Sophia.Domain.Entities;

public class Produto : Entity
{
    public const int NomeTamanhoMaximo = 120;

    public string Nome { get; private set; } = null!;
    public decimal ValorUnitario { get; private set; }

    // Construtor usado pelo EF Core
    private Produto() { }

    public Produto(string nome, decimal valorUnitario)
    {
        Atualizar(nome, valorUnitario);
    }

    public void Atualizar(string nome, decimal valorUnitario)
    {
        if (string.IsNullOrWhiteSpace(nome))
            throw new DomainException("O nome do produto é obrigatório.");

        if (valorUnitario <= 0)
            throw new DomainException("O valor unitário do produto deve ser maior que zero.");

        Nome = nome.Trim();
        ValorUnitario = valorUnitario;
    }
}
