using FluentAssertions;
using Sophia.Domain.Common;
using Sophia.Domain.ValueObjects;

namespace Sophia.Domain.Tests.ValueObjects;

public class CpfTests
{
    [Theory]
    [InlineData("52998224725")]
    [InlineData("529.982.247-25")]
    [InlineData(" 529.982.247-25 ")]
    [InlineData("11144477735")]
    public void Criar_ComCpfValido_ArmazenaSomenteDigitos(string valor)
    {
        var cpf = Cpf.Criar(valor);

        cpf.Numero.Should().HaveLength(Cpf.Tamanho).And.MatchRegex("^[0-9]+$");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("5299822472")]      // 10 dígitos
    [InlineData("529982247250")]    // 12 dígitos
    [InlineData("52998224724")]     // segundo dígito verificador errado
    [InlineData("52998224715")]     // primeiro dígito verificador errado
    [InlineData("11111111111")]     // todos os dígitos iguais
    [InlineData("00000000000")]
    [InlineData("abc.def.ghi-jk")]
    public void Criar_ComCpfInvalido_LancaDomainException(string? valor)
    {
        var criar = () => Cpf.Criar(valor);

        criar.Should().Throw<DomainException>().WithMessage("CPF inválido.");
    }

    [Fact]
    public void Formatado_RetornaCpfComMascara()
    {
        Cpf.Criar("52998224725").Formatado.Should().Be("529.982.247-25");
    }

    [Fact]
    public void Igualdade_CpfsComMesmoNumero_SaoIguais()
    {
        Cpf.Criar("529.982.247-25").Should().Be(Cpf.Criar("52998224725"));
    }
}
