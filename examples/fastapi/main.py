from fastapi import APIRouter, FastAPI

app = FastAPI()
usuarios_router = APIRouter(prefix="/usuarios")

USUARIOS = [
    {"id": 1, "nome": "Camila Rocha", "email": "camila.rocha@example.com", "role": "admin"},
    {"id": 2, "nome": "Bruno Almeida", "email": "bruno.almeida@example.com", "role": "editor"},
    {"id": 3, "nome": "Larissa Nunes", "email": "larissa.nunes@example.com", "role": "viewer"},
]

CLIENTES = [
    {"id": 1, "nome": "Ana Martins", "email": "ana.martins@example.com", "status": "active"},
    {"id": 2, "nome": "Paulo Lima", "email": "paulo.lima@example.com", "status": "active"},
]

PEDIDOS = [
    {"id": 1001, "clienteId": 1, "total": 249.9, "status": "open"},
    {"id": 1002, "clienteId": 2, "total": 799.0, "status": "processing"},
]

PRODUTOS = [
    {"id": 1, "nome": "Notebook Orion", "preco": 6499.9, "estoque": 6},
    {"id": 2, "nome": "Mouse Pulse", "preco": 119.9, "estoque": 24},
    {"id": 3, "nome": "Teclado Nova", "preco": 389.9, "estoque": 18},
]

CORES = [
    {"id": 1, "nome": "Azul Celeste"},
    {"id": 2, "nome": "Grafite"},
    {"id": 3, "nome": "Verde Sálvia"},
]

CATEGORIAS = [
    {"id": 1, "nome": "Eletrônicos"},
    {"id": 2, "nome": "Periféricos"},
    {"id": 3, "nome": "Acessórios"},
]


@app.get("/health")
def health():
    return {"status": "ok"}


@usuarios_router.get("/")
def listar_usuarios():
    return USUARIOS


@usuarios_router.get("/{id}")
def buscar_usuario(id: str):
    return {"id": id, "nome": "Camila Rocha", "email": "camila.rocha@example.com", "role": "admin"}


app.include_router(usuarios_router)


@app.get("/clientes")
def listar_clientes():
    return CLIENTES


@app.post("/clientes")
def criar_cliente(cliente: dict):
    return {"id": 3, **cliente}


@app.get("/pedidos")
def listar_pedidos():
    return PEDIDOS


@app.post("/pedidos")
def criar_pedido(pedido: dict):
    return {"id": 1003, **pedido}


@app.get("/pedidos/{id}/itens")
def listar_itens_do_pedido(id: str):
    return [
        {"pedidoId": id, "itemId": 1, "nome": "Notebook Orion", "quantidade": 1},
        {"pedidoId": id, "itemId": 2, "nome": "Mouse Pulse", "quantidade": 2},
    ]


@app.post("/pedidos/{id}/itens")
def adicionar_item_ao_pedido(id: str, item: dict):
    return {"pedidoId": id, "itemId": 3, **item}


@app.delete("/pedidos/{id}/itens/{item_id}")
def remover_item_do_pedido(id: str, item_id: str):
    return {"deleted": True, "pedidoId": id, "itemId": item_id}


@app.get("/produtos")
def listar_produtos():
    return PRODUTOS


@app.post("/produtos")
def criar_produto(produto: dict):
    return {"id": 4, **produto}


@app.get("/cores")
def listar_cores():
    return CORES


@app.post("/cores")
def criar_cor(cor: dict):
    return {"id": 4, **cor}


@app.get("/produtos/{id}/cores")
def listar_cores_do_produto(id: str):
    return [
        {"produtoId": id, "corId": 1, "nome": "Azul Celeste"},
        {"produtoId": id, "corId": 2, "nome": "Grafite"},
    ]


@app.get("/categorias")
def listar_categorias():
    return CATEGORIAS


@app.post("/categorias")
def criar_categoria(categoria: dict):
    return {"id": 4, **categoria}


@app.get("/categorias/{id}/produtos")
def listar_produtos_da_categoria(id: str):
    return [
        {"categoriaId": id, "produtoId": 1, "nome": "Notebook Orion"},
        {"categoriaId": id, "produtoId": 2, "nome": "Mouse Pulse"},
    ]
