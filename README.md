# Back-end – App de Gestão Financeira com IA

API em Node.js + TypeScript para um aplicativo de gestão financeira pessoal (web e mobile) com IA integrada.
O objetivo é ajudar pessoas a transformar dados financeiros em decisões práticas, com relatórios inteligentes, metas guiadas por IA e um chat financeiro em linguagem natural.

---

## Visão geral

Este repositório contém o back-end responsável por:

- Cadastro e autenticação de usuários (JWT)
- Verificação de e-mail por código numérico
- Reenvio de código de verificação
- Gestão de perfil:
  - Visualizar perfil do usuário autenticado
  - Atualizar nome e senha (com validação da senha atual)
  - Fluxo seguro de alteração de e-mail
  - Fluxo seguro de deleção de conta (senha + código por e-mail)
- Validação de entrada com **Zod**
- Integração com **PostgreSQL** via **TypeORM**
- Envio de e-mails transacionais com **Nodemailer**
- Infra básica para, no futuro, expor:
  - CRUD de transações (receitas, despesas, transferências)
  - Gestão de metas financeiras com suporte de IA
  - Relatórios mensais inteligentes
  - Chat financeiro com IA usando os dados do usuário como contexto

---

## Stack

- Node.js + TypeScript
- Express
- PostgreSQL
- TypeORM
- JWT para autenticação
- Zod para validação de schemas
- Docker / Docker Compose
- Nodemailer (SMTP)
- (Futuro) Swagger/OpenAPI para documentação

---

## Estrutura do projeto

```
src/
  app.ts                          # Configuração do Express
  server.ts                       # Bootstrap do servidor
  data-source.ts                  # Configuração do TypeORM

  routes/
    index.ts                      # Agregador de todas as rotas
    auth.ts                       # Rotas de autenticação
    profile.ts                    # Rotas de perfil

  middlewares/
    validateBody.ts               # Validação com Zod
    ensureAuth.ts                 # Middleware de JWT

  shared/
    providers/
      MailProvider.ts             # Nodemailer + funções de e-mail

  modules/
    user/
      entities/
        User.ts
      repositories/
        UserRepository.ts
      schemas/
        authSchemas.ts
        profileSchemas.ts
      services/
        UserService.ts
        ProfileService.ts
      controllers/
        AuthController.ts
        ProfileController.ts
```

---

## Como rodar em desenvolvimento

### Pré-requisitos

- Node.js LTS
- Docker e Docker Compose

### Passos

1. **Clonar o repositório**

```bash
git clone https://github.com/Projeto-Financeiro-com-IA-Integrada/Back-end.git
cd Back-end
```

2. **Criar arquivo `.env`**

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
DB_DATABASE=nome_do_banco

JWT_SECRET=uma_senha_bem_secreta
NODE_ENV=dev

SMTP_HOST=smtp.seuprovedor.com
SMTP_PORT=587
SMTP_USER=seu_usuario_smtp
SMTP_PASS=sua_senha_smtp
SMTP_FROM=nao-responda@seu-dominio.com
```

3. **Subir PostgreSQL**

```bash
docker compose up -d
```

4. **Instalar dependências**

```bash
npm install
```

5. **Rodar servidor**

```bash
npm run dev
```

A API estará disponível em `http://localhost:3000`

Swagger docs: `http://localhost:3000/api-docs`

---

## Endpoints disponíveis

### 🔐 Autenticação (`/auth`)

#### POST `/auth/register`

Cadastro de usuário + código de verificação por e-mail.

```json
{
  "email": "teste@example.com",
  "name": "Nome do Usuário",
  "password": "senhaForte123"
}
```

**Respostas:** `201` (sucesso), `409` (e-mail já existe), `400` (validação)

---

#### POST `/auth/verify-email`

Verificação de e-mail com código.

```json
{
  "email": "teste@example.com",
  "code": "123456"
}
```

**Respostas:** `200` (verificado), `400` (código inválido), `404` (não encontrado)

---

#### POST `/auth/login`

Login com JWT.

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

**Respostas:** `200` (sucesso), `401` (credenciais inválidas), `403` (e-mail não verificado)

---

#### POST `/auth/resend-code`

Reenviar código de verificação.

```json
{
  "email": "teste@example.com"
}
```

**Respostas:** `200` (enviado), `400` (já verificado), `404` (não encontrado)

---

### 👤 Perfil (`/user/profile`)

> **Todas exigem:** `Authorization: Bearer <seu_jwt>`

#### GET `/user/profile`

Retorna dados do usuário (sem senha).

**Resposta:**
```json
{
  "id": "uuid",
  "email": "teste@example.com",
  "name": "Nome",
  "isVerified": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

---

#### PATCH `/user/profile`

Atualiza nome e/ou senha.

```json
{
  "name": "Novo Nome"
}
```

Ou para alterar senha:

```json
{
  "currentPassword": "senhaForte123",
  "newPassword": "NovaSenha123"
}
```

**Respostas:** `200` (atualizado), `401` (senha incorreta), `400` (validação)

---

### 📧 Alteração de e-mail

#### POST `/user/profile/email/request`

Solicita alteração (envia código para novo e-mail).

```json
{
  "newEmail": "novo-email@example.com"
}
```

**Respostas:** `200` (código enviado), `409` (e-mail em uso), `404` (não encontrado)

---

#### PATCH `/user/profile/email/confirm`

Confirma alteração com código.

```json
{
  "newEmail": "novo-email@example.com",
  "verificationCode": "123456"
}
```

**Respostas:** `200` (alterado), `400` (código inválido), `404` (não encontrado)

---

### 🗑️ Deleção de conta

**Fluxo em 2 etapas:**
1. Informa senha → recebe código por e-mail
2. Confirma com código

#### POST `/user/profile/delete/request`

Valida senha e envia código de deleção.

```json
{
  "password": "suaSenhaAtual"
}
```

**Respostas:** `200` (código enviado), `401` (senha incorreta), `404` (não encontrado)

---

#### DELETE `/user/profile/delete/confirm`

Confirma deleção com código.

```json
{
  "verificationCode": "123456"
}
```

**Respostas:** `200` (conta deletada), `400` (código inválido), `404` (não encontrado)

---

## Próximos passos

- CRUD de transações financeiras
- Metas financeiras com IA
- Relatórios mensais inteligentes
- Chat financeiro com IA
- Documentação com Swagger/OpenAPI

---

## Como contribuir

- Abrir issues com bugs/sugestões
- Enviar pull requests com melhorias
- Usar como referência para estudar backend em Node.js + TypeScript

---

## Vídeo completo

Assista a uma demonstração completa do backend em ação:

📺 [Backend em Node.js + TypeScript - Auth, Perfil, E-mail e Segurança](https://www.youtube.com/watch?v=_p_ziqVnM24)
