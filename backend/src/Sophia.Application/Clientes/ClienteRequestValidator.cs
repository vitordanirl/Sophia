using FluentValidation;
using Sophia.Domain.Entities;
using Sophia.Domain.ValueObjects;

namespace Sophia.Application.Clientes;

public sealed class ClienteRequestValidator : AbstractValidator<ClienteRequest>
{
    private static readonly DateOnly DataNascimentoMinima = new(1900, 1, 1);

    public ClienteRequestValidator(TimeProvider timeProvider)
    {
        RuleFor(c => c.Cpf)
            .NotEmpty().WithMessage("O CPF é obrigatório.")
            .Must(Cpf.EhValido).WithMessage("CPF inválido.");

        RuleFor(c => c.Nome)
            .NotEmpty().WithMessage("O nome é obrigatório.")
            .MaximumLength(Cliente.NomeTamanhoMaximo).WithMessage($"O nome deve ter no máximo {Cliente.NomeTamanhoMaximo} caracteres.");

        RuleFor(c => c.DataNascimento)
            .Must(data => data >= DataNascimentoMinima).WithMessage("Data de nascimento inválida.")
            .Must(data => data <= DateOnly.FromDateTime(timeProvider.GetLocalNow().DateTime))
                .WithMessage("A data de nascimento não pode estar no futuro.")
            .When(c => c.DataNascimento.HasValue);

        RuleFor(c => c.Email)
            .EmailAddress().WithMessage("E-mail inválido.")
            .MaximumLength(Cliente.EmailTamanhoMaximo).WithMessage($"O e-mail deve ter no máximo {Cliente.EmailTamanhoMaximo} caracteres.")
            .When(c => !string.IsNullOrWhiteSpace(c.Email));

        RuleFor(c => c.Telefone)
            .Must(telefone => telefone!.Count(char.IsDigit) is 10 or 11)
                .WithMessage("Telefone inválido. Informe o DDD e o número.")
            .When(c => !string.IsNullOrWhiteSpace(c.Telefone));
    }
}
