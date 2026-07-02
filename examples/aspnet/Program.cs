using System.Collections.Generic;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var clientes = new List<Dictionary<string, object?>>
{
    new() { ["id"] = 1, ["nome"] = "Ana Martins", ["email"] = "ana.martins@example.com", ["status"] = "active" },
    new() { ["id"] = 2, ["nome"] = "Paulo Lima", ["email"] = "paulo.lima@example.com", ["status"] = "active" }
};

var pedidos = new List<Dictionary<string, object?>>
{
    new() { ["id"] = 1001, ["clienteId"] = 1, ["total"] = 249.9, ["status"] = "open" },
    new() { ["id"] = 1002, ["clienteId"] = 2, ["total"] = 799.0, ["status"] = "processing" }
};

var produtos = new List<Dictionary<string, object?>>
{
    new() { ["id"] = 1, ["nome"] = "Notebook Orion", ["preco"] = 6499.9, ["estoque"] = 6 },
    new() { ["id"] = 2, ["nome"] = "Mouse Pulse", ["preco"] = 119.9, ["estoque"] = 24 },
    new() { ["id"] = 3, ["nome"] = "Teclado Nova", ["preco"] = 389.9, ["estoque"] = 18 }
};

var cores = new List<Dictionary<string, object?>>
{
    new() { ["id"] = 1, ["nome"] = "Azul Celeste" },
    new() { ["id"] = 2, ["nome"] = "Grafite" },
    new() { ["id"] = 3, ["nome"] = "Verde Sálvia" }
};

var categorias = new List<Dictionary<string, object?>>
{
    new() { ["id"] = 1, ["nome"] = "Eletrônicos" },
    new() { ["id"] = 2, ["nome"] = "Periféricos" },
    new() { ["id"] = 3, ["nome"] = "Acessórios" }
};

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapGet("/clientes", () => Results.Ok(clientes));
app.MapPost("/clientes", (Dictionary<string, object?> cliente) => Results.Created("/clientes/3", WithId(3, cliente)));
app.MapPut("/clientes/{id}", (string id, Dictionary<string, object?> cliente) => Results.Ok(WithId(id, cliente)));
app.MapPatch("/clientes/{id}", (string id, Dictionary<string, object?> cliente) => Results.Ok(WithId(id, cliente)));
app.MapDelete("/clientes/{id}", (string id) => Results.Ok(new Dictionary<string, object?> { ["deleted"] = true, ["entity"] = "cliente", ["id"] = id }));

app.MapGet("/pedidos", () => Results.Ok(pedidos));
app.MapPost("/pedidos", (Dictionary<string, object?> pedido) => Results.Created("/pedidos/1003", WithId(1003, pedido)));
app.MapGet("/pedidos/{id}/itens", (string id) => Results.Ok(new[]
{
    new Dictionary<string, object?> { ["pedidoId"] = id, ["itemId"] = 1, ["nome"] = "Notebook Orion", ["quantidade"] = 1 },
    new Dictionary<string, object?> { ["pedidoId"] = id, ["itemId"] = 2, ["nome"] = "Mouse Pulse", ["quantidade"] = 2 }
}));
app.MapPost("/pedidos/{id}/itens", (string id, Dictionary<string, object?> item) =>
{
    var response = WithId(3, item);
    response["pedidoId"] = id;
    return Results.Created($"/pedidos/{id}/itens/3", response);
});
app.MapDelete("/pedidos/{id}/itens/{itemId}", (string id, string itemId) => Results.Ok(new Dictionary<string, object?> { ["deleted"] = true, ["pedidoId"] = id, ["itemId"] = itemId }));

app.MapGet("/produtos", () => Results.Ok(produtos));
app.MapPost("/produtos", (Dictionary<string, object?> produto) => Results.Created("/produtos/4", WithId(4, produto)));
app.MapGet("/cores", () => Results.Ok(cores));
app.MapPost("/cores", (Dictionary<string, object?> cor) => Results.Created("/cores/4", WithId(4, cor)));
app.MapGet("/produtos/{id}/cores", (string id) => Results.Ok(new[]
{
    new Dictionary<string, object?> { ["produtoId"] = id, ["corId"] = 1, ["nome"] = "Azul Celeste" },
    new Dictionary<string, object?> { ["produtoId"] = id, ["corId"] = 2, ["nome"] = "Grafite" }
}));
app.MapGet("/categorias", () => Results.Ok(categorias));
app.MapPost("/categorias", (Dictionary<string, object?> categoria) => Results.Created("/categorias/4", WithId(4, categoria)));
app.MapGet("/categorias/{id}/produtos", (string id) => Results.Ok(new[]
{
    new Dictionary<string, object?> { ["categoriaId"] = id, ["produtoId"] = 1, ["nome"] = "Notebook Orion" },
    new Dictionary<string, object?> { ["categoriaId"] = id, ["produtoId"] = 2, ["nome"] = "Mouse Pulse" }
}));

app.Run();

static Dictionary<string, object?> WithId(object id, Dictionary<string, object?> payload)
{
    var response = new Dictionary<string, object?>(payload)
    {
        ["id"] = id
    };

    return response;
}
