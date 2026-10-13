# Planejamento — Sistema de Controle de Vendas (Teste Prático)

> Planejamento elaborado a partir do `teste-pratico.pdf` antes do início do desenvolvimento e seguido fase a fase
> (um commit por fase). O texto abaixo é o plano original; as adaptações feitas durante a execução estão
> registradas na seção [Execução: ajustes em relação ao plano](#execução-ajustes-em-relação-ao-plano), no final.

## Contexto
O `teste-pratico.pdf` pede uma aplicação web de controle de vendas com cadastro de **Clientes**, **Produtos** e **Vendas**. O frontend deve ser em React e o backend em .NET 8+ (C#). O banco deve ter PKs, FKs, índices, campos obrigatórios e normalização. A entrega é o **script completo do banco** + o **código-fonte**. Os avaliadores querem ver código escrito à mão (não só scaffolding), boa arquitetura e legibilidade.
Hoje o repositório está vazio: só tem o PDF e um commit inicial.

**Decisões tomadas:** PostgreSQL + EF Core · Vite + React + TypeScript + Tailwind/shadcn · Diferenciais incluídos: Clean Architecture/SOLID, testes xUnit, Swagger + validações/erros, README de decisões + Docker.

## Estrutura alvo
```
Sophia/
├── backend/
│   ├── Sophia.sln
│   ├── src/
│   │   ├── Sophia.Domain/          # Entidades, Value Objects (Cpf), exceções de domínio, interfaces de repositório
│   │   ├── Sophia.Application/     # DTOs, serviços/casos de uso, validators (FluentValidation), interfaces
│   │   ├── Sophia.Infrastructure/  # DbContext, configurações Fluent API, repositórios, migrations
│   │   └── Sophia.Api/             # Controllers, middleware de erros (ProblemDetails), Swagger, DI, CORS
│   └── tests/
│       ├── Sophia.Domain.Tests/
│       └── Sophia.Application.Tests/
├── frontend/                       # Vite + React + TS + Tailwind + shadcn/ui
├── database/
│   └── create-database.sql         # script completo (gerado por migrations + revisado)
├── docker-compose.yml              # PostgreSQL (+ opcionalmente api/front)
└── README.md                       # como rodar + decisões de arquitetura
```

---

## Fase 1 — Setup e fundação
- Criar a solution .NET 8 com os 4 projetos de `src` + 2 de testes e as referências entre eles (Api → Application/Infrastructure; Infrastructure → Application → Domain).
- `docker-compose.yml` com PostgreSQL 16 (volume, porta 5432, usuário/senha de dev).
- Criar o frontend com Vite (React + TS), configurar Tailwind e inicializar o shadcn/ui.
- Adicionar `.gitignore` (dotnet + node) e `.editorconfig`.
- **Pronto quando:** `dotnet build` e `npm run dev` rodam e o container do Postgres sobe.

## Fase 2 — Domínio e modelagem do banco
**Entidades (Domain)**, com regras de negócio dentro delas (construtores e métodos, sem setters públicos):
- `Cliente`: Id, Cpf (VO com validação de dígitos verificadores, salvo só com números), Nome*, DataNascimento?, Email?, Telefone?
- `Produto`: Id, Nome*, ValorUnitario* (> 0)
- `Venda`: Id, Numero (identificador sequencial), DataVenda* (padrão = hoje), ClienteId (FK), Itens, Total (calculado)
- `ItemVenda`: Id, VendaId (FK), ProdutoId (FK), Quantidade* (> 0), ValorUnitario* (preço congelado no momento da venda), Subtotal
- `Venda.AdicionarItem(...)`, `RemoverItem`, `Total => soma dos subtotais`; uma venda precisa ter pelo menos 1 item.

**Banco (Infrastructure / EF Fluent API):**
- Tabelas `clientes`, `produtos`, `vendas`, `itens_venda` (snake_case).
- PKs; FKs `vendas.cliente_id → clientes`, `itens_venda.venda_id → vendas` (cascade), `itens_venda.produto_id → produtos` (restrict).
- Índices **únicos**: `clientes.cpf` e `produtos.nome` (o único de nome usa `lower(nome)` para ignorar maiúsculas/minúsculas). Índices comuns: `clientes.nome`, `vendas.cliente_id`, `vendas.data_venda`, `itens_venda.venda_id`.
- NOT NULL nos obrigatórios, `numeric(18,2)` para valores, `CHECK` para quantidade > 0 e valor > 0.
- Normalização: o nome e o CPF do cliente não ficam duplicados na venda (vêm por join). O preço do item é guardado de propósito, porque é um dado histórico.
- Primeira migration + `dotnet ef migrations script --idempotent -o database/create-database.sql`.
- **Pronto quando:** o banco é criado pela migration e o script SQL roda sozinho num banco vazio.

## Fase 3 — Backend: casos de uso e API
- **Application:** serviços `ClienteService`, `ProdutoService` e `VendaService` (implementando interfaces), DTOs de request/response e validators FluentValidation. Duplicidade de CPF ou de nome do produto → `ConflictException`.
- **Repositórios** (Infrastructure) + `IUnitOfWork` (ou o próprio DbContext por trás de uma interface).
- **Endpoints REST:**
  - `GET/POST/PUT/DELETE /api/clientes` + `GET /api/clientes?busca=` (procura por CPF ou nome, para o autocomplete)
  - `GET/POST/PUT/DELETE /api/produtos` + `?busca=`
  - `GET /api/vendas` (lista com cliente e total, paginada), `GET /api/vendas/{id}`, `POST /api/vendas`, `DELETE /api/vendas/{id}`
- Não permitir excluir um cliente ou produto que já aparece em alguma venda: retornar 409 com uma mensagem clara.
- Middleware global de exceções → `ProblemDetails` (400 validação com erros por campo, 404, 409, 500).
- Swagger/OpenAPI com comentários XML; CORS liberado para o frontend; connection string no `appsettings.Development.json`; migrations aplicadas ao subir em ambiente de dev.
- Seed opcional com alguns clientes e produtos para a demonstração.
- **Pronto quando:** todos os endpoints funcionam pelo Swagger com as validações certas.

## Fase 4 — Testes automatizados
- `Sophia.Domain.Tests` (xUnit + FluentAssertions): validação de CPF, cálculo de subtotal e total da venda, venda sem itens rejeitada, quantidade e valor inválidos.
- `Sophia.Application.Tests`: CPF duplicado, nome de produto duplicado, criação de venda com cliente ou produto inexistente (usando NSubstitute/Moq nos repositórios).
- **Pronto quando:** `dotnet test` passa sem falhas.

## Fase 5 — Frontend: base e cadastros
- Estrutura: `src/api` (cliente axios + serviços por recurso), `src/types`, `src/components/ui` (shadcn), `src/features/{clientes,produtos,vendas}`, `src/lib` (formatadores de moeda, CPF, telefone e data).
- React Router com layout (sidebar + header) e TanStack Query para buscar e cachear os dados.
- Formulários com react-hook-form + zod (máscaras de CPF/telefone, validação no cliente), mostrando no campo certo os erros que vêm do backend (ProblemDetails), além de toasts (sonner).
- Telas de **Clientes** e **Produtos**: tabela com busca, modal de criar/editar e confirmação antes de excluir.
- **Pronto quando:** o CRUD completo dos dois cadastros funciona contra a API.

## Fase 6 — Frontend: tela de Vendas (principal)
- **Nova venda:**
  - Cabeçalho: número (definido ao salvar), data (preenchida com hoje, pode ser editada) e combobox do cliente com busca por CPF **ou** nome (shadcn Command, com debounce), mostrando o CPF e o nome selecionados.
  - Lançamento de itens: combobox de produto (preenche o valor unitário, que pode ser editado), quantidade e botão "Adicionar". Atalho Enter para agilizar o operador.
  - Grade de itens: produto, quantidade e valor unitário editáveis na linha, **subtotal por item** e botão para remover.
  - Rodapé com o **total da venda** em destaque, quantidade de itens e os botões Salvar/Cancelar.
- **Listagem de vendas:** filtros por período e cliente, total por venda e tela de detalhe (somente leitura).
- **Pronto quando:** dá para registrar uma venda com vários produtos de ponta a ponta e ela aparece na listagem com o total correto.

## Fase 7 — Polimento e entrega
- Revisar a UX: estados de loading, empty e erro, responsividade, foco e acessibilidade.
- Gerar de novo e revisar `database/create-database.sql` (tabelas, constraints, índices e seed opcional).
- `README.md`: pré-requisitos, como rodar (docker compose → `dotnet run` → `npm run dev`), arquitetura, decisões (por que EF Core, por que o preço fica congelado no item, VO de CPF, ProblemDetails etc.) e prints das telas.
- Revisão final do código (nomes, código morto) e commits organizados por fase.

---

## Verificação ponta a ponta
1. `docker compose up -d` → Postgres no ar.
2. Rodar `database/create-database.sql` num banco vazio, sem erros (e conferir as constraints com `\d+ clientes` etc.).
3. `dotnet test` → tudo verde.
4. `dotnet run --project backend/src/Sophia.Api` → Swagger em `/swagger`; testar: CPF inválido → 400, CPF duplicado → 409, produto duplicado → 409.
5. `npm run dev` no `frontend/` → no navegador: cadastrar 2 clientes e 3 produtos, criar uma venda com vários itens buscando o cliente por CPF e depois por nome, conferir os subtotais e o total, salvar e ver a venda na listagem e no detalhe.

---

## Execução: ajustes em relação ao plano

Todas as fases foram concluídas. Os ajustes abaixo foram decididos durante a implementação, cada um com o seu motivo.

| Fase | Planejado | Executado | Motivo |
|---|---|---|---|
| 2 | Campo `Numero` na venda | O `Id` sequencial é o identificador | Um segundo número seria redundante |
| 2 | Índice único com `lower(nome)` em produtos | Coluna `citext` com índice único | O EF Core não mapeia índices com expressão; o `citext` fica visível no modelo |
| 2 | Índice comum em `itens_venda.venda_id` | Índice único `(venda_id, produto_id)` | Impede produto repetido na venda e também serve como índice da FK |
| 2 | `RemoverItem` no domínio | Não implementado | A venda é criada inteira numa operação e não tem endpoint de edição |
| 2 | Script com `--idempotent` | Script simples, com cabeçalho | Mais legível para a entrega; validado num banco vazio |
| 3 | Interfaces de repositório no Domain | Interfaces na Application | Permite consultas de leitura que já devolvem o formato da tela (totais calculados no banco) |
| 3 | CPF com value converter | CPF como *owned type* (mesma coluna `cpf`) | O value converter não permitia a busca parcial por CPF |
| 4 | FluentAssertions | FluentAssertions 7.x | A partir da 8 ela passou a ter licença comercial |
| 6 | Rodapé com o total | Resumo lateral (≥ 1280px) ou barra fixa no rodapé | Em 1024px a coluna lateral deixava o lançamento estreito demais |
| 6 | Atalho Enter | Enter lança o item e Ctrl+Enter finaliza; o combobox não seleciona resultados desatualizados | Os testes de digitação rápida mostraram que um Enter apressado escolhia o produto errado |
| 7 | Prints das telas no README | Não incluídos | Descrição textual das telas e do fluxo |
| 7 | — | Rotas sob demanda, testes do front (Vitest), `seed.sql` e `.gitattributes` | Bundle menor e cobertura das regras que existem só no front |

**Resultado:** 63 testes no backend e 28 no frontend, todos passando. O build sai sem avisos e o script do banco bate com as migrations.
