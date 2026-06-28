from fastapi import APIRouter, FastAPI

app = FastAPI()
usuarios_router = APIRouter(prefix="/usuarios")


@app.get("/health")
def health():
    return {"status": "ok"}


@usuarios_router.get("/")
def listar_usuarios():
    return []


@usuarios_router.get("/{id}")
def buscar_usuario(id: str):
    return {"id": id}


app.include_router(usuarios_router)


@app.get("/clientes")
def listar_clientes():
    return []


@app.post("/clientes")
def criar_cliente(cliente: dict):
    return cliente


@app.get("/pedidos")
def listar_pedidos():
    return []


@app.post("/pedidos")
def criar_pedido(pedido: dict):
    return pedido


@app.get("/pedidos/{id}/itens")
def listar_itens_do_pedido(id: str):
    return [{"pedidoId": id}]


@app.post("/pedidos/{id}/itens")
def adicionar_item_ao_pedido(id: str, item: dict):
    return {"pedidoId": id, **item}


@app.delete("/pedidos/{id}/itens/{item_id}")
def remover_item_do_pedido(id: str, item_id: str):
    return {"deleted": True, "pedidoId": id, "itemId": item_id}


@app.get("/produtos")
def listar_produtos():
    return []


@app.post("/produtos")
def criar_produto(produto: dict):
    return produto


@app.get("/cores")
def listar_cores():
    return []


@app.post("/cores")
def criar_cor(cor: dict):
    return cor


@app.get("/produtos/{id}/cores")
def listar_cores_do_produto(id: str):
    return [{"produtoId": id}]


@app.get("/categorias")
def listar_categorias():
    return []


@app.post("/categorias")
def criar_categoria(categoria: dict):
    return categoria


@app.get("/categorias/{id}/produtos")
def listar_produtos_da_categoria(id: str):
    return [{"categoriaId": id}]
