namespace Sophia.Application.Vendas;

/// <summary>Dados para registrar uma venda com todos os seus itens.</summary>
/// <param name="ClienteId">Cliente da venda.</param>
/// <param name="DataVenda">Data da venda (yyyy-MM-dd). Se omitida, assume a data de hoje.</param>
/// <param name="Itens">Produtos lançados na venda.</param>
public sealed record CriarVendaRequest(int ClienteId, DateOnly? DataVenda, IReadOnlyList<ItemVendaRequest> Itens);

/// <summary>Produto lançado na venda.</summary>
/// <param name="ProdutoId">Produto vendido.</param>
/// <param name="Quantidade">Quantidade de itens.</param>
/// <param name="ValorUnitario">Valor unitário praticado nesta venda.</param>
public sealed record ItemVendaRequest(int ProdutoId, int Quantidade, decimal ValorUnitario);

/// <summary>Venda completa, com cliente, itens e totalizadores.</summary>
public sealed record VendaResponse(
    int Id,
    DateOnly DataVenda,
    VendaClienteResponse Cliente,
    IReadOnlyList<ItemVendaResponse> Itens,
    decimal Total);

public sealed record VendaClienteResponse(int Id, string Cpf, string Nome);

public sealed record ItemVendaResponse(
    int Id,
    int ProdutoId,
    string ProdutoNome,
    int Quantidade,
    decimal ValorUnitario,
    decimal Subtotal);

/// <summary>Linha da listagem de vendas.</summary>
public sealed record VendaResumoResponse(
    int Id,
    DateOnly DataVenda,
    int ClienteId,
    string ClienteCpf,
    string ClienteNome,
    int QuantidadeItens,
    decimal Total);

/// <summary>Filtros da listagem de vendas.</summary>
/// <param name="DataInicio">Data inicial (inclusive).</param>
/// <param name="DataFim">Data final (inclusive).</param>
/// <param name="ClienteId">Somente vendas deste cliente.</param>
public sealed record VendaFiltro(DateOnly? DataInicio = null, DateOnly? DataFim = null, int? ClienteId = null);
