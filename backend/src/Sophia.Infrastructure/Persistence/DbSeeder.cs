using Microsoft.EntityFrameworkCore;
using Sophia.Domain.Entities;
using Sophia.Domain.ValueObjects;

namespace Sophia.Infrastructure.Persistence;

/// <summary>
/// Dados de exemplo para desenvolvimento/demonstração. Só insere se o banco estiver vazio.
/// </summary>
public static class DbSeeder
{
    public static async Task SeedAsync(SophiaDbContext context, CancellationToken cancellationToken = default)
    {
        if (await context.Clientes.AnyAsync(cancellationToken) || await context.Produtos.AnyAsync(cancellationToken))
            return;

        var clientes = new[]
        {
            new Cliente(Cpf.Criar("52998224725"), "Ana Paula Souza", new DateOnly(1990, 3, 15), "ana.souza@email.com", "11987654321"),
            new Cliente(Cpf.Criar("11144477735"), "Bruno Henrique Lima", new DateOnly(1985, 7, 22), "bruno.lima@email.com", "21998765432"),
            new Cliente(Cpf.Criar("12345678909"), "Carla Mendes Oliveira", new DateOnly(1998, 11, 2), null, "31991234567"),
            new Cliente(Cpf.Criar("98765432100"), "Daniel Costa Ferreira", null, "daniel.ferreira@email.com", null),
            new Cliente(Cpf.Criar("39053344705"), "Eduarda Santos Rocha", new DateOnly(2001, 1, 30), "eduarda.rocha@email.com", "4133224455"),
        };

        var produtos = new[]
        {
            new Produto("Notebook 15\"", 3899.90m),
            new Produto("Mouse sem fio", 89.90m),
            new Produto("Teclado mecânico", 349.00m),
            new Produto("Monitor 27\"", 1599.00m),
            new Produto("Headset USB", 249.90m),
            new Produto("Webcam Full HD", 199.90m),
            new Produto("Cadeira ergonômica", 1290.00m),
            new Produto("Mousepad", 39.90m),
        };

        context.Clientes.AddRange(clientes);
        context.Produtos.AddRange(produtos);
        await context.SaveChangesAsync(cancellationToken);

        var hoje = DateOnly.FromDateTime(DateTime.Today);

        context.Vendas.AddRange(
            Venda.Criar(clientes[0].Id, hoje.AddDays(-2),
            [
                new(produtos[0].Id, 1, produtos[0].ValorUnitario),
                new(produtos[1].Id, 1, produtos[1].ValorUnitario),
                new(produtos[7].Id, 1, produtos[7].ValorUnitario),
            ]),
            Venda.Criar(clientes[1].Id, hoje.AddDays(-1),
            [
                new(produtos[3].Id, 2, 1499.00m),
                new(produtos[2].Id, 1, produtos[2].ValorUnitario),
            ]),
            Venda.Criar(clientes[2].Id, hoje,
            [
                new(produtos[4].Id, 3, produtos[4].ValorUnitario),
            ]));

        await context.SaveChangesAsync(cancellationToken);
    }
}
