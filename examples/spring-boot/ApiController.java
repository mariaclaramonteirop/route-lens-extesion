package com.routelens.example;

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
        return List.of();
    }

    @PostMapping("/clientes")
    public Map<String, Object> criarCliente(@RequestBody Map<String, Object> cliente) {
        return cliente;
    }

    @PutMapping("/clientes/{id}")
    public Map<String, Object> atualizarCliente(@PathVariable String id, @RequestBody Map<String, Object> cliente) {
        return cliente;
    }

    @PatchMapping("/clientes/{id}")
    public Map<String, Object> atualizarClienteParcial(@PathVariable String id, @RequestBody Map<String, Object> cliente) {
        return cliente;
    }

    @DeleteMapping("/clientes/{id}")
    public void removerCliente(@PathVariable String id) {
    }

    @GetMapping("/pedidos")
    public List<Map<String, Object>> listarPedidos() {
        return List.of();
    }

    @PostMapping("/pedidos")
    public Map<String, Object> criarPedido(@RequestBody Map<String, Object> pedido) {
        return pedido;
    }

    @GetMapping("/pedidos/{id}/itens")
    public List<Map<String, Object>> listarItensDoPedido(@PathVariable String id) {
        return List.of();
    }

    @PostMapping("/pedidos/{id}/itens")
    public Map<String, Object> adicionarItemAoPedido(@PathVariable String id, @RequestBody Map<String, Object> item) {
        return item;
    }

    @DeleteMapping("/pedidos/{id}/itens/{itemId}")
    public void removerItemDoPedido(@PathVariable String id, @PathVariable String itemId) {
    }

    @GetMapping("/produtos")
    public List<Map<String, Object>> listarProdutos() {
        return List.of();
    }

    @PostMapping("/produtos")
    public Map<String, Object> criarProduto(@RequestBody Map<String, Object> produto) {
        return produto;
    }

    @GetMapping("/cores")
    public List<Map<String, Object>> listarCores() {
        return List.of();
    }

    @PostMapping("/cores")
    public Map<String, Object> criarCor(@RequestBody Map<String, Object> cor) {
        return cor;
    }

    @GetMapping("/produtos/{id}/cores")
    public List<Map<String, Object>> listarCoresDoProduto(@PathVariable String id) {
        return List.of();
    }

    @GetMapping("/categorias")
    public List<Map<String, Object>> listarCategorias() {
        return List.of();
    }

    @PostMapping("/categorias")
    public Map<String, Object> criarCategoria(@RequestBody Map<String, Object> categoria) {
        return categoria;
    }

    @GetMapping("/categorias/{id}/produtos")
    public List<Map<String, Object>> listarProdutosDaCategoria(@PathVariable String id) {
        return List.of();
    }
}
