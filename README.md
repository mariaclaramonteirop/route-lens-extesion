# RouteLens

**RouteLens** é uma extensão para Visual Studio Code desenvolvida para ajudar desenvolvedores back-end a visualizar, navegar, copiar e documentar rotas de APIs REST diretamente dentro do editor.

Versão atual: **0.2.0**

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

Futuramente, o projeto poderá evoluir para oferecer suporte a outros frameworks, como:

* Laravel;
* Express.js;
* Spring Boot.

---

## Funcionalidades

Na versão `0.2.0`, o RouteLens oferece:

* Detecção automática de rotas em projetos PHP Slim;
* Identificação dos métodos HTTP:

  * `GET`
  * `POST`
  * `PUT`
  * `PATCH`
  * `DELETE`
* Exibição das rotas em um painel lateral no VS Code;
* Navegação até o arquivo e linha onde a rota foi declarada;
* Opção para copiar apenas a rota;
* Opção para copiar método + rota;
* Opção para copiar a URL completa com uma base URL configurável;
* Agrupamento das rotas por arquivo e recurso;
* Geração automática do arquivo `API_ROUTES.md`;
* Organização visual dos endpoints encontrados.

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
Run RouteLens Extension - PHP Slim
Run RouteLens Extension - Empty PHP
```

4. Pressione `F5`.

A configuração **PHP Slim** abre um projeto de exemplo com rotas detectáveis. A configuração **Empty PHP** abre um projeto sem rotas para validar o estado vazio do painel.

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
    GET /usuarios
    POST /usuarios
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
* Use o botão **Generate API_ROUTES.md** para documentar as rotas encontradas.

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

* [ ] Suporte a Express.js;
* [ ] Geração de arquivos `.http`;
* [ ] Detecção do controller associado;
* [ ] Melhor tratamento para rotas em grupos.

### Versão 1.0

* [ ] Suporte a Laravel;
* [ ] Exportação em formato OpenAPI;
* [ ] Interface refinada;
* [ ] Publicação no Marketplace do VS Code.

---

## Funcionalidades Futuras

Algumas ideias para evolução do projeto:

* Suporte a múltiplos frameworks;
* Exportação para OpenAPI;
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

Versão **0.2.0** lançada para projetos PHP Slim.

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
