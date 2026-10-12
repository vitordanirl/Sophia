using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sophia.Domain.Entities;

namespace Sophia.Infrastructure.Persistence.Configurations;

internal sealed class VendaConfiguration : IEntityTypeConfiguration<Venda>
{
    public void Configure(EntityTypeBuilder<Venda> builder)
    {
        builder.ToTable("vendas");

        builder.HasKey(v => v.Id);

        builder.Property(v => v.DataVenda)
            .IsRequired();

        builder.HasOne(v => v.Cliente)
            .WithMany()
            .HasForeignKey(v => v.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(v => v.Itens)
            .WithOne()
            .HasForeignKey(i => i.VendaId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(v => v.Itens)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        // Total é calculado a partir dos itens; não é persistido para manter o modelo normalizado
        builder.Ignore(v => v.Total);

        builder.HasIndex(v => v.DataVenda);
    }
}
