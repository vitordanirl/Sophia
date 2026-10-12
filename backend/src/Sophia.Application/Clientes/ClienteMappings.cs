using Sophia.Domain.Entities;

namespace Sophia.Application.Clientes;

internal static class ClienteMappings
{
    public static ClienteResponse ToResponse(this Cliente cliente) => new(
        cliente.Id,
        cliente.Cpf.Numero,
        cliente.Nome,
        cliente.DataNascimento,
        cliente.Email,
        cliente.Telefone);
}
