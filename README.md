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
- Rate limiting com **Redis** para proteção contra brute-force
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
- Redis para rate limiting e cache
- Docker / Docker Compose
- Nodemailer (SMTP)
- (Futuro) Swagger/OpenAPI para documentação

---

## Pré-requisitos

- Node.js (v18+)
- Docker & Docker Compose
- npm ou yarn

---

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/Projeto-Financeiro-com-IA-Integrada/Back-end.git
cd Back-end
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto e preencha com as seguintes variáveis:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=finapp_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Email Config (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_gmail@gmail.com

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Nota:** Para Gmail, use uma [App Password](https://support.google.com/accounts/answer/185833) em vez de sua senha normal.

### 4. Inicie os containers (PostgreSQL + Redis)

```bash
docker-compose up -d
```

Verifique se os containers estão rodando:

```bash
docker-compose ps
```

### 5. Execute o servidor em desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

---

## Endpoints da API

### Autenticação

#### POST `/auth/register`

Registro de novo usuário com envio de código de verificação por e-mail.

```json
{
  "email": "user@example.com",
  "name": "João da Silva",
  "password": "senhaForte123"
}
```

**Respostas:**
- `201` (Criado), `400` (Validação)

#### POST `/auth/verify-email`

Verificação de e-mail com código numérico.

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Respostas:**
- `200` (Sucesso), `400` (Código inválido), `429` (Muitas tentativas - Rate Limit)

#### POST `/auth/resend-code`

Reenvio de código de verificação.

```json
{
  "email": "user@example.com"
}
```

**Respostas:**
- `200` (Reenviado), `400` (E-mail não existe)

#### POST `/auth/login`

Login com JWT.

```json
{
  "email": "user@example.com",
  "password": "senhaForte123"
}
```

**Respostas:**
- `200` (Token JWT), `401` (Credenciais inválidas)

---

### Perfil

#### GET `/profile`

Visualizar perfil do usuário autenticado.

**Headers:** `Authorization: Bearer <token>`

**Respostas:**
- `200` (Perfil), `401` (Não autenticado)

#### PATCH `/profile`

Atualizar nome e/ou senha do usuário.

```json
{
  "name": "Novo Nome (opcional)",
  "currentPassword": "senhaAtual",
  "newPassword": "novaSenha123 (opcional)"
}
```

**Headers:** `Authorization: Bearer <token>`

**Respostas:**
- `200` (Atualizado), `400` (Validação), `401` (Não autenticado), `403` (Senha incorreta)

#### POST `/profile/change-email`

Iniciar fluxo de alteração de e-mail (Etapa 1: Validar senha).

```json
{
  "newEmail": "newemail@example.com",
  "password": "suaSenha"
}
```

**Headers:** `Authorization: Bearer <token>`

**Respostas:**
- `200` (Código enviado para novo e-mail), `400` (Validação), `401` (Não autenticado), `403` (Senha incorreta)

#### POST `/profile/verify-email-change`

Concluir alteração de e-mail (Etapa 2: Validar código).

```json
{
  "code": "123456"
}
```

**Headers:** `Authorization: Bearer <token>`

**Respostas:**
- `200` (E-mail alterado), `400` (Código inválido), `401` (Não autenticado)

#### POST `/profile/delete`

Iniciar fluxo seguro de deleção de conta (Etapa 1: Validar senha).

```json
{
  "password": "suaSenha"
}
```

**Headers:** `Authorization: Bearer <token>`

**Respostas:**
- `200` (Código enviado), `401` (Não autenticado), `403` (Senha incorreta)

#### POST `/profile/confirm-delete`

Confirmar deleção de conta (Etapa 2: Validar código).

```json
{
  "code": "123456"
}
```

**Headers:** `Authorization: Bearer <token>`

**Respostas:**
- `200` (Conta deletada), `400` (Código inválido), `401` (Não autenticado)

---

## Segurança

### Rate Limiting com Redis

Os endpoints de autenticação utilizam **Redis** para implementar rate limiting contra ataques de brute-force:

- **Verificação de e-mail:** Máximo 5 tentativas em 15 minutos
- **Bloqueio:** Após exceder o limite, a conta é bloqueada por 30 minutos
- **Detecção:** IP/email são rastreados para detecção de abuso

### Validação de Entrada

Todas as rotas utilizam **Zod** para validação de schemas, garantindo tipos seguros e dados válidos.

### Autenticação

- JWT para sessões de usuário
- Senhas criptografadas com bcrypt
- Códigos de verificação gerados aleatoriamente

---

## Estrutura do Projeto

```
src/
├── modules/
│   └── user/
│       ├── controllers/      # Lógica de requisição/resposta
│       ├── services/         # Lógica de negócio
│       ├── repositories/     # Acesso a dados (TypeORM)
│       ├── schemas/          # Validação com Zod
│       ├── entities/         # Modelos de banco de dados
│       └── routes/           # Definição de endpoints
├── shared/
│   ├── providers/
│   ├── middlewares/          # Autenticação, validação, etc.
│   └── utils/
├── data-source.ts            # Configuração TypeORM
├── app.ts                    # Instância Express
└── server.ts                 # Inicialização do servidor
```

---

## Desenvolvimento

### Scripts disponíveis

```bash
# Desenvolvimento com hot-reload
npm run dev

# Build para produção
npm run build

# Executar versão compilada
npm run start

# TypeORM CLI (migrations, etc.)
npm run typeorm
```

### Logs do Docker Compose

```bash
# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs apenas do Redis
docker-compose logs -f redis

# Ver logs apenas do PostgreSQL
docker-compose logs -f db
```

---

## Roadmap

- [ ] CRUD de transações (receitas, despesas, transferências)
- [ ] Gestão de metas financeiras
- [ ] Relatórios mensais com IA
- [ ] Chat financeiro em tempo real
- [ ] Integração com IA (OpenAI/Claude)
- [ ] Webhooks para eventos de transação
- [ ] Documentação Swagger/OpenAPI
- [ ] Testes automatizados (Jest)

---

## Troubleshooting

### Redis não conecta

```bash
# Verificar se o container está rodando
docker-compose ps

# Reiniciar os containers
docker-compose restart
```

### Erro de conexão com PostgreSQL

```bash
# Verificar logs do banco
docker-compose logs db

# Resetar volume de dados (CUIDADO: Deleta dados!)
docker-compose down -v
docker-compose up -d
```

---

## Contribuindo

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## Contato

Projeto criado como parte da visão de democratizar a educação financeira com IA.

Para dúvidas ou sugestões, abra uma issue no repositório ou entre em contato direto.
