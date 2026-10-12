using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sophia.Domain.Entities;
using Sophia.Domain.ValueObjects;

namespace Sophia.Infrastructure.Persistence.Configurations;

internal sealed class ClienteConfiguration : IEntityTypeConfiguration<Cliente>
{
    public void Configure(EntityTypeBuilder<Cliente> builder)
    {
        builder.ToTable("clientes");

        builder.HasKey(c => c.Id);

        // Owned type na mesma tabela: permite consultar c.Cpf.Numero (ex.: busca parcial por CPF)
        builder.OwnsOne(c => c.Cpf, cpf =>
        {
            cpf.Property(x => x.Numero)
                .HasColumnName("cpf")
                .HasMaxLength(Cpf.Tamanho)
                .IsFixedLength()
                .IsRequired();

            cpf.HasIndex(x => x.Numero)
                .IsUnique()
                .HasDatabaseName("ix_clientes_cpf");
        });

        builder.Navigation(c => c.Cpf).IsRequired();

        builder.Property(c => c.Nome)
            .HasMaxLength(Cliente.NomeTamanhoMaximo)
            .IsRequired();

        builder.Property(c => c.Email)
            .HasMaxLength(Cliente.EmailTamanhoMaximo);

        builder.Property(c => c.Telefone)
            .HasMaxLength(Cliente.TelefoneTamanhoMaximo);

        builder.HasIndex(c => c.Nome);
    }
}
