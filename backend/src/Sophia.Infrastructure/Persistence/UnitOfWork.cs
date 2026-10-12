using Microsoft.EntityFrameworkCore;
using Npgsql;
using Sophia.Application.Abstractions;
using Sophia.Application.Common.Exceptions;

namespace Sophia.Infrastructure.Persistence;

internal sealed class UnitOfWork(SophiaDbContext context) : IUnitOfWork
{
    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            await context.SaveChangesAsync(cancellationToken);
        }
        // As validações da aplicação cobrem os casos comuns; aqui tratamos a concorrência
        // (duas requisições gravando ao mesmo tempo) que só o banco consegue garantir.
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException pg)
        {
            throw pg.SqlState switch
            {
                PostgresErrorCodes.UniqueViolation => new ConflictException("Já existe um registro cadastrado com estes dados."),
                PostgresErrorCodes.ForeignKeyViolation => new ConflictException("O registro está vinculado a outros dados e não pode ser alterado ou excluído."),
                _ => ex
            };
        }
    }
}
