using FluentValidation;

namespace Sophia.Application.Vendas;

public sealed class CriarVendaRequestValidator : AbstractValidator<CriarVendaRequest>
{
    public CriarVendaRequestValidator()
    {
        RuleFor(v => v.ClienteId)
            .GreaterThan(0).WithMessage("Selecione o cliente da venda.");

        RuleFor(v => v.Itens)
            .NotEmpty().WithMessage("Lance pelo menos um produto na venda.");

        RuleForEach(v => v.Itens).ChildRules(item =>
        {
            item.RuleFor(i => i.ProdutoId)
                .GreaterThan(0).WithMessage("Selecione o produto.");

            item.RuleFor(i => i.Quantidade)
                .GreaterThan(0).WithMessage("A quantidade deve ser maior que zero.");

            item.RuleFor(i => i.ValorUnitario)
                .GreaterThan(0).WithMessage("O valor unitário deve ser maior que zero.")
                .PrecisionScale(18, 2, ignoreTrailingZeros: true).WithMessage("O valor unitário deve ter no máximo 2 casas decimais.");
        });
    }
}
