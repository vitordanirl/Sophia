using FluentAssertions;
using Sophia.Domain.Common;
using Sophia.Domain.Entities;
using Sophia.Domain.ValueObjects;

namespace Sophia.Domain.Tests.Entities;

public class ClienteTests
{
    private static readonly Cpf CpfValido = Cpf.Criar("52998224725");

    [Fact]
    public void Criar_NormalizaNomeEmailETelefone()
    {
        var cliente = new Cliente(CpfValido, "  Ana Souza  ", new DateOnly(1990, 1, 1), " ANA@Email.COM ", "(11) 98765-4321");

        cliente.Nome.Should().Be("Ana Souza");
        cliente.Email.Should().Be("ana@email.com");
        cliente.Telefone.Should().Be("11987654321");
    }

    [Fact]
    public void Criar_ComEmailETelefoneEmBranco_ArmazenaNulo()
    {
        var cliente = new Cliente(CpfValido, "Ana", null, "   ", "  ");

        cliente.Email.Should().BeNull();
        cliente.Telefone.Should().BeNull();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Criar_SemNome_LancaDomainException(string? nome)
    {
        var criar = () => new Cliente(CpfValido, nome!, null, null, null);

        criar.Should().Throw<DomainException>().WithMessage("O nome do cliente é obrigatório.");
    }

    [Fact]
    public void Atualizar_AlteraTodosOsDados()
    {
        var cliente = new Cliente(CpfValido, "Ana", null, null, null);
        var novoCpf = Cpf.Criar("11144477735");

        cliente.Atualizar(novoCpf, "Ana Paula", new DateOnly(1991, 2, 3), "ana@x.com", "1133334444");

        cliente.Cpf.Should().Be(novoCpf);
        cliente.Nome.Should().Be("Ana Paula");
        cliente.DataNascimento.Should().Be(new DateOnly(1991, 2, 3));
        cliente.Email.Should().Be("ana@x.com");
        cliente.Telefone.Should().Be("1133334444");
    }
}
