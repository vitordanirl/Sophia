using FluentValidation;
using Sophia.Domain.Entities;

namespace Sophia.Application.Produtos;

public sealed class ProdutoRequestValidator : AbstractValidator<ProdutoRequest>
{
    public ProdutoRequestValidator()
    {
        RuleFor(p => p.Nome)
            .NotEmpty().WithMessage("O nome é obrigatório.")
            .MaximumLength(Produto.NomeTamanhoMaximo).WithMessage($"O nome deve ter no máximo {Produto.NomeTamanhoMaximo} caracteres.");

        RuleFor(p => p.ValorUnitario)
            .GreaterThan(0).WithMessage("O valor unitário deve ser maior que zero.")
            .PrecisionScale(18, 2, ignoreTrailingZeros: true).WithMessage("O valor unitário deve ter no máximo 2 casas decimais.");
    }
}
