# Sophia Vendas

Aplicação web de controle de vendas para clientes, com cadastro de **clientes**, **produtos** e **vendas**.

- **Backend:** .NET 8 (ASP.NET Core Web API, C#), EF Core, PostgreSQL
- **Frontend:** React 19 + TypeScript (Vite), Tailwind CSS, shadcn/ui
- **Testes:** xUnit (backend) e Vitest (frontend)

---

## Como executar

### Pré-requisitos

- [.NET SDK 8](https://dotnet.microsoft.com/download) ou superior
- [Node.js 20](https://nodejs.org/) ou superior
- [Docker](https://www.docker.com/) (para o PostgreSQL), ou um PostgreSQL 16 já instalado

### 1. Banco de dados

```bash
docker compose up -d
```

Sobe um PostgreSQL 16 em `localhost:5432` (banco, usuário e senha: `sophia`).

> Com um PostgreSQL próprio, ajuste a connection string em
> [`backend/src/Sophia.Api/appsettings.json`](backend/src/Sophia.Api/appsettings.json).

### 2. API

```bash
dotnet run --project backend/src/Sophia.Api
```

- Em ambiente de desenvolvimento, a API **aplica as migrations e insere dados de exemplo** automaticamente (só se o banco estiver vazio).
- Swagger: <http://localhost:5000/swagger>
- No **Visual Studio**, abra `backend/Sophia.sln` e execute o projeto `Sophia.Api` (perfil `http`).

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse <http://localhost:5173>. A URL da API pode ser alterada pela variável `VITE_API_URL` (veja `frontend/.env.example`).

### Criação manual do banco (opcional)

O script completo de criação fica em [`database/create-database.sql`](database/create-database.sql), gerado a partir das migrations. Dados de exemplo opcionais ficam em [`database/seed.sql`](database/seed.sql).

```bash
createdb -U postgres sophia
psql -U postgres -d sophia -f database/create-database.sql
psql -U postgres -d sophia -f database/seed.sql
```

### Testes

```bash
dotnet test backend/Sophia.sln     # 63 testes: domínio e casos de uso
cd frontend && npm test            # 28 testes: formatação, CPF e estado da tela de vendas
```

---

## Funcionalidades

| Tela | Destaques |
|---|---|
| **Clientes** | Busca por nome ou CPF (parcial, com ou sem máscara), máscaras de CPF e telefone, CPF único com validação dos dígitos verificadores |
| **Produtos** | Nome único sem diferenciar maiúsculas/minúsculas, campo de valor estilo caixa registradora |
| **Nova venda** | Cliente buscado por CPF ou nome; vários produtos lançados em uma única operação; subtotal por item e total da venda sempre visíveis; data sugerida como hoje |
| **Vendas** | Listagem com filtros por período e cliente, detalhe e exclusão |

A tela de vendas foi pensada para uso contínuo pelo operador, inteiramente pelo **teclado**:

1. Com o foco no campo, basta começar a digitar para buscar o cliente ou o produto. A busca é feita no servidor.
2. Ao escolher um produto, o foco vai para a quantidade e o valor de cadastro já vem sugerido. Ele pode ser alterado só nessa venda.
3. **Enter** lança o item e devolve o foco ao produto. **Ctrl+Enter** finaliza a venda.

Lançar de novo um produto que já está na venda soma a quantidade na linha existente.

---

## Estrutura do projeto

```
├── backend/
│   ├── Sophia.sln
│   ├── src/
│   │   ├── Sophia.Domain/          # Entidades, Value Object Cpf, regras de negócio
│   │   ├── Sophia.Application/     # Casos de uso, DTOs, validações, interfaces (portas)
│   │   ├── Sophia.Infrastructure/  # EF Core, mapeamentos, repositórios, migrations
│   │   └── Sophia.Api/             # Controllers, tratamento de erros, Swagger
│   └── tests/
│       ├── Sophia.Domain.Tests/
│       └── Sophia.Application.Tests/
├── frontend/src/
│   ├── api/                        # Cliente HTTP e serviços por recurso
│   ├── components/                 # ui/ (shadcn), common/ (reutilizáveis), layout/
│   ├── features/                   # clientes/, produtos/, vendas/ (páginas, formulários, hooks)
│   ├── hooks/ · lib/ · types/
├── database/                       # create-database.sql e seed.sql
└── docker-compose.yml
```

### Camadas do backend

```
Api ──► Application ──► Domain
 │           ▲
 └──► Infrastructure
```

- **Domain** não depende de nada.
- **Application** define as interfaces de que precisa (repositórios, unidade de trabalho).
- **Infrastructure** implementa essas interfaces com EF Core.
- **Api** só compõe as dependências e expõe HTTP.

### Modelo de dados

| Tabela | Colunas | Restrições |
|---|---|---|
| `clientes` | id, cpf, nome, data_nascimento, email, telefone | PK; **CPF único**; índice em nome |
| `produtos` | id, nome (`citext`), valor_unitario | PK; **nome único** (case-insensitive); valor > 0 |
| `vendas` | id, data_venda, cliente_id | PK; FK → clientes (restrict); índices em data e cliente |
| `itens_venda` | id, venda_id, produto_id, quantidade, valor_unitario | PK; FK → vendas (cascade) e produtos (restrict); (venda, produto) único; quantidade > 0; valor > 0 |

### Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/clientes?busca=&pagina=&tamanhoPagina=` | Lista/busca clientes (nome ou CPF) |
| GET · PUT · DELETE | `/api/clientes/{id}` | Obtém, altera, exclui |
| POST | `/api/clientes` | Cadastra |
| GET | `/api/produtos?busca=&pagina=&tamanhoPagina=` | Lista/busca produtos |
| GET · PUT · DELETE | `/api/produtos/{id}` | Obtém, altera, exclui |
| POST | `/api/produtos` | Cadastra |
| GET | `/api/vendas?dataInicio=&dataFim=&clienteId=&pagina=` | Lista vendas com cliente e total |
| GET · DELETE | `/api/vendas/{id}` | Obtém (com itens e totais), exclui |
| POST | `/api/vendas` | Registra uma venda com todos os itens |

Documentação completa e interativa no Swagger.

---

## Decisões técnicas

**Regras de negócio no domínio.**
- As entidades não têm setters públicos e validam as próprias invariantes.
- A venda só é criada com seus itens (`Venda.Criar`) e não existe sem pelo menos um.
- O CPF é um *Value Object* que só existe se for válido e é armazenado apenas com dígitos.

**Validação em camadas, com mensagens claras.**
- **Na entrada:** FluentValidation valida os dados e devolve o erro por campo.
- **No domínio:** as entidades protegem as próprias invariantes.
- **No banco:** constraints são a última garantia.
- **No frontend:** as mesmas regras se repetem (zod) para dar feedback imediato. Os erros devolvidos pela API são exibidos no campo correspondente, inclusive em linhas de itens (`itens[1].quantidade`).

**Erros padronizados (ProblemDetails / RFC 9457).**
- Um handler global converte exceções em respostas consistentes: validação → 400, não encontrado → 404, conflito → 409, erro inesperado → 500 com mensagem genérica e log.
- Erros de formato (JSON malformado, data inválida) também saem em português e no mesmo formato.

**Unicidade garantida pelo banco.**
- O serviço verifica CPF e nome de produto antes de gravar, para dar uma mensagem amigável.
- A garantia real são os índices únicos. Se duas requisições gravarem ao mesmo tempo, a violação é traduzida em 409.
- O nome do produto usa `citext`, o que torna o índice único case-insensitive sem precisar de colunas auxiliares.

**Preço praticado registrado no item.**
- `itens_venda.valor_unitario` guarda o preço do momento da venda, permitindo desconto pontual. Alterar o cadastro do produto não muda vendas passadas.
- O **total não é persistido**, o que evita dado derivado e mantém a normalização. Na listagem, ele é calculado direto no banco por projeção, sem carregar os itens.

**Produto repetido na mesma venda.**
- Os itens são somados numa única linha. Lançar o mesmo produto com preços diferentes é recusado, por ser ambíguo.
- O índice único `(venda_id, produto_id)` reforça a regra no banco.

**Interfaces de repositório na Application.**
- A camada de aplicação define as portas de que precisa.
- Isso permite consultas de leitura que já devolvem o formato da tela (por exemplo, o resumo das vendas com o total).

**CPF mapeado como *owned type*.**
- Fica numa única coluna `cpf`, mas pode ser consultado no LINQ (`c.Cpf.Numero`).
- Com um value converter isso não era possível, e a busca parcial por CPF dependia disso.

**Datas sem fuso.**
- Datas de nascimento e de venda são `DateOnly` no backend e strings `yyyy-MM-dd` no frontend.
- Elas são formatadas sem passar por `Date`, para não "voltar um dia" por causa do fuso horário.

**Frontend organizado por feature.**
- TanStack Query cuida de cache e invalidação, e react-hook-form + zod dos formulários.
- Os componentes shadcn/ui ficam no próprio repositório e podem ser editados.
- O combobox assíncrono não seleciona resultados desatualizados: um Enter rápido não escolhe o item da busca anterior.
- As páginas são carregadas sob demanda, e as bibliotecas ficam em chunks separados.

## Possíveis evoluções

- Autenticação e perfis de acesso (operador × administrador)
- Cancelamento de venda (em vez da exclusão física) com histórico
- Testes de integração da API com banco real (Testcontainers) e testes E2E da tela de vendas
- Containerização da API e do frontend e pipeline de CI
