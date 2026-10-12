using System.Reflection;
using Sophia.Domain.Common;

namespace Sophia.Application.Tests.Support;

/// <summary>
/// Simula o que o EF Core faz ao materializar entidades: preenche Id e navegações,
/// que no domínio possuem setters privados.
/// </summary>
internal static class EntityTestExtensions
{
    public static T ComId<T>(this T entity, int id) where T : Entity =>
        entity.Definir(nameof(Entity.Id), id);

    public static T Definir<T>(this T entity, string propriedade, object? valor) where T : class
    {
        var property = entity.GetType().GetProperty(propriedade, BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic)
            ?? throw new InvalidOperationException($"Propriedade {propriedade} não encontrada em {entity.GetType().Name}.");

        property.SetValue(entity, valor);
        return entity;
    }
}
