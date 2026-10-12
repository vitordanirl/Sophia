using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Sophia.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:citext", ",,");

            migrationBuilder.CreateTable(
                name: "clientes",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    cpf = table.Column<string>(type: "character(11)", fixedLength: true, maxLength: 11, nullable: false),
                    nome = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    data_nascimento = table.Column<DateOnly>(type: "date", nullable: true),
                    email = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: true),
                    telefone = table.Column<string>(type: "character varying(11)", maxLength: 11, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_clientes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "produtos",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nome = table.Column<string>(type: "citext", nullable: false),
                    valor_unitario = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_produtos", x => x.id);
                    table.CheckConstraint("ck_produtos_nome_tamanho", "char_length(nome) <= 120");
                    table.CheckConstraint("ck_produtos_valor_unitario_positivo", "valor_unitario > 0");
                });

            migrationBuilder.CreateTable(
                name: "vendas",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    data_venda = table.Column<DateOnly>(type: "date", nullable: false),
                    cliente_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_vendas", x => x.id);
                    table.ForeignKey(
                        name: "fk_vendas_clientes_cliente_id",
                        column: x => x.cliente_id,
                        principalTable: "clientes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "itens_venda",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    venda_id = table.Column<int>(type: "integer", nullable: false),
                    produto_id = table.Column<int>(type: "integer", nullable: false),
                    quantidade = table.Column<int>(type: "integer", nullable: false),
                    valor_unitario = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_itens_venda", x => x.id);
                    table.CheckConstraint("ck_itens_venda_quantidade_positiva", "quantidade > 0");
                    table.CheckConstraint("ck_itens_venda_valor_unitario_positivo", "valor_unitario > 0");
                    table.ForeignKey(
                        name: "fk_itens_venda_produtos_produto_id",
                        column: x => x.produto_id,
                        principalTable: "produtos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_itens_venda_vendas_venda_id",
                        column: x => x.venda_id,
                        principalTable: "vendas",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_clientes_cpf",
                table: "clientes",
                column: "cpf",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_clientes_nome",
                table: "clientes",
                column: "nome");

            migrationBuilder.CreateIndex(
                name: "ix_itens_venda_produto_id",
                table: "itens_venda",
                column: "produto_id");

            migrationBuilder.CreateIndex(
                name: "ix_itens_venda_venda_id_produto_id",
                table: "itens_venda",
                columns: new[] { "venda_id", "produto_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_produtos_nome",
                table: "produtos",
                column: "nome",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_vendas_cliente_id",
                table: "vendas",
                column: "cliente_id");

            migrationBuilder.CreateIndex(
                name: "ix_vendas_data_venda",
                table: "vendas",
                column: "data_venda");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "itens_venda");

            migrationBuilder.DropTable(
                name: "produtos");

            migrationBuilder.DropTable(
                name: "vendas");

            migrationBuilder.DropTable(
                name: "clientes");
        }
    }
}
