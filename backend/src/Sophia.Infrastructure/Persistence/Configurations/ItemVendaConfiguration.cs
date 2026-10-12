using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sophia.Domain.Entities;

namespace Sophia.Infrastructure.Persistence.Configurations;

internal sealed class ItemVendaConfiguration : IEntityTypeConfiguration<ItemVenda>
{
    public void Configure(EntityTypeBuilder<ItemVenda> builder)
    {
        builder.ToTable("itens_venda", t =>
        {
            t.HasCheckConstraint("ck_itens_venda_quantidade_positiva", "quantidade > 0");
            t.HasCheckConstraint("ck_itens_venda_valor_unitario_positivo", "valor_unitario > 0");
        });

        builder.HasKey(i => i.Id);

        builder.Property(i => i.Quantidade)
            .IsRequired();

        builder.Property(i => i.ValorUnitario)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.HasOne(i => i.Produto)
            .WithMany()
            .HasForeignKey(i => i.ProdutoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(i => new { i.VendaId, i.ProdutoId }).IsUnique();

        builder.Ignore(i => i.Subtotal);
    }
}
