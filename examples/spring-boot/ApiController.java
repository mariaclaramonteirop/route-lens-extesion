package com.routelens.example;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ApiController {
    @GetMapping("/clientes")
    public List<Map<String, Object>> listarClientes() {
        return List.of(
            Map.of("id", 1, "nome", "Ana Martins", "email", "ana.martins@example.com", "status", "active"),
            Map.of("id", 2, "nome", "Paulo Lima", "email", "paulo.lima@example.com", "status", "active")
        );
    }

    @PostMapping("/clientes")
    public Map<String, Object> criarCliente(@RequestBody Map<String, Object> cliente) {
        return withId("3", cliente);
    }

    @PutMapping("/clientes/{id}")
    public Map<String, Object> atualizarCliente(@PathVariable String id, @RequestBody Map<String, Object> cliente) {
        return withId(id, cliente);
    }

    @PatchMapping("/clientes/{id}")
    public Map<String, Object> atualizarClienteParcial(@PathVariable String id, @RequestBody Map<String, Object> cliente) {
        return withId(id, cliente);
    }

    @DeleteMapping("/clientes/{id}")
    public Map<String, Object> removerCliente(@PathVariable String id) {
        return Map.of("deleted", true, "entity", "cliente", "id", id);
    }

    @GetMapping("/pedidos")
    public List<Map<String, Object>> listarPedidos() {
        return List.of(
            Map.of("id", 1001, "clienteId", 1, "total", 249.9, "status", "open"),
            Map.of("id", 1002, "clienteId", 2, "total", 799.0, "status", "processing")
        );
    }

    @PostMapping("/pedidos")
    public Map<String, Object> criarPedido(@RequestBody Map<String, Object> pedido) {
        return withId("1003", pedido);
    }

    @GetMapping("/pedidos/{id}/itens")
    public List<Map<String, Object>> listarItensDoPedido(@PathVariable String id) {
        return List.of(
            Map.of("pedidoId", id, "itemId", 1, "nome", "Notebook Orion", "quantidade", 1),
            Map.of("pedidoId", id, "itemId", 2, "nome", "Mouse Pulse", "quantidade", 2)
        );
    }

    @PostMapping("/pedidos/{id}/itens")
    public Map<String, Object> adicionarItemAoPedido(@PathVariable String id, @RequestBody Map<String, Object> item) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("pedidoId", id);
        response.put("itemId", 3);
        response.putAll(item);
        return response;
    }

    @DeleteMapping("/pedidos/{id}/itens/{itemId}")
    public Map<String, Object> removerItemDoPedido(@PathVariable String id, @PathVariable String itemId) {
        return Map.of("deleted", true, "pedidoId", id, "itemId", itemId);
    }

    @GetMapping("/produtos")
    public List<Map<String, Object>> listarProdutos() {
        return List.of(
            Map.of("id", 1, "nome", "Notebook Orion", "preco", 6499.9, "estoque", 6),
            Map.of("id", 2, "nome", "Mouse Pulse", "preco", 119.9, "estoque", 24),
            Map.of("id", 3, "nome", "Teclado Nova", "preco", 389.9, "estoque", 18)
        );
    }

    @PostMapping("/produtos")
    public Map<String, Object> criarProduto(@RequestBody Map<String, Object> produto) {
        return withId("4", produto);
    }

    @GetMapping("/cores")
    public List<Map<String, Object>> listarCores() {
        return List.of(
            Map.of("id", 1, "nome", "Azul Celeste"),
            Map.of("id", 2, "nome", "Grafite"),
            Map.of("id", 3, "nome", "Verde Sálvia")
        );
    }

    @PostMapping("/cores")
    public Map<String, Object> criarCor(@RequestBody Map<String, Object> cor) {
        return withId("4", cor);
    }

    @GetMapping("/produtos/{id}/cores")
    public List<Map<String, Object>> listarCoresDoProduto(@PathVariable String id) {
        return List.of(
            Map.of("produtoId", id, "corId", 1, "nome", "Azul Celeste"),
            Map.of("produtoId", id, "corId", 2, "nome", "Grafite")
        );
    }

    @GetMapping("/categorias")
    public List<Map<String, Object>> listarCategorias() {
        return List.of(
            Map.of("id", 1, "nome", "Eletrônicos"),
            Map.of("id", 2, "nome", "Periféricos"),
            Map.of("id", 3, "nome", "Acessórios")
        );
    }

    @PostMapping("/categorias")
    public Map<String, Object> criarCategoria(@RequestBody Map<String, Object> categoria) {
        return withId("4", categoria);
    }

    @GetMapping("/categorias/{id}/produtos")
    public List<Map<String, Object>> listarProdutosDaCategoria(@PathVariable String id) {
        return List.of(
            Map.of("categoriaId", id, "produtoId", 1, "nome", "Notebook Orion"),
            Map.of("categoriaId", id, "produtoId", 2, "nome", "Mouse Pulse")
        );
    }

    private Map<String, Object> withId(String id, Map<String, Object> payload) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", id);
        response.putAll(payload);
        return response;
    }
}
