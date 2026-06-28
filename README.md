# RouteLens

**RouteLens** é uma extensão para Visual Studio Code desenvolvida para ajudar desenvolvedores back-end a visualizar, navegar, copiar e documentar rotas de APIs REST diretamente dentro do editor.

Versão atual: **0.3.0**

A extensão identifica automaticamente rotas declaradas no projeto e as organiza em um painel lateral interativo, facilitando a manutenção e compreensão da estrutura da API.

---

## Visão Geral

Em projetos back-end, é comum que as rotas fiquem espalhadas entre arquivos, grupos, controllers ou módulos diferentes. Isso pode dificultar a navegação pelo código, a documentação dos endpoints e o entendimento geral da API.

O **RouteLens** resolve esse problema centralizando as rotas detectadas em uma árvore lateral no VS Code.

Com ele, o desenvolvedor pode:

* visualizar rapidamente todos os endpoints da API;
* identificar o método HTTP de cada rota;
* navegar diretamente até o arquivo onde a rota foi declarada;
* copiar rotas para testes;
* gerar documentação técnica em Markdown.

---

## Objetivo do Projeto

O objetivo do **RouteLens** é facilitar a vida de desenvolvedores back-end durante o desenvolvimento, manutenção e documentação de APIs REST.

A extensão atualmente oferece suporte a projetos desenvolvidos com **PHP Slim**, framework utilizado em APIs simples, organizadas e performáticas.

Futuramente, o projeto poderá evoluir para oferecer suporte a outros frameworks e ecossistemas de APIs REST, como Express.js, Laravel, Spring Boot, FastAPI e ASP.NET Core.

### Frameworks planejados

O suporte estável atual é focado em **PHP Slim**. A V4 foi iniciada com uma arquitetura multi-scanner e suporte inicial a novos frameworks.

**Em desenvolvimento**

* Express.js;
* Laravel;
* Spring Boot;
* FastAPI;
* ASP.NET Core.

**Ideias futuras**

* Fastify;
* NestJS;
* Flask;
* Django REST Framework;
* Go com Gin, Echo, Fiber ou chi;
* Ruby on Rails;
* Sinatra;
* Kotlin com Ktor;
* Rust com Axum, Actix Web ou Rocket;
* Phoenix;
* Next.js API Routes e Route Handlers;
* Cloudflare Workers;
* Bun com Elysia.

---

## Funcionalidades

Na versão `0.3.0`, o RouteLens oferece:

* Detecção automática de rotas em projetos PHP Slim;
* Identificação dos métodos HTTP:

  * `GET`
  * `POST`
  * `PUT`
  * `PATCH`
  * `DELETE`
* Exibição das rotas em um painel lateral no VS Code;
* Navegação até o arquivo e linha onde a rota foi declarada;
* Exibição da linguagem e framework detectados por rota;
* Opção para copiar apenas a rota;
* Opção para copiar método + rota;
* Opção para copiar a URL completa com uma base URL configurável;
* Agrupamento das rotas por arquivo e recurso;
* Geração automática do arquivo `API_ROUTES.md`;
* Organização visual dos endpoints encontrados.

Na V4 em desenvolvimento, o projeto iniciou:

* Arquitetura de scanners separados por framework;
* Scanner dedicado para PHP Slim;
* Scanner inicial para Express.js;
* Scanner inicial para Laravel;
* Scanner inicial para FastAPI;
* Scanner inicial para Spring Boot;
* Scanner inicial para ASP.NET Core;
* Identificação da linguagem da rota;
* Configuração para habilitar ou desabilitar scanners.

---

## Exemplo de Detecção

A extensão identifica rotas declaradas no formato:

```php
$app->get('/usuarios', UsuarioController::class . ':listar');
$app->post('/usuarios', UsuarioController::class . ':criar');
$app->put('/usuarios/{id}', UsuarioController::class . ':atualizar');
$app->delete('/usuarios/{id}', UsuarioController::class . ':deletar');
```

E exibir no painel lateral:

```txt
GET     /usuarios
POST    /usuarios
PUT     /usuarios/{id}
DELETE  /usuarios/{id}
```

---

## Exemplo de Organização no Painel

```txt
RouteLens

Usuários
  GET     /usuarios
  POST    /usuarios
  PUT     /usuarios/{id}
  DELETE  /usuarios/{id}

Produtos
  GET     /produtos
  POST    /produtos
```

---

## Tecnologias Utilizadas

O projeto é desenvolvido utilizando:

* TypeScript;
* Node.js;
* VS Code Extension API;
* Regex para detecção inicial das rotas;
* Markdown para geração de documentação.

---

## Estrutura Inicial do Projeto

```txt
routelens-vscode/
├── src/
│   ├── extension.ts
│   ├── routeScanner.ts
│   ├── routeTreeProvider.ts
│   ├── markdownGenerator.ts
│   └── types/
│       └── Route.ts
├── examples/
│   ├── php-slim/
│   └── php-empty/
├── package.json
├── tsconfig.json
├── README.md
├── CHANGELOG.md
└── LICENSE
```

---

## Como Executar em Desenvolvimento

Instale as dependências:

```bash
npm install
```

Compile a extensão:

```bash
npm run compile
```

Para testar no VS Code:

1. Abra este projeto no VS Code;
2. Acesse **Run and Debug**;
3. Escolha uma configuração:

```txt
Run RouteLens Extension - Multi-framework Examples
Run RouteLens Extension - PHP Slim
Run RouteLens Extension - Empty PHP
```

4. Pressione `F5`.

A configuração **PHP Slim** abre apenas o projeto PHP Slim de exemplo. A configuração **Multi-framework Examples** abre a pasta `examples/` inteira, permitindo validar os scanners disponíveis juntos. A configuração **Empty PHP** abre um projeto sem rotas para validar o estado vazio do painel.

---

## Como Usar

No painel Explorer do VS Code e na barra de atividades do VS Code, a extensão exibe a seção **Routes**.

O RouteLens também aparece como um ícone próprio na barra de atividades do VS Code.

Quando rotas PHP Slim forem encontradas, elas aparecerão no formato:

```txt
index.php
  GET /health

routes.php
  usuarios
    GET /usuarios        PHP • PHP Slim
    POST /usuarios       PHP • PHP Slim
    PUT /usuarios/{id}
    PATCH /usuarios/{id}
    DELETE /usuarios/{id}
```

As rotas são agrupadas pelo arquivo PHP em que foram declaradas. Se houver
arquivos com o mesmo nome em diretórios diferentes, o RouteLens exibe o caminho
relativo ao workspace para diferenciá-los.

Dentro de cada arquivo, as rotas são agrupadas pelo primeiro segmento do path.
Esse comportamento pode ser desativado pela configuração
`routelens.groupByResource`.

Ações disponíveis:

* Clique em uma rota para abrir o arquivo diretamente na linha da declaração;
* Use o menu de contexto para copiar apenas a rota;
* Use o menu de contexto para copiar método + rota;
* Use **Copy Full URL** para copiar a rota com a base URL configurada;
* Use o botão de refresh do painel para executar a detecção novamente;
* Use **Detect Frameworks** para identificar frameworks suportados no workspace;
* Use o botão **Generate API_ROUTES.md** para documentar as rotas encontradas;
* Use o botão **Generate requests.http** para criar requisições executáveis;
* Use **Generate openapi.yaml** para exportar uma especificação OpenAPI;
* Use **Open API Preview** para visualizar e testar as rotas dentro do VS Code.

Se nenhuma rota for encontrada, o painel exibirá:

```txt
No routes found
```

### Gerar documentação

O comando **RouteLens: Generate API_ROUTES.md** cria o arquivo `API_ROUTES.md` na raiz do
workspace e organiza os endpoints pelo arquivo PHP de origem:

```md
# API Routes

## public/routes.php

### usuarios

#### GET `/usuarios`

- Handler: `UsuarioController::class . ':listar'`
- Language: `PHP`
- Framework: `PHP Slim`
- Source: line 3
```

Se o arquivo já existir, a extensão solicita confirmação antes de sobrescrevê-lo.

### Configurar a base URL

A configuração `routelens.baseUrl` define a URL usada pelo comando
**Copy Full URL** e pelo arquivo `API_ROUTES.md`.

O valor padrão é:

```txt
http://localhost:8080
```

Ela pode ser alterada nas configurações do VS Code, pesquisando por
`RouteLens: Base Url`.

### Configurar frameworks habilitados

A configuração `routelens.enabledFrameworks` define quais scanners serão usados.

Valor padrão da V4 em desenvolvimento:

```json
["php-slim", "laravel", "express", "fastapi", "spring-boot", "aspnet-core"]
```

Frameworks disponíveis nesta etapa:

* `php-slim`
* `laravel`
* `express`
* `fastapi`
* `spring-boot`
* `aspnet-core`

O comando **RouteLens: Detect Frameworks** identifica frameworks suportados a partir de
arquivos de dependência e estrutura do projeto, como `composer.json`, `package.json`,
`pom.xml`, `build.gradle`, `requirements.txt`, `pyproject.toml`, `Pipfile`, `.csproj`
e pastas `routes/` do Laravel. A configuração `routelens.enabledFrameworks` continua
permitindo controle manual dos scanners ativos.

---

### Gerar requisições HTTP

O comando **RouteLens: Generate requests.http** cria um arquivo compatível com
extensões como REST Client. Ele utiliza a `baseUrl`, cria variáveis para
parâmetros de rota e adiciona um corpo JSON básico nos métodos que aceitam body.

```http
@baseUrl = http://localhost:8080
@id = 1

### GET /usuarios
GET {{baseUrl}}/usuarios

### PUT /usuarios/{id}
PUT {{baseUrl}}/usuarios/{{id}}
Content-Type: application/json

{
  "example": "value"
}
```

---

### OpenAPI e prévia interativa

O comando **RouteLens: Generate openapi.yaml** gera uma especificação OpenAPI
3.1 com:

* `servers` baseado na configuração `routelens.baseUrl`;
* tags criadas a partir dos recursos;
* parâmetros de path, como `{id}`;
* request body JSON básico para `POST`, `PUT` e `PATCH`;
* resposta padrão `200`.

O comando **RouteLens: Open API Preview** abre uma interface interna inspirada
no Swagger UI. Nela é possível expandir os endpoints, preencher parâmetros e
corpos JSON e executar requisições sem sair do VS Code.

Essa prévia é um protótipo inicial. A geração automática ainda não detecta
schemas, autenticação, parâmetros de query ou códigos de resposta reais.

---

## Ambiente Docker Opcional

O projeto inclui um ambiente Docker opcional para testar a detecção de rotas PHP Slim com uma API de exemplo.

Para subir o exemplo:

```bash
docker compose up --build
```

A API ficará disponível em:

```txt
http://localhost:8080
```

Rota de teste:

```txt
GET http://localhost:8080/health
```

O exemplo fica em:

```txt
examples/php-slim/
```

Esse ambiente não é necessário para desenvolver a extensão. Ele serve apenas como apoio para testes, demonstração e evolução do scanner.

---

## Exemplos Multi-framework

O repositório inclui exemplos de rotas para validar o scanner atual e orientar a evolução da V4.

Exemplos detectados atualmente:

* `examples/php-slim` — PHP Slim, com `usuarios` e `produtos`;
* `examples/laravel` — PHP com Laravel, com `clientes`, `pedidos`, `itens`, `produtos`, `cores` e `categorias`;
* `examples/express` — JavaScript com Express.js, com `clientes`, `pedidos`, `itens`, `produtos`, `cores` e `categorias`;
* `examples/fastapi` — Python com FastAPI, com `clientes`, `pedidos`, `itens`, `produtos`, `cores` e `categorias`;
* `examples/spring-boot` — Java com Spring Boot, com `clientes`, `pedidos`, `itens`, `produtos`, `cores` e `categorias`;
* `examples/aspnet` — C# com ASP.NET Core Minimal APIs, com `clientes`, `pedidos`, `itens`, `produtos`, `cores` e `categorias`.

Esses exemplos usam recursos comuns em APIs comerciais:

* clientes;
* pedidos;
* itens de pedido;
* produtos;
* cores;
* categorias.

---

## Como Funciona

O fluxo da extensão é:

1. O usuário abre um projeto no VS Code;
2. A extensão verifica os arquivos do workspace;
3. O scanner procura padrões de rotas PHP Slim;
4. As rotas encontradas são transformadas em objetos internos;
5. O painel lateral exibe os endpoints detectados;
6. O usuário pode clicar em uma rota para abrir o arquivo correspondente;
7. O usuário pode copiar a rota, método + rota ou URL completa pelo menu de contexto;
8. O usuário pode gerar o arquivo `API_ROUTES.md` na raiz do workspace.

---

## Exemplo de Objeto de Rota

```ts
export interface Route {
  method: string;
  path: string;
  filePath: string;
  line: number;
  handler?: string;
  resource?: string;
}
```

---

## Roadmap

### Versão 0.1 — MVP

* [x] Detectar rotas PHP Slim;
* [x] Exibir rotas no painel lateral;
* [x] Navegar até a linha da rota;
* [x] Copiar rota;
* [x] Copiar método + rota.

### Versão 0.2

* [x] Gerar arquivo `API_ROUTES.md`;
* [x] Agrupar rotas por arquivo;
* [x] Agrupar rotas por recurso;
* [x] Permitir configuração de base URL;
* [x] Melhorar a exibição visual no painel.

### Versão 0.3

* [x] Geração de arquivos `.http`;
* [ ] Detecção do controller associado;
* [ ] Melhor tratamento para rotas em grupos;
* [x] Gerar especificação básica em `openapi.yaml`;
* [x] Usar a `baseUrl` na seção `servers`;
* [x] Criar tags por recurso;
* [x] Converter `{id}` em parâmetro de path;
* [x] Permitir visualização e execução em uma prévia interna.

### Versão 0.4 — V4 Multi-framework

* [x] Criar arquitetura base de scanners;
* [x] Separar scanner PHP Slim;
* [x] Adicionar scanner inicial para Express.js;
* [x] Adicionar scanner inicial para Laravel;
* [x] Adicionar scanner inicial para FastAPI;
* [x] Adicionar scanner inicial para Spring Boot;
* [x] Adicionar scanner inicial para ASP.NET Core;
* [x] Permitir habilitar e desabilitar scanners por configuração;
* [x] Melhorar tratamento de rotas Express com prefixos de `router`;
* [x] Melhorar tratamento de grupos/prefixos em FastAPI, Spring Boot e ASP.NET Core;
* [x] Detectar automaticamente o framework do projeto por arquivos de dependência;
* [x] Sugerir scanners compatíveis com o workspace pelo comando **Detect Frameworks**;
* [x] Permitir configuração manual dos scanners ativos.

### Versão 1.0

* [ ] Exportação em formato OpenAPI;
* [ ] Interface refinada;
* [ ] Publicação no Marketplace do VS Code.

---

## Funcionalidades Futuras

Algumas ideias para evolução do projeto:

* Suporte a múltiplos frameworks;
* Exportação para OpenAPI em YAML e JSON;
* Visualização e teste de endpoints com Swagger UI;
* Detecção de request bodies, parâmetros de query e headers;
* Geração de schemas, respostas e códigos HTTP;
* Documentação de autenticação e requisitos de segurança;
* Integração com Postman;
* Geração de arquivos `.http`;
* Detecção de controllers;
* Detecção de middlewares;
* Filtro por método HTTP;
* Busca por nome da rota;
* Suporte a múltiplas pastas no mesmo workspace.

---

## Diferencial

O **RouteLens** não é apenas uma extensão visual. Ele resolve uma dor real em projetos back-end: a dificuldade de localizar, entender e documentar rotas de API.

A ferramenta une organização, produtividade e documentação técnica em um único recurso dentro do VS Code.

---

## Público-Alvo

Este projeto é voltado para:

* desenvolvedores back-end;
* estudantes de desenvolvimento web;
* pessoas que trabalham com APIs REST;
* equipes que precisam manter APIs;
* desenvolvedores que desejam documentar melhor seus projetos;
* usuários do VS Code.

---

## Status do Projeto

Versão **0.3.0** pronta para projetos PHP Slim.

A **V4 Multi-framework** foi iniciada em desenvolvimento, com arquitetura de scanners separados e suporte inicial a Express.js, Laravel, FastAPI, Spring Boot e ASP.NET Core.

Já é possível detectar e organizar rotas por arquivo e recurso, navegar até a declaração, copiar URLs completas e gerar documentação em `API_ROUTES.md`.

---

## Autora

Desenvolvido por **Maria Clara Monteiro Pacheco**.

Projeto criado com foco em aprendizado, portfólio e desenvolvimento de ferramentas úteis para o ecossistema back-end.

---

## Licença

Este projeto é distribuído sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE).

---

## Frase do Projeto

> Visualize, navegue e documente rotas de APIs diretamente no VS Code.
