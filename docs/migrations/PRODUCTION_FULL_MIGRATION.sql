-- =============================================================================
-- PipeFlow CRM — Script Consolidado de Produção (Supabase)
--
-- INSTRUÇÕES:
-- 1. Abra o SQL Editor no Supabase Dashboard (projeto de PRODUÇÃO)
-- 2. Cole este arquivo inteiro e execute
-- 3. Verifique que RLS está habilitado (FORCE ROW LEVEL SECURITY) em todas
--    as 7 tabelas de domínio
--
-- Ordem: 001_init -> 002_auth_user_sync -> 003_enable_rls ->
--        004_fk_indexes_rls_tuning -> 005_add_payment_failed_plan
--
-- Gerado a partir do histórico real do Prisma em prisma/migrations/ — é uma
-- concatenação fiel das 5 migrations já aplicadas em produção via
-- `prisma migrate deploy`. Serve como documentação e como script de
-- recuperação/disaster-recovery para recriar o banco do zero (ex.: um novo
-- projeto Supabase de staging) sem precisar do Prisma CLI.
--
-- NÃO é o mecanismo usado para aplicar mudanças no dia a dia — isso continua
-- sendo `prisma migrate dev` (local) e `prisma migrate deploy` (produção).
-- Se este arquivo divergir do conteúdo de prisma/migrations/, o Prisma é a
-- fonte da verdade.
-- =============================================================================


-- =============================================================================
-- 001 — INIT (schema, enums, tabelas, foreign keys)
-- Fonte: prisma/migrations/20260608120000_init/migration.sql
-- =============================================================================

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "Stage" AS ENUM ('NEW_LEAD', 'CONTACTED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CALL', 'EMAIL', 'MEETING', 'NOTE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "stripeCustomerId" TEXT,
    "stripePriceId" TEXT,
    "stripeSubId" TEXT,
    "planExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_members" (
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("workspaceId","userId")
);

-- CreateTable
CREATE TABLE "invites" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "jobTitle" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deals" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "value" DECIMAL(12,2),
    "stage" "Stage" NOT NULL DEFAULT 'NEW_LEAD',
    "ownerId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_slug_key" ON "workspaces"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "invites_token_key" ON "invites"("token");

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- =============================================================================
-- 002 — AUTH USER SYNC (trigger auth.users -> public.users)
-- Fonte: prisma/migrations/20260608120100_auth_user_sync/migration.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, "avatarUrl", "createdAt", "updatedAt")
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'full_name'),
    NEW.raw_user_meta_data ->> 'avatar_url',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
    SET email      = EXCLUDED.email,
        "updatedAt" = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

CREATE OR REPLACE FUNCTION public.handle_auth_user_email_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users
     SET email      = NEW.email,
         "updatedAt" = now()
   WHERE id = NEW.id::text
     AND email IS DISTINCT FROM NEW.email;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;

CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_email_change();


-- =============================================================================
-- 003 — ENABLE RLS (helper functions + policies em todas as 7 tabelas)
-- Fonte: prisma/migrations/20260608120200_enable_rls/migration.sql
--
-- Helper functions SECURITY DEFINER evitam o problema de policy recursiva
-- (ex.: workspace_members consultando workspace_members pra se avaliar).
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_workspace_member(p_workspace_id text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    WHERE wm."workspaceId" = p_workspace_id
      AND wm."userId" = auth.uid()::text
  );
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_admin(p_workspace_id text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    WHERE wm."workspaceId" = p_workspace_id
      AND wm."userId" = auth.uid()::text
      AND wm.role = 'ADMIN'
  );
$$;

-- activities não tem workspaceId direto — o escopo vem do lead pai.
CREATE OR REPLACE FUNCTION public.lead_workspace_id(p_lead_id text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT l."workspaceId" FROM public.leads l WHERE l.id = p_lead_id;
$$;

GRANT EXECUTE ON FUNCTION public.is_workspace_member(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_workspace_admin(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.lead_workspace_id(text) TO authenticated;

GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.users,
  public.workspaces,
  public.workspace_members,
  public.invites,
  public.leads,
  public.deals,
  public.activities
TO authenticated;

ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities        ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.users             FORCE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces        FORCE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members FORCE ROW LEVEL SECURITY;
ALTER TABLE public.invites           FORCE ROW LEVEL SECURITY;
ALTER TABLE public.leads             FORCE ROW LEVEL SECURITY;
ALTER TABLE public.deals             FORCE ROW LEVEL SECURITY;
ALTER TABLE public.activities        FORCE ROW LEVEL SECURITY;

-- users: cada um lê/edita o próprio perfil + vê colegas de workspace.
-- INSERT/DELETE ficam só com o trigger handle_new_auth_user (SECURITY DEFINER).
CREATE POLICY "users_select_self_or_workspace_peers"
  ON public.users FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()::text
    OR EXISTS (
      SELECT 1
      FROM public.workspace_members me
      JOIN public.workspace_members peer ON peer."workspaceId" = me."workspaceId"
      WHERE me."userId" = auth.uid()::text
        AND peer."userId" = users.id
    )
  );

CREATE POLICY "users_update_self"
  ON public.users FOR UPDATE
  TO authenticated
  USING (id = auth.uid()::text)
  WITH CHECK (id = auth.uid()::text);

-- workspaces: membros leem; só admins atualizam/excluem; qualquer
-- autenticado pode criar (onboarding insere o criador como ADMIN depois).
CREATE POLICY "workspaces_select_member"
  ON public.workspaces FOR SELECT
  TO authenticated
  USING (public.is_workspace_member(id));

CREATE POLICY "workspaces_insert_authenticated"
  ON public.workspaces FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "workspaces_update_admin"
  ON public.workspaces FOR UPDATE
  TO authenticated
  USING (public.is_workspace_admin(id))
  WITH CHECK (public.is_workspace_admin(id));

CREATE POLICY "workspaces_delete_admin"
  ON public.workspaces FOR DELETE
  TO authenticated
  USING (public.is_workspace_admin(id));

-- workspace_members: membros leem a lista; um usuário insere a própria
-- membership; só admins alteram papéis/removem — nunca a si mesmos.
CREATE POLICY "workspace_members_select_member"
  ON public.workspace_members FOR SELECT
  TO authenticated
  USING (public.is_workspace_member("workspaceId"));

CREATE POLICY "workspace_members_insert_self_or_admin"
  ON public.workspace_members FOR INSERT
  TO authenticated
  WITH CHECK (
    "userId" = auth.uid()::text
    OR public.is_workspace_admin("workspaceId")
  );

CREATE POLICY "workspace_members_update_admin"
  ON public.workspace_members FOR UPDATE
  TO authenticated
  USING (public.is_workspace_admin("workspaceId"))
  WITH CHECK (public.is_workspace_admin("workspaceId"));

CREATE POLICY "workspace_members_delete_admin_not_self"
  ON public.workspace_members FOR DELETE
  TO authenticated
  USING (
    public.is_workspace_admin("workspaceId")
    AND "userId" <> auth.uid()::text
  );

-- invites: gestão exclusiva de admins. O aceite roda server-side.
CREATE POLICY "invites_select_admin"
  ON public.invites FOR SELECT
  TO authenticated
  USING (public.is_workspace_admin("workspaceId"));

CREATE POLICY "invites_insert_admin"
  ON public.invites FOR INSERT
  TO authenticated
  WITH CHECK (public.is_workspace_admin("workspaceId"));

CREATE POLICY "invites_update_admin"
  ON public.invites FOR UPDATE
  TO authenticated
  USING (public.is_workspace_admin("workspaceId"))
  WITH CHECK (public.is_workspace_admin("workspaceId"));

CREATE POLICY "invites_delete_admin"
  ON public.invites FOR DELETE
  TO authenticated
  USING (public.is_workspace_admin("workspaceId"));

-- leads — escopo direto por workspaceId
CREATE POLICY "leads_select_member"
  ON public.leads FOR SELECT
  TO authenticated
  USING (public.is_workspace_member("workspaceId"));

CREATE POLICY "leads_insert_member"
  ON public.leads FOR INSERT
  TO authenticated
  WITH CHECK (public.is_workspace_member("workspaceId"));

CREATE POLICY "leads_update_member"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (public.is_workspace_member("workspaceId"))
  WITH CHECK (public.is_workspace_member("workspaceId"));

CREATE POLICY "leads_delete_member"
  ON public.leads FOR DELETE
  TO authenticated
  USING (public.is_workspace_member("workspaceId"));

-- deals — escopo direto por workspaceId
CREATE POLICY "deals_select_member"
  ON public.deals FOR SELECT
  TO authenticated
  USING (public.is_workspace_member("workspaceId"));

CREATE POLICY "deals_insert_member"
  ON public.deals FOR INSERT
  TO authenticated
  WITH CHECK (public.is_workspace_member("workspaceId"));

CREATE POLICY "deals_update_member"
  ON public.deals FOR UPDATE
  TO authenticated
  USING (public.is_workspace_member("workspaceId"))
  WITH CHECK (public.is_workspace_member("workspaceId"));

CREATE POLICY "deals_delete_member"
  ON public.deals FOR DELETE
  TO authenticated
  USING (public.is_workspace_member("workspaceId"));

-- activities — sem workspaceId direto; escopo via lead_workspace_id(leadId)
CREATE POLICY "activities_select_member"
  ON public.activities FOR SELECT
  TO authenticated
  USING (public.is_workspace_member(public.lead_workspace_id("leadId")));

CREATE POLICY "activities_insert_member"
  ON public.activities FOR INSERT
  TO authenticated
  WITH CHECK (public.is_workspace_member(public.lead_workspace_id("leadId")));

CREATE POLICY "activities_update_member"
  ON public.activities FOR UPDATE
  TO authenticated
  USING (public.is_workspace_member(public.lead_workspace_id("leadId")))
  WITH CHECK (public.is_workspace_member(public.lead_workspace_id("leadId")));

CREATE POLICY "activities_delete_member"
  ON public.activities FOR DELETE
  TO authenticated
  USING (public.is_workspace_member(public.lead_workspace_id("leadId")));


-- =============================================================================
-- 004 — FK INDEXES + RLS auth.uid() OPTIMIZATION
-- Fonte: prisma/migrations/20260609100000_add_fk_indexes_rls_tuning/migration.sql
--
-- Postgres não cria índices em colunas de FK automaticamente. Sem eles:
-- seq scans em workspace_members/leads/deals/activities e CASCADE deletes lentos.
-- =============================================================================

CREATE INDEX IF NOT EXISTS "workspace_members_userId_idx"
  ON public.workspace_members ("userId");

CREATE INDEX IF NOT EXISTS "invites_workspaceId_idx"
  ON public.invites ("workspaceId");

CREATE INDEX IF NOT EXISTS "leads_workspaceId_status_idx"
  ON public.leads ("workspaceId", "status");

CREATE INDEX IF NOT EXISTS "deals_workspaceId_stage_idx"
  ON public.deals ("workspaceId", "stage");

CREATE INDEX IF NOT EXISTS "deals_leadId_idx"
  ON public.deals ("leadId");

CREATE INDEX IF NOT EXISTS "deals_ownerId_idx"
  ON public.deals ("ownerId");

CREATE INDEX IF NOT EXISTS "activities_leadId_date_idx"
  ON public.activities ("leadId", "date" DESC);

CREATE INDEX IF NOT EXISTS "activities_authorId_idx"
  ON public.activities ("authorId");

-- auth.uid() como subquery é avaliado uma vez por statement (cacheado),
-- em vez de uma vez por linha quando chamado direto.
DROP POLICY IF EXISTS "users_select_self_or_workspace_peers" ON public.users;

CREATE POLICY "users_select_self_or_workspace_peers"
  ON public.users FOR SELECT
  TO authenticated
  USING (
    id = (SELECT auth.uid()::text)
    OR EXISTS (
      SELECT 1
      FROM public.workspace_members me
      JOIN public.workspace_members peer ON peer."workspaceId" = me."workspaceId"
      WHERE me."userId" = (SELECT auth.uid()::text)
        AND peer."userId" = users.id
    )
  );


-- =============================================================================
-- 005 — ADD PAYMENT_FAILED PLAN
-- Fonte: prisma/migrations/20260615000000_add_payment_failed_plan/migration.sql
--
-- Usado quando invoice.payment_failed dispara: workspace continua inscrito
-- mas perde os recursos Pro até o pagamento ser recuperado ou a assinatura
-- ser deletada.
-- =============================================================================

ALTER TYPE "Plan" ADD VALUE IF NOT EXISTS 'PAYMENT_FAILED';
