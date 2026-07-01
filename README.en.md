<div align="center">

<img src="resources/routelens-logo.png" alt="RouteLens logo" width="240" />

# RouteLens

[Portugu&#234;s](README.pt-BR.md) | [English](README.en.md)

<a href="https://github.com/mariaclaramonteirop">
  <img src="https://img.shields.io/badge/GitHub-@mariaclaramonteirop-181717?style=flat-square&logo=github" alt="GitHub profile" />
</a>
<a href="https://github.com/mariaclaramonteirop?tab=followers">
  <img src="https://img.shields.io/github/followers/mariaclaramonteirop?label=followers&style=flat-square" alt="Followers" />
</a>
<a href="https://github.com/mariaclaramonteirop/route-lens-extesion/issues">
  <img src="https://img.shields.io/github/issues/mariaclaramonteirop/route-lens-extesion?style=flat-square" alt="Issues" />
</a>
<a href="https://github.com/mariaclaramonteirop/route-lens-extesion/commits/main">
  <img src="https://img.shields.io/github/commit-activity/m/mariaclaramonteirop/route-lens-extesion?style=flat-square" alt="Commits" />
</a>

</div>

**RouteLens** is a Visual Studio Code extension that helps back-end developers visualize, navigate, copy, and document REST API routes directly inside the editor.

Current version: **0.4.1**

The extension automatically detects routes declared in the project and organizes them in an interactive side panel, making API structure easier to understand and maintain.

---

## Overview

In back-end projects, routes are often spread across files, groups, controllers, or modules. That makes navigation, documentation, and general API understanding harder than it needs to be.

**RouteLens** centralizes detected routes in a VS Code side tree.

With it, you can:

- quickly view all API endpoints
- inspect the HTTP method for each route
- jump straight to the file where a route is declared
- copy routes for testing
- generate technical documentation in Markdown

---

## Project Goal

The goal of **RouteLens** is to help back-end developers during API development, maintenance, and documentation.

The extension started with **PHP Slim** support and, since version 0.4.0, evolved into a multi-framework architecture with dedicated scanners for different REST ecosystems.

### Supported Frameworks

Current support:

- PHP Slim
- Express.js
- Laravel
- Spring Boot
- FastAPI
- ASP.NET Core

Planned ideas:

- Fastify
- NestJS
- Flask
- Django REST Framework
- Go with Gin, Echo, Fiber, or chi
- Ruby on Rails
- Sinatra
- Kotlin with Ktor
- Rust with Axum, Actix Web, or Rocket
- Phoenix
- Next.js API Routes and Route Handlers
- Cloudflare Workers
- Bun with Elysia

---

## Features

In version `0.4.1`, RouteLens provides:

- automatic route detection for PHP Slim projects
- HTTP method detection:
  - `GET`
  - `POST`
  - `PUT`
  - `PATCH`
  - `DELETE`
- route display in a VS Code side panel
- navigation to the source file and line where a route is declared
- detected language and framework shown per route
- copy route only
- copy method + route
- copy full URL using a configurable base URL
- grouping routes by file and resource
- automatic `API_ROUTES.md` generation
- visual organization of detected endpoints

For the V4 multi-framework line, the project also includes:

- architecture with separate scanners per framework
- dedicated PHP Slim scanner
- initial Express.js scanner
- initial Laravel scanner
- initial FastAPI scanner
- initial Spring Boot scanner
- initial ASP.NET Core scanner
- route language detection
- configuration to enable or disable scanners

---

## Detection Example

RouteLens recognizes routes written like this:

```php
$app->get('/usuarios', UsuarioController::class . ':listar');
$app->post('/usuarios', UsuarioController::class . ':criar');
$app->put('/usuarios/{id}', UsuarioController::class . ':atualizar');
$app->delete('/usuarios/{id}', UsuarioController::class . ':deletar');
```

And shows them in the side panel:

```txt
GET     /usuarios
POST    /usuarios
PUT     /usuarios/{id}
DELETE  /usuarios/{id}
```

---

## Panel Organization

```txt
RouteLens

Users
  GET     /usuarios
  POST    /usuarios
  PUT     /usuarios/{id}
  DELETE  /usuarios/{id}

Products
  GET     /produtos
  POST    /produtos
```

---

## Technology

The project is built with:

- TypeScript
- Node.js
- VS Code Extension API
- regex-based route detection
- Markdown documentation generation
- Node.js `assert` for automated parser tests
- `@vscode/vsce` for packaging the extension into `.vsix`
- GitHub Actions for continuous validation

---

## Project Structure

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

## Development

Install dependencies:

```bash
npm install
```

Compile the extension:

```bash
npm run compile
```

Run automated tests:

```bash
npm test
```

`npm test` compiles the project and runs the parser tests for the multi-framework scanners.

Build an installable `.vsix` package:

```bash
npm run package
```

The package is generated at the repository root as:

```txt
routelens-0.4.1.vsix
```

To test it in VS Code:

1. Open this project in VS Code
2. Go to **Run and Debug**
3. Choose a configuration:

```txt
Run RouteLens Extension - Multi-framework Examples
Run RouteLens Extension - PHP Slim
Run RouteLens Extension - Empty PHP
```

4. Press `F5`

The **PHP Slim** configuration opens only the PHP Slim sample project. The **Multi-framework Examples** configuration opens the entire `examples/` folder, which is useful for validating multiple scanners together. The **Empty PHP** configuration opens a project with no routes to validate the empty-state panel.

---

## Quality and CI

The project uses automated checks to reduce scanner regressions:

- `npm run compile` validates the TypeScript build
- `npm test` validates the parsers for PHP Slim, Laravel, Express.js, FastAPI, Spring Boot, and ASP.NET Core
- `npm run package` generates and validates the `.vsix` package
- GitHub Actions runs `npm test` on pushes to `main` and on pull requests
- CI also validates the `docker-compose.yml` file in the PHP Slim example

---

## How It Works

The extension flow is:

1. The user opens a project in VS Code
2. The extension scans the workspace files
3. The scanner looks for PHP Slim route patterns
4. The detected routes are turned into internal objects
5. The side panel shows the detected endpoints
6. The user can click a route to open its source file
7. The user can copy the route, method + route, or full URL from the context menu
8. The user can generate `API_ROUTES.md` at the workspace root

---

## Route Object Example

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

## How To Use

In the VS Code Explorer panel and in the Activity Bar, the extension exposes a **Routes** section.

RouteLens also appears as its own icon in the Activity Bar.

When PHP Slim routes are found, they appear like this:

```txt
index.php
  GET /health

routes.php
  users
    GET /usuarios        PHP • PHP Slim
    POST /usuarios       PHP • PHP Slim
    PUT /usuarios/{id}
    PATCH /usuarios/{id}
    DELETE /usuarios/{id}
```

Routes are grouped by the PHP file where they were declared. If there are files with the same name in different directories, RouteLens displays the relative workspace path to distinguish them.

Inside each file, routes are grouped by the first segment of the path. This can be turned off with `routelens.groupByResource`.

Available actions:

- click a route to open the file directly at the declaration line
- use the context menu to copy only the route
- use the context menu to copy method + route
- use **Copy Full URL** to copy the route with the configured base URL
- use the panel refresh button to scan again
- use **Detect Frameworks** to identify supported frameworks in the workspace
- use **Generate API_ROUTES.md** to document the detected routes
- use **Generate requests.http** to create executable requests
- use **Generate openapi.yaml** to export an OpenAPI specification
- use **Open API Preview** to view and test routes inside VS Code

If no route is found, the panel shows:

```txt
No routes found
```

### Generate documentation

The **RouteLens: Generate API_ROUTES.md** command creates `API_ROUTES.md` at the workspace root and organizes endpoints by source PHP file:

```md
# API Routes

## public/routes.php

### users

#### GET `/usuarios`

- Handler: `UsuarioController::class . ':listar'`
- Language: `PHP`
- Framework: `PHP Slim`
- Source: line 3
```

If the file already exists, the extension asks for confirmation before overwriting it.

### Configure the base URL

The `routelens.baseUrl` setting defines the URL used by **Copy Full URL** and by `API_ROUTES.md`.

Default value:

```txt
http://localhost:8080
```

You can change it in VS Code settings by searching for `RouteLens: Base Url`.

### Configure enabled frameworks

The `routelens.enabledFrameworks` setting defines which scanners are used.

Default value:

```json
["php-slim", "laravel", "express", "fastapi", "spring-boot", "aspnet-core"]
```

Supported frameworks at this stage:

- `php-slim`
- `laravel`
- `express`
- `fastapi`
- `spring-boot`
- `aspnet-core`

The **RouteLens: Detect Frameworks** command detects supported frameworks from dependency files and project structure, such as `composer.json`, `package.json`, `pom.xml`, `build.gradle`, `requirements.txt`, `pyproject.toml`, `Pipfile`, `.csproj`, and Laravel `routes/` folders. The `routelens.enabledFrameworks` setting still lets you control the active scanners manually.

---

### Generate HTTP requests

The **RouteLens: Generate requests.http** command creates a file compatible with tools such as REST Client. It uses the base URL, creates variables for route parameters, and adds a basic JSON body for methods that accept a body.

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

### OpenAPI and interactive preview

The **RouteLens: Generate openapi.yaml** command generates an OpenAPI 3.1 specification with:

- `servers` based on `routelens.baseUrl`
- tags created from resources
- path parameters such as `{id}`
- a basic JSON request body for `POST`, `PUT`, and `PATCH`
- a default `200` response

The **RouteLens: Open API Preview** command opens an internal interface inspired by Swagger UI. There you can expand endpoints, fill in parameters and JSON bodies, and send requests without leaving VS Code.

This preview is still an initial prototype. Automatic generation does not yet detect schemas, authentication, query parameters, or real response codes.

---

## Optional Docker Environment

The repository includes an optional Docker setup for testing PHP Slim route detection with an example API.

To start the example:

```bash
docker compose up --build
```

The API will be available at:

```txt
http://localhost:8080
```

Test route:

```txt
GET http://localhost:8080/health
```

The example lives in:

```txt
examples/php-slim/
```

This environment is not required for extension development. It is only there to support testing, demos, and scanner evolution.

---

## Multi-framework Examples

The repository includes route samples that help validate the current scanner and guide the V4 evolution.

Current examples:

- `examples/php-slim` - PHP Slim, with `usuarios` and `produtos`
- `examples/laravel` - PHP with Laravel, with `clientes`, `pedidos`, `itens`, `produtos`, `cores`, and `categorias`
- `examples/express` - JavaScript with Express.js, with `clientes`, `pedidos`, `itens`, `produtos`, `cores`, and `categorias`
- `examples/fastapi` - Python with FastAPI, with `clientes`, `pedidos`, `itens`, `produtos`, `cores`, and `categorias`
- `examples/spring-boot` - Java with Spring Boot, with `clientes`, `pedidos`, `itens`, `produtos`, `cores`, and `categorias`
- `examples/aspnet` - C# with ASP.NET Core Minimal APIs, with `clientes`, `pedidos`, `itens`, `produtos`, `cores`, and `categorias`

These examples use common business entities:

- customers
- orders
- order items
- products
- colors
- categories

---

## Roadmap

### Version 0.1 - MVP

- [x] Detect PHP Slim routes
- [x] Show routes in the side panel
- [x] Navigate to the route line
- [x] Copy route
- [x] Copy method + route

### Version 0.2

- [x] Generate `API_ROUTES.md`
- [x] Group routes by file
- [x] Group routes by resource
- [x] Allow base URL configuration
- [x] Improve the visual layout in the panel

### Version 0.3

- [x] Generate `.http` files
- [ ] Detect the associated controller
- [ ] Better handling of grouped routes
- [x] Generate a basic `openapi.yaml`
- [x] Use `baseUrl` in the `servers` section
- [x] Create tags by resource
- [x] Convert `{id}` into a path parameter
- [x] Provide an internal preview and execution experience

### Version 0.4 - V4 Multi-framework

- [x] Create the base scanner architecture
- [x] Split out the PHP Slim scanner
- [x] Add an initial Express.js scanner
- [x] Add an initial Laravel scanner
- [x] Add an initial FastAPI scanner
- [x] Add an initial Spring Boot scanner
- [x] Add an initial ASP.NET Core scanner
- [x] Allow scanners to be enabled or disabled through settings
- [x] Improve Express route handling with `router` prefixes
- [x] Improve group/prefix handling in FastAPI, Spring Boot, and ASP.NET Core
- [x] Detect the framework automatically from dependency files
- [x] Suggest compatible scanners through the **Detect Frameworks** command
- [x] Allow manual control of active scanners

### Version 0.4.1 - Quality and packaging

- [x] Add automated tests for scanner parsers
- [x] Update CI to run `npm test`
- [x] Add `npm run package`
- [x] Validate `.vsix` generation
- [x] Exclude tests from the final extension package

### Version 1.0

- [ ] OpenAPI export
- [ ] Refined interface
- [ ] VS Code Marketplace release

---

## Future Work

Ideas for the next steps:

- multi-framework support
- OpenAPI export in YAML and JSON
- route testing and visualization with Swagger UI
- detection of request bodies, query parameters, and headers
- generation of schemas, responses, and HTTP status codes
- authentication and security docs
- Postman integration
- `.http` file generation
- controller detection
- middleware detection
- filtering by HTTP method
- route name search
- support for multiple folders in the same workspace

---

## Why It Stands Out

**RouteLens** is not just a visual extension. It solves a real back-end problem: finding, understanding, and documenting API routes.

The tool combines organization, productivity, and technical documentation in one resource inside VS Code.

---

## Target Audience

This project is aimed at:

- back-end developers
- web development students
- people working with REST APIs
- teams that maintain APIs
- developers who want better documentation
- VS Code users

---

## Project Status

Version **0.4.1** is ready as the V4 multi-framework release with quality improvements.

The **V4 Multi-framework** line includes separated scanners and initial support for Express.js, Laravel, FastAPI, Spring Boot, and ASP.NET Core.

It is already possible to detect and organize routes by file and resource, jump to the declaration, copy full URLs, and generate `API_ROUTES.md`.

Version `0.4.1` adds automated parser tests, CI with `npm test`, and validated packaging with `npm run package`.

---

## Author

Developed by **Maria Clara Monteiro Pacheco**.

The project was created for learning, portfolio building, and useful back-end tooling.

---

## License

This project is distributed under the MIT License. See [LICENSE](LICENSE).

---

## Contributors

<a href="https://github.com/mariaclaramonteirop/route-lens-extesion/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=mariaclaramonteirop/route-lens-extesion" alt="Contributors" width="180" />
</a>

---

## Project Tagline

> Visualize, navigate, and document API routes directly in VS Code.

