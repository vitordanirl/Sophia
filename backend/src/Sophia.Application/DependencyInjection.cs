using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Sophia.Application.Clientes;
using Sophia.Application.Produtos;
using Sophia.Application.Vendas;

namespace Sophia.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.TryAddSingleton(TimeProvider.System);

        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        services.AddScoped<IClienteService, ClienteService>();
        services.AddScoped<IProdutoService, ProdutoService>();
        services.AddScoped<IVendaService, VendaService>();

        return services;
    }
}
