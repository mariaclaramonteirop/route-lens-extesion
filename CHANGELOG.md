# Changelog

Todas as alterações relevantes deste projeto serão documentadas aqui.

## Unreleased

- Início da V4 Multi-framework.
- Arquitetura de scanners separados por framework.
- Scanner PHP Slim extraído para módulo dedicado.
- Scanner inicial para Express.js com suporte a `app` e `router`.
- Scanner inicial para Laravel com suporte a `Route::get`, `Route::post`, `Route::put`, `Route::patch` e `Route::delete`.
- Scanners iniciais para FastAPI, Spring Boot e ASP.NET Core.
- Linguagem e framework agora aparecem na árvore, tooltips e arquivos gerados.
- Configuração `routelens.enabledFrameworks` para habilitar ou desabilitar scanners.
- Exemplo Express.js adicionado em `examples/express`.
- Exemplo Laravel adicionado em `examples/laravel`.
- Exemplos de rotas comerciais adicionados para clientes, pedidos, itens, produtos, cores e categorias.
- Exemplos adicionados para FastAPI, Spring Boot e ASP.NET Core.

## 0.3.0

- Geração do arquivo `requests.http` com base nas rotas detectadas.
- Variáveis para parâmetros de path e exemplos de corpo JSON.
- Roadmap atualizado com geração de OpenAPI e visualização no Swagger UI.
- Geração inicial de especificações OpenAPI 3.1 em `openapi.yaml`.
- Prévia interativa para visualizar e executar endpoints dentro do VS Code.

## 0.2.0

- Agrupamento das rotas pelo arquivo PHP em que foram declaradas.
- Uso do caminho relativo quando arquivos diferentes possuem o mesmo nome.
- Geração do arquivo `API_ROUTES.md`, organizado pelo arquivo de origem.
- Confirmação antes de sobrescrever uma documentação existente.
- Configuração `routelens.baseUrl`, com padrão `http://localhost:8080`.
- Comando para copiar a URL completa de uma rota.
- Agrupamento das rotas pelo primeiro segmento do path dentro de cada arquivo.
- Configuração `routelens.groupByResource` para controlar esse agrupamento.

## 0.1.0

- Detecção de rotas PHP Slim para os métodos GET, POST, PUT, PATCH e DELETE.
- Painéis de rotas no Explorer e na barra de atividades.
- Navegação direta até o arquivo e a linha da declaração.
- Ações para copiar a rota ou o método com a rota.
- Estado vazio para workspaces sem rotas detectadas.
- Projetos PHP de exemplo para validação.

## 0.0.1

- Estrutura inicial do projeto.
