using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sophia.Domain.Entities;

namespace Sophia.Infrastructure.Persistence.Configurations;

internal sealed class ProdutoConfiguration : IEntityTypeConfiguration<Produto>
{
    public void Configure(EntityTypeBuilder<Produto> builder)
    {
        builder.ToTable("produtos", t =>
        {
            t.HasCheckConstraint("ck_produtos_nome_tamanho", $"char_length(nome) <= {Produto.NomeTamanhoMaximo}");
            t.HasCheckConstraint("ck_produtos_valor_unitario_positivo", "valor_unitario > 0");
        });

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Nome)
            .HasColumnType("citext")
            .IsRequired();

        builder.Property(p => p.ValorUnitario)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.HasIndex(p => p.Nome).IsUnique();
    }
}
