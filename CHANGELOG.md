# Changelog

Todas as alterações relevantes deste projeto serão documentadas aqui.

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
