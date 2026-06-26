# 🎁 GitHub Wrapped

> Descubra seu ano em código. Commits, linguagens, horários e sua personalidade de dev — tudo num Wrapped que você pode compartilhar.

**[→ Demo ao vivo](https://github-wrapped.vercel.app)**

---

## ✨ Funcionalidades

- **Login com GitHub OAuth** via NextAuth v5
- **Análise completa**: commits, linguagens, horários, dias da semana, streak, estrelas
- **Slides animados** estilo Spotify Wrapped
- **Link público compartilhável** com contador de visualizações
- **Imagem OG dinâmica** gerada no edge para preview no Twitter/WhatsApp
- **Cache inteligente** no PostgreSQL — não bate na API do GitHub toda vez
- **API documentada** com Swagger UI em `/api/docs`
- **Testes unitários** cobrindo toda a lógica de cálculo de métricas

---

## 🛠️ Stack

| Camada | Tecnologia | Por quê |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR, API Routes e Edge Functions num só lugar |
| Linguagem | TypeScript | Tipagem garante consistência nos dados da GitHub API |
| Banco | PostgreSQL + Prisma ORM | Queries de agregação relacionais; schema versionado com migrations |
| Auth | NextAuth v5 + GitHub OAuth | Sem senhas — só o token do GitHub que já precisamos |
| Charts | Recharts | Leve e compatível com SSR |
| OG Image | @vercel/og (Edge Runtime) | Geração de imagem sem servidor, zero cold start |
| Deploy | Vercel + Railway | Vercel para o Next.js, Railway para o Postgres |

---

## 🗄️ Decisões técnicas

**Por que PostgreSQL e não um banco NoSQL?**
Os dados do Wrapped são relacionais por natureza: um `User` tem vários `WrappedReport`, cada um pode ter vários `Share`. Além disso, precisamos de queries com `GROUP BY` e `COUNT` para agregar métricas. PostgreSQL é a escolha certa aqui.

**Por que cachear no banco?**
A GitHub API tem rate limit de 5.000 requests/hora por token. Salvar o relatório gerado evita recalcular tudo a cada visita, tornando a experiência instantânea para quem acessa um link compartilhado.

**Por que NextAuth v5 com Prisma Adapter?**
Sessões e tokens ficam no mesmo banco que os dados da aplicação, simplificando o deploy e eliminando dependências externas. O `access_token` do GitHub fica salvo na tabela `Account` e é recuperado a cada geração de Wrapped.

---

## 🚀 Rodando localmente

### Pré-requisitos
- Node.js 18+
- Docker (para o PostgreSQL)

### Passo a passo

```bash
# 1. Clone o repo
git clone https://github.com/seu-usuario/github-wrapped
cd github-wrapped

# 2. Instale as dependências
npm install

# 3. Suba o banco com Docker
docker-compose up -d

# 4. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# 5. Rode as migrations e gere o Prisma Client
npm run db:migrate
npm run db:generate

# 6. Inicie o servidor
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### Criando o GitHub OAuth App

1. Acesse [github.com/settings/developers](https://github.com/settings/developers)
2. Clique em **New OAuth App**
3. Homepage URL: `http://localhost:3000`
4. Callback URL: `http://localhost:3000/api/auth/callback/github`
5. Copie o **Client ID** e gere um **Client Secret**
6. Cole em `.env.local`

---

## 🧪 Testes

```bash
npm test
```

Os testes unitários cobrem toda a engine de cálculo de métricas (`src/lib/metrics.test.ts`), incluindo:
- Contagem de commits por ano
- Identificação do horário de pico
- Cálculo de linguagens mais usadas
- Streak mais longo
- Atribuição de personalidade
- Filtragem de eventos de outros anos
- Comportamento com dados vazios

---

## 📡 API

Documentação interativa disponível em `/api/docs` (Swagger UI).

| Endpoint | Método | Descrição |
|---|---|---|
| `/api/wrapped` | GET | Gera ou retorna o relatório cacheado |
| `/api/share` | POST | Cria link compartilhável |
| `/api/share?slug=` | GET | Retorna relatório público por slug |
| `/api/og` | GET | Gera imagem OG dinâmica |

---

## 📁 Estrutura do projeto

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # Handler NextAuth
│   │   ├── wrapped/              # Geração do relatório
│   │   ├── share/                # Links compartilháveis
│   │   ├── og/                   # Imagem OG (Edge)
│   │   └── docs/                 # Swagger UI
│   ├── dashboard/                # Página autenticada
│   ├── share/[slug]/             # Página pública
│   └── page.tsx                  # Landing page
├── components/
│   └── wrapped/
│       ├── WrappedSlides.tsx     # Experiência principal
│       └── LoadingScreen.tsx
├── lib/
│   ├── auth.ts                   # Configuração NextAuth
│   ├── prisma.ts                 # Singleton Prisma
│   ├── github.ts                 # GitHub API service
│   ├── metrics.ts                # Engine de cálculo
│   └── metrics.test.ts           # Testes unitários
prisma/
└── schema.prisma                 # Schema do banco
```

---

## 🚢 Deploy

### Vercel + Railway

```bash
# Instale a CLI da Vercel
npm i -g vercel

# Deploy
vercel --prod
```

Configure as variáveis de ambiente no painel da Vercel:
- `DATABASE_URL` (Railway → Connect → PostgreSQL)
- `AUTH_SECRET` (`openssl rand -base64 32`)
- `AUTH_GITHUB_ID` e `AUTH_GITHUB_SECRET`
- `AUTH_URL` (sua URL de produção)

---

Feito com 💜 por [Ana Julia Dias](https://najudias.dev)
