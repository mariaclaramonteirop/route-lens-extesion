var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapGet("/clientes", () => Results.Ok(Array.Empty<object>()));
app.MapPost("/clientes", (object cliente) => Results.Created("/clientes/1", cliente));
app.MapPut("/clientes/{id}", (string id, object cliente) => Results.Ok(cliente));
app.MapPatch("/clientes/{id}", (string id, object cliente) => Results.Ok(cliente));
app.MapDelete("/clientes/{id}", (string id) => Results.NoContent());

app.MapGet("/pedidos", () => Results.Ok(Array.Empty<object>()));
app.MapPost("/pedidos", (object pedido) => Results.Created("/pedidos/1", pedido));
app.MapGet("/pedidos/{id}/itens", (string id) => Results.Ok(Array.Empty<object>()));
app.MapPost("/pedidos/{id}/itens", (string id, object item) => Results.Created($"/pedidos/{id}/itens/1", item));
app.MapDelete("/pedidos/{id}/itens/{itemId}", (string id, string itemId) => Results.NoContent());

app.MapGet("/produtos", () => Results.Ok(Array.Empty<object>()));
app.MapPost("/produtos", (object produto) => Results.Created("/produtos/1", produto));
app.MapGet("/cores", () => Results.Ok(Array.Empty<object>()));
app.MapPost("/cores", (object cor) => Results.Created("/cores/1", cor));
app.MapGet("/produtos/{id}/cores", (string id) => Results.Ok(Array.Empty<object>()));
app.MapGet("/categorias", () => Results.Ok(Array.Empty<object>()));
app.MapPost("/categorias", (object categoria) => Results.Created("/categorias/1", categoria));
app.MapGet("/categorias/{id}/produtos", (string id) => Results.Ok(Array.Empty<object>()));

app.Run();
