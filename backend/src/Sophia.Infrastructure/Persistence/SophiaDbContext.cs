using Microsoft.EntityFrameworkCore;
using Sophia.Domain.Entities;

namespace Sophia.Infrastructure.Persistence;

public class SophiaDbContext(DbContextOptions<SophiaDbContext> options) : DbContext(options)
{
    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Produto> Produtos => Set<Produto>();
    public DbSet<Venda> Vendas => Set<Venda>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // citext: texto case-insensitive, usado para garantir nomes de produto únicos sem diferenciar maiúsculas/minúsculas
        modelBuilder.HasPostgresExtension("citext");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SophiaDbContext).Assembly);
    }
}
