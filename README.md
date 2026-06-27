# 👾 GitHub Wrapped

Descubra seu ano em código. Commits, linguagens, horários e sua personalidade de dev — tudo num Wrapped que você pode compartilhar.

💻 **Acesse o projeto vivo:** [git-wrap-huzi.vercel.app](https://git-wrap-huzi.vercel.app)

---

## ✨ Funcionalidades

* **Engine de Métricas Testada:** Toda a lógica que calcula commits, horários de pico, streaks, estrelas e personalidade de dev foi isolada e coberta por testes unitários com **Jest**.
* **Estratégia de Cache Inteligente:** Para contornar o limite de requisições da GitHub API (rate limit), os relatórios gerados são cacheados em um banco **PostgreSQL (Prisma ORM)**, tornando o carregamento instantâneo para acessos via links públicos.
* **Social Preview Dinâmico:** Desenvolvi uma rota no Edge Runtime (`@vercel/og`) que gera imagens de preview customizadas em tempo real com os dados do usuário para compartilhamento no WhatsApp/Twitter.
* **UX Fluida:** Interface construída com **Next.js 15 (App Router)**, animações baseadas em arcade utilizando **Framer Motion** e suporte a compartilhamento nativo via Web Share API.

---

## 🛠️ Tecnologias Principais
`Next.js 15` • `TypeScript` • `PostgreSQL` • `Prisma ORM` • `NextAuth v5` • `Framer Motion` • `Jest` • `Tailwind CSS`

---

## 🚀 Como Executar Localmente

### Pré-requisitos
* Node.js 18+ e Docker

```bash
# 1. Clone e instale as dependências
git clone https://github.com/naju-dias/github-wrapped
cd git-wrapp
npm install

# 2. Suba o banco de dados e rode as migrations
docker-compose up -d
npm run db:migrate
npm run db:generate

# 3. Inicie o ambiente de desenvolvimento
npm run dev
```

---

## 🧪 Testes

Os testes unitários cobrem toda a engine de cálculo de métricas (src/lib/metrics.test.ts). Para rodá-los localmente:

```bash
npm test
```

---

## 📡 API do Projeto
A aplicação conta com uma API RESTful totalmente documentada utilizando **Swagger UI**. Você pode explorar e testar os endpoints interativamente acessando [/api/docs](https://git-wrap-huzi.vercel.app/api/docs) em produção.

---

## 📁 Estrutura do projeto

```
src/
├── app/
│   ├── api/
│   │   ├── auth/                 # Handler NextAuth v5
│   │   ├── docs/                 # Swagger UI
│   │   ├── og/                   # OG Image no Edge Runtime
│   │   ├── share/                # Links públicos compartilháveis
│   │   └── wrapped/              # Geração e cache do relatório
│   ├── dashboard/
│   │   └── page.tsx              # Página autenticada com slides
│   ├── share/[slug]/
│   │   └── page.tsx              # Página pública do wrapped
│   ├── global.css
│   ├── layout.tsx
│   └── page.tsx                  # Landing page
├── components/
│   ├── ui/                       # Componentes base (shadcn)
│   └── wrapped/
│       ├── LoadingScreen.tsx     # Terminal animado de carregamento
│       └── WrappedSlides.tsx     # Experiência principal (7 slides)
├── Fonts/
│   └── ka1.ttf                   # Fonte Karmatic Arcade (pixel art)
├── lib/
│   ├── auth.ts                   # Configuração NextAuth + callbacks
│   ├── github.ts                 # GitHub API service com paginação
│   ├── metrics.test.ts           # Testes unitários
│   ├── metrics.ts                # Engine de cálculo de métricas
│   ├── prisma.ts                 # Singleton Prisma Client
│   └── utils.ts
├── types/
│   └── canvas-confetti.d.ts      # Tipagem do confetti
│   Noise.css
│   Noise.tsx                     # Componente de ruído visual
prisma/
└── schema.prisma                 # Schema relacional com migrations
```

---

Feito com 💙 por [Ana Julia Dias](https://www.linkedin.com/in/najudias/)
