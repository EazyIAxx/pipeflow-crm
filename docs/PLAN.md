# PipeFlow CRM — Plano de Execução

> **Filosofia:** Interface primeiro, backend depois. Cada milestone entrega algo visível e testável antes de conectar dados reais. Backend só entra quando a tela está aprovada.

---

## Arquitetura de Arquivos

### Camada de Interface

```
src/
  app/
    (auth)/                          # Rotas públicas de autenticação
      login/page.tsx                 # Formulário de login
      signup/page.tsx                # Formulário de cadastro
      forgot-password/page.tsx       # Recuperação de senha
      invite/[token]/page.tsx        # Aceite de convite de workspace
      layout.tsx                     # Layout centralizado (logo + card)
    (app)/
      onboarding/page.tsx            # Criação do primeiro workspace
      [workspaceSlug]/
        layout.tsx                   # App shell (sidebar + header)
        dashboard/page.tsx           # Métricas e funil
        leads/
          page.tsx                   # Listagem com busca e filtros
          [leadId]/page.tsx          # Perfil + timeline de atividades
        pipeline/page.tsx            # Board Kanban de negócios
        settings/
          page.tsx                   # Configurações gerais do workspace
          billing/page.tsx           # Plano e faturamento
    page.tsx                         # Landing page pública
    layout.tsx                       # Root layout (fonte + metadata)

  components/
    landing/
      Navbar.tsx                     # Navegação da landing
      HeroSection.tsx
      FeaturesSection.tsx
      PricingSection.tsx
      CtaSection.tsx
      Footer.tsx
    layout/
      Sidebar.tsx                    # Sidebar com navegação principal
      Header.tsx                     # Breadcrumb + ações + menu usuário
      WorkspaceSwitcher.tsx          # Dropdown para alternar workspaces
      UserMenu.tsx                   # Avatar + dropdown (perfil, sair)
    leads/
      LeadTable.tsx                  # Tabela paginada de leads
      LeadFilters.tsx                # Busca + filtros (status, responsável)
      LeadForm.tsx                   # Dialog/sheet criar e editar lead
      LeadProfile.tsx                # Dados do lead (avatar, badges)
      ActivityTimeline.tsx           # Timeline cronológica de atividades
      ActivityForm.tsx               # Formulário nova atividade
    kanban/
      KanbanBoard.tsx                # Board com todas as colunas
      KanbanColumn.tsx               # Coluna com header e lista de cards
      DealCard.tsx                   # Card arrastável (título, valor, prazo)
      DealForm.tsx                   # Dialog criar e editar negócio
    dashboard/
      MetricCard.tsx                 # Card de KPI reutilizável
      FunnelChart.tsx                # Gráfico de funil (Recharts)
      UpcomingDeals.tsx              # Lista de negócios com prazo próximo
    settings/
      WorkspaceSettings.tsx          # Editar nome do workspace
      MembersList.tsx                # Tabela de membros com ações
      InviteMemberDialog.tsx         # Dialog de convite por e-mail
      BillingCard.tsx                # Plano atual + botão de ação
    ui/                              # Componentes shadcn/ui instalados
```

### Camada de Backend

```
src/
  server/
    trpc.ts                          # Init tRPC, context (auth Supabase), middlewares
    db.ts                            # Prisma client singleton
    routers/
      _app.ts                        # Router raiz (merge de todos os routers)
      workspace.ts                   # create, list, getBySlug, update, invite,
                                     # removeMember, updateMemberRole
      leads.ts                       # list, getById, create, update, delete
      activities.ts                  # listByLead, create
      deals.ts                       # listByWorkspace, create, update,
                                     # updateStage, delete
      dashboard.ts                   # getMetrics (KPIs + funil + upcoming)
      billing.ts                     # createCheckout, createPortalSession,
                                     # getSubscription

  lib/
    supabase/
      client.ts                      # createBrowserClient (uso em Client Components)
      server.ts                      # createServerClient com cookies (Server Components)
    trpc/
      client.ts                      # tRPC client para Client Components
      server.ts                      # tRPC caller para Server Components
    stripe.ts                        # Stripe client + createCheckoutSession,
                                     # createPortalSession
    email.ts                         # Resend wrapper + templates de convite

  app/
    api/
      trpc/[trpc]/route.ts           # Handler HTTP do tRPC (GET + POST)
      webhooks/stripe/route.ts       # Webhook Stripe (validação + eventos)

  middleware.ts                      # Proteção de rotas /(app)/* com Supabase Auth

prisma/
  schema.prisma                      # Models: User, Workspace, WorkspaceMember,
                                     # Lead, Deal, Activity + enums
  migrations/                        # Geradas pelo Prisma Migrate
```

---

## Visão Geral das Milestones

| # | Milestone | Branch | Foco |
|---|-----------|--------|------|
| M0 | Foundation & Setup | `main` | Infraestrutura base |
| M1 | Landing Page | `feat/landing` | Marketing público |
| M2 | Auth & Onboarding | `feat/auth` | Login + criação de workspace |
| M3 | App Shell | `feat/app-shell` | Layout autenticado + navegação |
| M4 | Leads Module | `feat/leads` | Gestão de leads e contatos |
| M5 | Pipeline Kanban | `feat/pipeline` | Board Kanban de negócios |
| M6 | Dashboard | `feat/dashboard` | Métricas e gráfico de funil |
| M7 | Workspace & Invites | `feat/workspace` | Multi-empresa e colaboração |
| M8 | Monetização | `feat/billing` | Stripe + planos |
| M9 | Polish & Deploy | `feat/polish` | Ajustes finais + Vercel |

---

## M0 — Foundation & Setup

**Branch:** `main`
**Objetivo:** Projeto configurado, dependências instaladas, schema do banco definido, infraestrutura tRPC pronta. Nada visível ainda — só a base sólida.

### Entregas

- [x] Instalar dependências: `@trpc/server`, `@trpc/client`, `@trpc/react-query`, `@tanstack/react-query`, `zod`, `superjson`
- [x] Instalar Prisma + Supabase: `prisma`, `@prisma/client`, `@supabase/supabase-js`, `@supabase/ssr`
- [x] Instalar utilitários: `stripe`, `resend`, `@dnd-kit/core`, `@dnd-kit/sortable`, `recharts`, `lucide-react`
- [x] Inicializar shadcn/ui (`npx shadcn@latest init`) com tema slate
- [x] Instalar componentes shadcn base: `button`, `input`, `label`, `card`, `badge`, `avatar`, `dropdown-menu`, `dialog`, `form`, `sheet`, `separator`, `skeleton`, `toast`, `tooltip`
- [x] Escrever `prisma/schema.prisma` com todos os models: `User`, `Workspace`, `WorkspaceMember`, `Lead`, `Deal`, `Activity` + enums
- [x] Criar `src/lib/supabase/client.ts` (browser client)
- [x] Criar `src/lib/supabase/server.ts` (server client com cookies)
- [x] Criar `src/server/trpc.ts` (init tRPC + context com auth Supabase)
- [x] Criar `src/server/db.ts` (Prisma client singleton)
- [x] Criar `src/server/routers/_app.ts` (router raiz vazio)
- [x] Criar `src/app/api/trpc/[trpc]/route.ts` (handler HTTP do tRPC)
- [x] Criar `src/lib/trpc/client.ts` (tRPC client para Client Components)
- [x] Criar `src/lib/trpc/server.ts` (tRPC caller para Server Components)
- [x] Criar `src/app/providers.tsx` (QueryClientProvider + tRPC provider)
- [x] Criar `.env.example` com todas as variáveis necessárias
- [x] Criar `.env.local` vazio com as chaves a preencher
- [x] Inicializar git e fazer primeiro commit
- [x] Criar repositório no GitHub e fazer push (`main`)

**Commit final:** `feat: project foundation — Next.js 14 + tRPC + Prisma + Supabase + shadcn/ui`

---

## M1 — Landing Page

**Branch:** `feat/landing`
**Objetivo:** Página pública `/` de apresentação do PipeFlow CRM. Totalmente estática, sem autenticação. Referências visuais: HubSpot, Pipedrive.

### Entregas — Interface

- [ ] Componente `src/components/landing/Navbar.tsx` (logo + links + botão "Entrar")
- [ ] Seção Hero: headline, subtítulo, CTA primário "Começar grátis" + CTA secundário "Ver demo"
- [ ] Seção Features: 3–4 cards com ícones (Pipeline, Leads, Dashboard, Multi-empresa)
- [ ] Seção Pricing: cards Free e Pro com listas de features e botão de upgrade
- [ ] Seção CTA final: call-to-action com fundo colorido
- [ ] Componente Footer com links básicos
- [ ] Layout responsivo (mobile-first)
- [ ] `src/app/page.tsx` montando todas as seções
- [ ] `src/app/layout.tsx` com fonte Inter + metadata

### Entregas — Backend/Config

- [ ] Sem backend neste milestone — dados são estáticos

**Commit final:** `feat: landing page — hero, features, pricing, CTA`

---

## M2 — Auth & Onboarding

**Branch:** `feat/auth`
**Objetivo:** Fluxo completo de autenticação (login, signup, recuperação de senha) e onboarding para criação do primeiro workspace.

### Entregas — Interface (mocked primeiro)

- [ ] `src/app/(auth)/login/page.tsx` — formulário e-mail + senha + link "Criar conta"
- [ ] `src/app/(auth)/signup/page.tsx` — formulário nome + e-mail + senha
- [ ] `src/app/(auth)/forgot-password/page.tsx` — formulário de recuperação
- [ ] `src/app/(auth)/layout.tsx` — layout centralizado com logo
- [ ] `src/app/(app)/onboarding/page.tsx` — formulário "Criar seu workspace" (nome da empresa + slug)
- [ ] Validação de formulários com `react-hook-form` + `zod`
- [ ] Loading states nos botões de submit
- [ ] Tratamento de erros inline (campo inválido, e-mail já cadastrado)

### Entregas — Backend

- [ ] Integração Supabase Auth: `signInWithPassword`, `signUp`, `resetPasswordForEmail`
- [ ] Middleware `src/middleware.ts` protegendo rotas `/(app)/*`
- [ ] Server Action ou tRPC mutation `workspace.create` com slug único
- [ ] Upsert do `User` no banco após login (sync com Supabase Auth)
- [ ] Redirect pós-login: se tem workspace → `/:slug/dashboard`, senão → `/onboarding`
- [ ] Redirect pós-signup → `/onboarding`

**Commit final:** `feat: auth flow — login, signup, onboarding + workspace creation`

---

## M3 — App Shell

**Branch:** `feat/app-shell`
**Objetivo:** Layout base do app autenticado — sidebar, header, workspace switcher, navegação. Todas as páginas internas ficarão dentro deste shell.

### Entregas — Interface

- [x] `src/app/(app)/[workspaceSlug]/layout.tsx` — layout raiz do app
- [x] `src/components/layout/Sidebar.tsx` — sidebar com logo, links de navegação e avatar do usuário
- [x] Links da sidebar: Dashboard, Leads, Pipeline, Configurações
- [x] `src/components/layout/WorkspaceSwitcher.tsx` — dropdown para alternar entre workspaces
- [x] `src/components/layout/Header.tsx` — breadcrumb + botão de ações + menu do usuário
- [x] `src/components/layout/UserMenu.tsx` — dropdown com "Perfil" e "Sair"
- [x] Página placeholder para cada rota: dashboard, leads, pipeline, settings
- [x] Estado ativo no link da sidebar baseado na rota atual
- [x] Layout responsivo: sidebar colapsável em mobile (Sheet do shadcn)

### Entregas — Backend

- [ ] tRPC query `workspace.list` — lista workspaces do usuário autenticado
- [ ] tRPC query `workspace.getBySlug` — dados do workspace atual
- [ ] Server Component passando workspace para o layout via params
- [ ] Guard: se slug não existe ou usuário não é membro → 404

**Commit final:** `feat: app shell — sidebar, header, workspace switcher, navigation`

---

## M4 — Leads Module

**Branch:** `feat/leads`
**Objetivo:** Módulo completo de gestão de leads — listagem, detalhe, cadastro, edição, busca e filtros.

### Entregas — Interface (com dados mockados)

- [ ] `src/app/(app)/[workspaceSlug]/leads/page.tsx` — página de listagem
- [ ] `src/components/leads/LeadTable.tsx` — tabela com colunas: Nome, Empresa, E-mail, Status, Responsável, Data
- [ ] `src/components/leads/LeadFilters.tsx` — filtros por status, responsável e busca por texto
- [ ] `src/components/leads/LeadForm.tsx` — formulário de criação/edição (dialog ou sheet)
- [ ] `src/app/(app)/[workspaceSlug]/leads/[leadId]/page.tsx` — página de detalhe
- [ ] `src/components/leads/LeadProfile.tsx` — perfil completo do lead (avatar, dados, badge de status)
- [ ] `src/components/leads/ActivityTimeline.tsx` — timeline cronológica de atividades
- [ ] `src/components/leads/ActivityForm.tsx` — formulário de nova atividade (tipo, descrição, data)
- [ ] Badge de status com cores (ativo, inativo, convertido)
- [ ] Paginação na listagem

### Entregas — Backend

- [ ] `src/server/routers/leads.ts` com procedures: `list`, `getById`, `create`, `update`, `delete`
- [ ] `src/server/routers/activities.ts` com procedures: `listByLead`, `create`
- [ ] Filtros server-side (status, search) passados via input Zod
- [ ] Todas as queries filtradas por `workspaceId` da sessão
- [ ] Validação do limite do plano Free (50 leads) em `leads.create`
- [ ] Conectar tabela de leads e formulário ao tRPC (substituir mocks)

**Commit final:** `feat: leads module — list, detail, activities, create/edit`

---

## M5 — Pipeline Kanban

**Branch:** `feat/pipeline`
**Objetivo:** Board Kanban de negócios com drag-and-drop entre etapas e persistência no banco.

### Entregas — Interface (com dados mockados)

- [ ] `src/app/(app)/[workspaceSlug]/pipeline/page.tsx`
- [ ] `src/components/kanban/KanbanBoard.tsx` — board com 6 colunas (etapas do Stage enum)
- [ ] `src/components/kanban/KanbanColumn.tsx` — coluna com header (nome + contador + total R$)
- [ ] `src/components/kanban/DealCard.tsx` — card com título, valor, lead, responsável, prazo
- [ ] `src/components/kanban/DealForm.tsx` — dialog de criação/edição de negócio
- [ ] Drag-and-drop funcional entre colunas com `@dnd-kit/core` + `@dnd-kit/sortable`
- [ ] Indicador visual de "dropping" na coluna de destino
- [ ] Animação suave no card arrastado
- [ ] Botão "+ Negócio" por coluna
- [ ] Cor de prazo próximo (vermelho se < 3 dias)

### Entregas — Backend

- [ ] `src/server/routers/deals.ts` com procedures: `listByWorkspace`, `create`, `update`, `updateStage`, `delete`
- [ ] `updateStage` mutation com optimistic update no cliente
- [ ] Todas as queries filtradas por `workspaceId`
- [ ] Conectar board ao tRPC (substituir mocks)
- [ ] Optimistic UI: mover card visualmente antes da confirmação do servidor

**Commit final:** `feat: pipeline kanban — drag-and-drop board with deal management`

---

## M6 — Dashboard

**Branch:** `feat/dashboard`
**Objetivo:** Página de métricas com cards de KPIs e gráfico de funil de vendas.

### Entregas — Interface (com dados mockados)

- [ ] `src/app/(app)/[workspaceSlug]/dashboard/page.tsx`
- [ ] `src/components/dashboard/MetricCard.tsx` — card reutilizável (ícone, label, valor, variação %)
- [ ] Cards: Total de Leads, Negócios Abertos, Valor Total do Pipeline, Taxa de Conversão
- [ ] `src/components/dashboard/FunnelChart.tsx` — gráfico de funil com Recharts (BarChart horizontal por etapa)
- [ ] `src/components/dashboard/UpcomingDeals.tsx` — lista de negócios com prazo próximo (≤ 7 dias)
- [ ] Skeleton loading em todos os cards

### Entregas — Backend

- [ ] `src/server/routers/dashboard.ts` com procedure `getMetrics`:
  - count de leads ativos
  - count de deals abertos
  - soma do valor de deals abertos
  - taxa de conversão (WON / total)
  - contagem por stage para o funil
  - deals com dueDate nos próximos 7 dias
- [ ] Conectar dashboard ao tRPC (substituir mocks)

**Commit final:** `feat: dashboard — KPI cards, funnel chart, upcoming deals`

---

## M7 — Workspace & Invites

**Branch:** `feat/workspace`
**Objetivo:** Gestão de membros do workspace, convite por e-mail e troca de papéis.

### Entregas — Interface

- [ ] `src/app/(app)/[workspaceSlug]/settings/page.tsx` — página de configurações gerais
- [ ] `src/components/settings/WorkspaceSettings.tsx` — editar nome do workspace
- [ ] `src/components/settings/MembersList.tsx` — tabela de membros com papel e ações
- [ ] `src/components/settings/InviteMemberDialog.tsx` — dialog com campo de e-mail + seleção de papel
- [ ] Botão "Remover membro" (apenas Admin, não pode remover a si mesmo)
- [ ] Troca de papel (Admin ↔ Membro) via dropdown
- [ ] Badge visual por papel (Admin = azul, Membro = cinza)
- [ ] Guard de UI: ações de admin ocultas para membros

### Entregas — Backend

- [ ] `src/server/routers/workspace.ts`: `update`, `invite`, `removeMember`, `updateMemberRole`
- [ ] `invite` procedure: gera token, salva em tabela `Invite`, envia e-mail via Resend
- [ ] Template de e-mail de convite em `src/lib/email.ts`
- [ ] `src/app/(auth)/invite/[token]/page.tsx` — página de aceite de convite
- [ ] Validação do limite do plano Free (2 colaboradores) em `invite`
- [ ] Proteção de todas as mutations de settings para role ADMIN

**Commit final:** `feat: workspace settings — member management, email invites`

---

## M8 — Monetização

**Branch:** `feat/billing`
**Objetivo:** Integração completa com Stripe — checkout de assinatura, webhook e portal do cliente.

### Entregas — Interface

- [ ] `src/app/(app)/[workspaceSlug]/settings/billing/page.tsx` — página de billing
- [ ] `src/components/settings/BillingCard.tsx` — plano atual, data de renovação, botão de ação
- [ ] Card plano Free: lista de limites + botão "Fazer upgrade"
- [ ] Card plano Pro: status ativo + botão "Gerenciar assinatura" (Customer Portal)
- [ ] Banner de "limite atingido" no topo do app quando Free atingiu 50 leads ou 2 membros
- [ ] Modal de upgrade ao tentar ultrapassar limite

### Entregas — Backend

- [ ] `src/lib/stripe.ts` — cliente Stripe + helpers `createCheckoutSession`, `createPortalSession`
- [ ] `src/server/routers/billing.ts`: `createCheckout`, `createPortalSession`, `getSubscription`
- [ ] `src/app/api/webhooks/stripe/route.ts` — handler com validação de assinatura
- [ ] Eventos processados: `checkout.session.completed` → ativa PRO; `customer.subscription.updated` → sync; `customer.subscription.deleted` → downgrade para FREE
- [ ] Persistir `stripeCustomerId` e `plan` no `Workspace`
- [ ] Limites de Free checados server-side em `leads.create` e `workspace.invite`

**Commit final:** `feat: billing — Stripe checkout, webhooks, customer portal`

---

## M9 — Polish & Deploy

**Branch:** `feat/polish` → merge em `main`
**Objetivo:** Qualidade de produto: estados de loading/erro, responsividade, acessibilidade básica e deploy em produção.

### Entregas — UX

- [ ] Skeleton loading em todas as listas e cards
- [ ] Estados de erro com mensagem amigável e botão "Tentar novamente"
- [ ] Empty states (nenhum lead, nenhum negócio, pipeline vazio) com ícone e CTA
- [ ] Toast de feedback em todas as ações (criar, editar, deletar, convidar)
- [ ] Confirmação antes de deletar (Dialog de confirmação)
- [ ] Layout responsivo revisado em mobile (375px) e tablet (768px)
- [ ] `<title>` e `<meta description>` em todas as páginas

### Entregas — Deploy

- [ ] Subir projeto no GitHub
- [ ] Criar projeto no Vercel e conectar ao repositório
- [ ] Configurar variáveis de ambiente no Vercel (Supabase, Stripe, Resend)
- [ ] Configurar banco Supabase de produção e rodar migrations Prisma
- [ ] Configurar webhook do Stripe apontando para URL de produção
- [ ] Testar fluxo completo em produção: signup → workspace → lead → deal → upgrade
- [ ] Configurar domínio customizado (opcional)

**Commit final:** `feat: polish + production deploy — loading states, empty states, error handling`

---

## Ordem de Dependências

```
M0 (base)
 └── M1 (landing) — independente
 └── M2 (auth) → M3 (shell) → M4 (leads) → M5 (pipeline) → M6 (dashboard)
                             └── M7 (workspace) → M8 (billing)
                                                        └── M9 (deploy)
```

M1 pode ser desenvolvido em paralelo com qualquer outra milestone.
M4, M5, M6 e M7 podem ser feitos em sequência ou paralelo após M3.
M8 depende de M7 (workspace) estar estável.
M9 só começa quando todas as demais estão completas.

---

## Variáveis de Ambiente Necessárias

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # apenas server-side, nunca expor ao browser

# Prisma
DATABASE_URL=                    # connection string do Supabase (Transaction mode)
DIRECT_URL=                      # connection string direta (para migrations)

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRO_PRICE_ID=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# App
NEXT_PUBLIC_APP_URL=
```
