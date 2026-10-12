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

        builder.Property(c => c.Cpf)
            .HasConversion(cpf => cpf.Numero, numero => Cpf.Criar(numero))
            .HasMaxLength(Cpf.Tamanho)
            .IsFixedLength()
            .IsRequired();

        builder.Property(c => c.Nome)
            .HasMaxLength(Cliente.NomeTamanhoMaximo)
            .IsRequired();

        builder.Property(c => c.Email)
            .HasMaxLength(Cliente.EmailTamanhoMaximo);

        builder.Property(c => c.Telefone)
            .HasMaxLength(Cliente.TelefoneTamanhoMaximo);

        builder.HasIndex(c => c.Cpf).IsUnique();
        builder.HasIndex(c => c.Nome);
    }
}
