# Back-end – App de Gestão Financeira com IA

API em Node.js + TypeScript para um aplicativo de gestão financeira pessoal (web e mobile) com IA integrada. O objetivo é ajudar pessoas a transformar dados financeiros em decisões práticas, com relatórios inteligentes, metas guiadas por IA e um chat financeiro em linguagem natural.

## Visão geral

Este repositório contém o back-end responsável por:

- Cadastro e autenticação de usuários (JWT)
- Verificação de e-mail por código numérico
- Validação de entrada com Zod
- Integração com PostgreSQL via TypeORM
- Infra básica para, no futuro, expor:
  - CRUD de transações (receitas, despesas, transferências)
  - Gestão de metas financeiras com suporte de IA
  - Relatórios mensais inteligentes
  - Chat financeiro com IA usando os dados do usuário como contexto

## Stack

- Node.js + TypeScript
- Express
- PostgreSQL
- TypeORM
- JWT para autenticação
- Zod para validação de schemas
- Docker / Docker Compose
- (Futuro) Swagger/OpenAPI para documentação

## Estrutura do projeto

```
src/
  app.ts                # Configuração do Express
  index.ts              # Bootstrap do servidor + conexão com DB
  data-source.ts        # Configuração do TypeORM
  middlewares/
    validateBody.ts     # Validação de body com Zod
    ensureAuth.ts       # (futuro) Middleware de autenticação JWT
  routes/
    auth.ts             # Rotas de autenticação (/auth)
  modules/
    user/
      entities/
        User.ts         # Entidade User (TypeORM)
      repositories/
        UserRepository.ts
      services/
        UserService.ts  # Lógica de register, verify-email, login
      controllers/
        AuthController.ts
      schemas/
        authSchemas.ts  # Schemas Zod (register, login, verify-email)
```

## Como rodar em desenvolvimento

### Pré-requisitos

- Node.js LTS
- Docker e Docker Compose

### Passos

1. Clonar o repositório:

```bash
git clone https://github.com/Projeto-Financeiro-com-IA-Integrada/Back-end.git
cd Back-end
```

2. Criar o arquivo `.env` na raiz:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=[your username]
DB_PASSWORD=[your password]
DB_DATABASE=[your name DB]

JWT_SECRET=uma_senha_bem_secreta
NODE_ENV=dev
```

3. Subir o PostgreSQL com Docker:

```bash
docker compose up -d
```

4. Instalar dependências:

```bash
npm install
```

5. Rodar o servidor em modo desenvolvimento:

```bash
npm run dev
```

A API ficará disponível em `http://localhost:3000`.

## Endpoints disponíveis (MVP atual)

### POST /auth/register

Cadastro de usuário + geração de código de verificação.

**Body:**

```json
{
  "email": "teste@example.com",
  "name": "Nome do Usuário",
  "password": "senhaForte123"
}
```

**Respostas comuns:**

- `201` – Usuário criado, código de verificação gerado.
- `409` – E-mail já cadastrado.
- `400` – Corpo inválido (validação Zod).

### POST /auth/verify-email

Verificação de e-mail por código numérico.

**Body:**

```json
{
  "email": "teste@example.com",
  "code": "123456"
}
```

**Respostas comuns:**

- `200` – E-mail verificado.
- `400` – Código inválido ou expirado.
- `404` – Usuário não encontrado.

### POST /auth/login

Autenticação com e-mail e senha; retorna JWT para uso nas rotas protegidas.

**Body:**

```json
{
  "email": "teste@example.com",
  "password": "senhaForte123"
}
```

**Resposta:**

```json
{
  "accessToken": "jwt_aqui"
}
```

**Respostas comuns:**

- `200` – Login realizado.
- `401` – Credenciais inválidas.
- `403` – E-mail não verificado.

## Próximos passos do back-end

- Middleware `ensureAuth` e rota `GET /auth/me`
- CRUD de transações financeiras
- Rotas de metas financeiras com suporte de IA
- Endpoints de relatório mensal inteligente e chat financeiro com IA
