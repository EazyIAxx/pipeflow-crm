# PipeFlow CRM — Project Briefing

SaaS multi-empresa de gestão de leads, pipeline Kanban e vendas. Alternativa acessível ao HubSpot/Pipedrive para PMEs, freelancers e times de vendas.

Full PRD: [docs/PRD.md](docs/PRD.md)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + React 18 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS + shadcn/ui |
| Database + Auth | Supabase (PostgreSQL + RLS + Auth) |
| ORM | Prisma |
| API | tRPC |
| Payments | Stripe (Checkout + Webhooks + Customer Portal) |
| Email | Resend |
| Drag-and-drop | @dnd-kit |
| Charts | Recharts |
| Deploy | Vercel + Supabase |

---

## Project Structure

```
src/
  app/                        # Next.js App Router
    (auth)/                   # Login, signup, onboarding
    (app)/                    # Authenticated app shell
      [workspaceSlug]/
        dashboard/
        leads/
        pipeline/
        settings/
    api/
      trpc/[trpc]/route.ts
      webhooks/stripe/route.ts
  server/
    routers/                  # tRPC routers (leads, deals, workspaces, activities)
    trpc.ts                   # tRPC init + context
    db.ts                     # Prisma client
  lib/
    supabase/
      client.ts               # Browser client
      server.ts               # Server client (cookies)
    email.ts                  # Resend wrapper
    stripe.ts                 # Stripe client + helpers
  components/
    ui/                       # shadcn/ui components
    kanban/                   # Pipeline board + cards
    leads/
    dashboard/
prisma/
  schema.prisma
```

---

## Data Model

```prisma
model User {
  id        String   @id  // Supabase Auth UUID
  email     String   @unique
  name      String?
  members   WorkspaceMember[]
  deals     Deal[]
  activities Activity[]
}

model Workspace {
  id               String  @id @default(cuid())
  name             String
  slug             String  @unique
  plan             Plan    @default(FREE)
  stripeCustomerId String?
  members          WorkspaceMember[]
  leads            Lead[]
  deals            Deal[]
}

model WorkspaceMember {
  workspaceId String
  userId      String
  role        Role    @default(MEMBER)
  workspace   Workspace @relation(...)
  user        User      @relation(...)
  @@id([workspaceId, userId])
}

model Lead {
  id          String  @id @default(cuid())
  workspaceId String
  name        String
  email       String?
  phone       String?
  company     String?
  jobTitle    String?
  status      String  @default("active")
  deals       Deal[]
  activities  Activity[]
}

model Deal {
  id          String    @id @default(cuid())
  workspaceId String
  leadId      String
  title       String
  value       Decimal?
  stage       Stage     @default(NEW_LEAD)
  ownerId     String
  dueDate     DateTime?
}

model Activity {
  id          String        @id @default(cuid())
  leadId      String
  authorId    String
  type        ActivityType
  description String
  date        DateTime      @default(now())
}

enum Plan          { FREE PRO }
enum Role          { ADMIN MEMBER }
enum Stage         { NEW_LEAD CONTACTED PROPOSAL_SENT NEGOTIATION WON LOST }
enum ActivityType  { CALL EMAIL MEETING NOTE }
```

---

## Conventions

### Next.js
- App Router only — never Pages Router
- Server Components by default; add `"use client"` only when the component needs interactivity or browser APIs
- Use `server actions` or `tRPC` for mutations — no raw fetch to `/api` from client components

### tRPC
- All routers in `src/server/routers/`
- Protected procedures must verify workspace membership before any query/mutation
- Never trust `workspaceId` from the client — always resolve it from the session

### Supabase / Database
- RLS enabled on **every** table — never use the service-role key in frontend code
- All queries scoped to `workspaceId` via Prisma + RLS double-guard
- Supabase Auth is the identity provider; `User` table syncs from auth via trigger or upsert on login

### Stripe
- Webhook handler: `src/app/api/webhooks/stripe/route.ts`
- Always verify `stripe.webhooks.constructEvent` before processing
- Plan enforcement is **server-side** — never rely solely on UI flags
- Events to handle: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

### Email (Resend)
- All email sends go through `src/lib/email.ts`
- Transactional only: workspace invites, password reset fallback

### shadcn/ui
- Install components individually as needed: `npx shadcn@latest add <component>`
- Do not bulk-install; keep the bundle lean

---

## Monetization

| Plan | Price | Limits |
|---|---|---|
| Free | R$0 | 2 colaboradores, 50 leads |
| Pro | R$49/mês | Ilimitado |

Upgrade flow: Stripe Checkout → webhook activates Pro → UI unlocks.

---

## Visual Identity

- **References:** HubSpot CRM, Pipedrive, DataCrazy
- **Tone:** clean, professional, sales-focused — no clutter
- **Component base:** shadcn/ui (neutral slate palette as starting point)
- **Palette:** to be defined in `tailwind.config.ts` CSS variables
- **Typography:** Inter (system fallback acceptable in early milestones)
- **Icons:** lucide-react (bundled with shadcn/ui)

---

## Key Constraints

1. Supabase RLS on all tables — never expose service-role key to browser
2. Stripe webhook signature validated on every request
3. Free plan limits enforced server-side on every mutation
4. All workspace data queries must be scoped by authenticated user's `WorkspaceMember` rows
5. No Pages Router, no class components, no barrel re-exports from `src/index.ts`
