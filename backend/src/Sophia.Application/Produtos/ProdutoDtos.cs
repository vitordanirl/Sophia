namespace Sophia.Application.Produtos;

/// <summary>Dados para cadastro ou alteração de um produto.</summary>
/// <param name="Nome">Nome do produto (único, sem diferenciar maiúsculas/minúsculas).</param>
/// <param name="ValorUnitario">Valor unitário de venda.</param>
public sealed record ProdutoRequest(string Nome, decimal ValorUnitario);

/// <summary>Produto cadastrado.</summary>
public sealed record ProdutoResponse(int Id, string Nome, decimal ValorUnitario);
