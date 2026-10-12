using FluentValidation;

namespace Sophia.Application.Vendas;

public sealed class VendaFiltroValidator : AbstractValidator<VendaFiltro>
{
    public VendaFiltroValidator()
    {
        RuleFor(f => f.DataFim)
            .GreaterThanOrEqualTo(f => f.DataInicio).WithMessage("A data final deve ser maior ou igual à data inicial.")
            .When(f => f.DataInicio.HasValue && f.DataFim.HasValue);
    }
}
