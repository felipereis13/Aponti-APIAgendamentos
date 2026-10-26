# Agendamentos

Aplicação para gerenciar agendamentos, com interface web em React e API REST em Node.js. Os dados são armazenados em PostgreSQL, e os serviços podem ser executados juntos com Docker Compose.

## Funcionalidades

- Criação, listagem, edição e exclusão de agendamentos.
- Cancelamento e conclusão de agendamentos.
- Filtros por status e período.
- Validação de dados e prevenção de conflitos de horário.
- Documentação interativa da API com Swagger UI.

## Tecnologias

| Componente | Tecnologias |
| --- | --- |
| Front-end | React, TypeScript, Vite e Tailwind CSS |
| API | Node.js, TypeScript, Express, Zod e node-postgres |
| Banco de dados | PostgreSQL |
| Contêineres | Docker, Docker Compose e Nginx |

## Estrutura do projeto

```text
.
├── Desafio Hospedagem/     # API REST
│   ├── src/               # Código-fonte da API e migração do banco
│   ├── tests/             # Testes da API
│   └── Dockerfile
├── frontend/              # Interface web
│   ├── src/               # Componentes, serviços e configurações
│   ├── docker-entrypoint.d/
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yaml    # API, front-end, banco e volume de dados
└── README.md
```

## Pré-requisitos

- Docker com suporte a contêineres Linux.
- Docker Compose v2, disponível pelo comando `docker compose`.
- Portas locais `3000` e `8080` disponíveis.

No Windows, mantenha o Docker Desktop iniciado. Não é necessário instalar Node.js ou PostgreSQL no computador para executar a aplicação pelo Docker.

## Executar com Docker

Na pasta raiz do projeto, onde está o arquivo `docker-compose.yaml`, execute:

```sh
docker compose up -d --build
```

O comando constrói as imagens da API e do front-end, baixa a imagem do PostgreSQL e inicia os três serviços. Na primeira execução, o download e a instalação das dependências podem demorar.

O Compose já contém a configuração para desenvolvimento local; não é necessário criar arquivos `.env` para esse fluxo. A API cria as tabelas e os índices automaticamente ao iniciar. O front-end aguarda a API ficar saudável antes de iniciar.

| Serviço | Endereço |
| --- | --- |
| Interface web | http://localhost:8080 |
| Saúde da API e do banco | http://localhost:3000/health |
| Documentação Swagger | http://localhost:3000/api-docs |
| Especificação OpenAPI | http://localhost:3000/api-docs/json |
| Agendamentos | http://localhost:3000/appointments |
| Saúde do front-end | http://localhost:8080/healthz |

A rota `/` da API não está definida. Para utilizar a interface, acesse a porta **8080**.

### Verificar a execução

```sh
docker compose ps
docker compose logs --tail 100 api frontend
docker compose logs -f api
```

Abra `http://localhost:3000/health` no navegador. A resposta esperada é:

```json
{
  "status": "ok",
  "database": "up"
}
```

Para testar a integração, abra a interface, crie um agendamento futuro, edite e cancele. Recarregue a página para verificar a persistência dos dados.

### Parar e reiniciar

Parar e remover os contêineres, preservando os dados do banco:

```sh
docker compose down
```

Iniciar novamente:

```sh
docker compose up -d
```

Após alterações no código, reconstrua as imagens:

```sh
docker compose up -d --build
```

## Configuração dos serviços

As variáveis usadas pelos contêineres estão na seção `environment` de cada serviço no `docker-compose.yaml`.

| Serviço | Variável | Valor no Compose | Função |
| --- | --- | --- | --- |
| API | `NODE_ENV` | `production` | Modo de execução da API |
| API | `PORT` | `3000` | Porta HTTP dentro do contêiner |
| API | `DATABASE_URL` | `postgres://postgres:postgres@db:5432/agendamentos` | Conexão com o banco local do Compose |
| API | `CORS_ORIGIN` | `http://localhost:8080` | Origem permitida para a interface |
| Front-end | `PORT` | `8080` | Porta HTTP do Nginx |
| Front-end | `API_URL` | `http://localhost:3000` | URL da API acessada pelo navegador |
| Banco | `POSTGRES_USER` | `postgres` | Usuário do banco local |
| Banco | `POSTGRES_PASSWORD` | `postgres` | Senha do banco local |
| Banco | `POSTGRES_DB` | `agendamentos` | Nome do banco local |

As credenciais acima são destinadas ao ambiente local. Em outros ambientes, configure credenciais próprias e mantenha a conexão do banco somente na API.

Dentro da rede do Docker, a API encontra o banco pelo nome `db`. O PostgreSQL utiliza a porta `5432` nessa rede, sem publicá-la no computador. Os dados ficam no volume `postgres_data` e são preservados por `docker compose down`.

O front-end gera `/runtime-config.js` ao iniciar o contêiner, utilizando `API_URL`. Também aceita `VITE_API_URL` como alternativa. Para desenvolvimento com Vite fora do Docker, utilize `VITE_API_URL` no arquivo `.env`, conforme `frontend/.env.example`.

A URL da API deve incluir `http://` ou `https://` e apontar para a raiz do serviço, sem `/appointments` ou `/health`. O valor de `CORS_ORIGIN` deve corresponder à origem do front-end, sem barra final. São aceitas várias origens separadas por vírgulas.

Após alterar as variáveis no Compose, execute `docker compose up -d` para recriar os serviços afetados.

## Imagens Docker

Os Dockerfiles utilizam dois estágios: compilação e execução. A imagem final da API executa o JavaScript compilado com o usuário `node`; a do front-end serve os arquivos estáticos com Nginx. Os arquivos `.dockerignore` excluem dependências locais, caches e arquivos `.env` dos contextos de build.

### Construir as imagens individualmente

Execute na raiz do projeto:

```sh
docker build -t api-agendamentos:local "./Desafio Hospedagem"
docker build -t frontend-agendamentos:local ./frontend
```

Para executar a aplicação completa com banco e rede configurados, utilize o Docker Compose.

### Imagens públicas no Docker Hub

| Componente | Repositório | Referência da imagem |
| --- | --- | --- |
| API | [api-agendamentos](https://hub.docker.com/r/felipermpires/api-agendamentos) | `felipermpires/api-agendamentos:v1` |
| Front-end | [frontend-agendamentos](https://hub.docker.com/r/felipermpires/frontend-agendamentos) | `felipermpires/frontend-agendamentos:v1` |

Para baixar as imagens publicadas:

```sh
docker pull felipermpires/api-agendamentos:v1
docker pull felipermpires/frontend-agendamentos:v1
```

## Rotas da API

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/health` | Verificar a API e a conexão com o banco |
| `GET` | `/appointments` | Listar agendamentos; aceita `status`, `from` e `to` |
| `GET` | `/appointments/:id` | Consultar um agendamento |
| `POST` | `/appointments` | Criar um agendamento |
| `PUT` | `/appointments/:id` | Atualizar campos de um agendamento |
| `PATCH` | `/appointments/:id/cancel` | Cancelar um agendamento |
| `PATCH` | `/appointments/:id/complete` | Concluir um agendamento |
| `DELETE` | `/appointments/:id` | Excluir um agendamento |

Consulte `/api-docs` para os formatos de requisição, validações e respostas.

## Testes da API

Execute os testes existentes dentro de um contêiner temporário do estágio de build:

```sh
docker build --target build -t api-agendamentos:test "./Desafio Hospedagem"
docker run --rm --mount "type=bind,source=./Desafio Hospedagem/tests,target=/app/tests,readonly" api-agendamentos:test npm test
```

Os testes atuais verificam validações, regras de negócio, tratamento de erros e especificação Swagger, sem depender de um banco ativo.

## Solução de problemas

| Problema | Verificação |
| --- | --- |
| Docker não conecta ao motor | Inicie o Docker Desktop e execute `docker info` |
| Porta ocupada | Libere as portas `3000` e `8080` ou ajuste os mapeamentos e as URLs correspondentes no Compose |
| API informa banco indisponível | Confira `docker compose logs db api` e a variável `DATABASE_URL` |
| Interface não conecta à API | Verifique `/health` na API e `/runtime-config.js` no front-end |
| Erro CORS | Confira se `CORS_ORIGIN` corresponde à origem usada para abrir a interface |
| Alteração no código não aparece | Execute `docker compose up -d --build` |
