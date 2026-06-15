-- =============================================================================
-- 011_create_workspace_invites.sql
-- Tabela de convites para colaboração em workspaces (M7 — Workspace & Invites)
--
-- Como aplicar:
--   Supabase Dashboard → SQL Editor → cole este arquivo → Run
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Tabela invites
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invites (
  "id"          TEXT          NOT NULL,
  "workspaceId" TEXT          NOT NULL,
  "email"       TEXT          NOT NULL,
  "role"        "Role"        NOT NULL DEFAULT 'MEMBER',
  "token"       TEXT          NOT NULL,
  "expiresAt"   TIMESTAMPTZ   NOT NULL,
  "acceptedAt"  TIMESTAMPTZ,
  "createdAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- 2. Gera IDs únicos como cuid-like via gen_random_uuid() se o app não mandar
--    (o Prisma @default(cuid()) já envia o valor — esta coluna não precisa de
--     DEFAULT no DB, mas o UNIQUE no token é obrigatório)
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS "invites_token_key"
  ON public.invites ("token");

-- FK index (acelera CASCADE deletes e queries por workspace)
CREATE INDEX IF NOT EXISTS "invites_workspaceId_idx"
  ON public.invites ("workspaceId");

-- ---------------------------------------------------------------------------
-- 3. Foreign key para workspaces (CASCADE: apagar workspace apaga convites)
-- ---------------------------------------------------------------------------
ALTER TABLE public.invites
  DROP CONSTRAINT IF EXISTS "invites_workspaceId_fkey";

ALTER TABLE public.invites
  ADD CONSTRAINT "invites_workspaceId_fkey"
  FOREIGN KEY ("workspaceId")
  REFERENCES public.workspaces ("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- 4. Grant para a role authenticated (PostgREST / Supabase Auth)
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invites TO authenticated;

-- ---------------------------------------------------------------------------
-- 5. Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites FORCE ROW LEVEL SECURITY;

-- Apenas admins do workspace gerenciam convites
-- (o aceite roda server-side via Prisma com a connection string do pooler,
--  que ignora RLS — por isso não há policy de SELECT para o convidado)

DROP POLICY IF EXISTS "invites_select_admin" ON public.invites;
CREATE POLICY "invites_select_admin"
  ON public.invites FOR SELECT
  TO authenticated
  USING (public.is_workspace_admin("workspaceId"));

DROP POLICY IF EXISTS "invites_insert_admin" ON public.invites;
CREATE POLICY "invites_insert_admin"
  ON public.invites FOR INSERT
  TO authenticated
  WITH CHECK (public.is_workspace_admin("workspaceId"));

DROP POLICY IF EXISTS "invites_update_admin" ON public.invites;
CREATE POLICY "invites_update_admin"
  ON public.invites FOR UPDATE
  TO authenticated
  USING (public.is_workspace_admin("workspaceId"))
  WITH CHECK (public.is_workspace_admin("workspaceId"));

DROP POLICY IF EXISTS "invites_delete_admin" ON public.invites;
CREATE POLICY "invites_delete_admin"
  ON public.invites FOR DELETE
  TO authenticated
  USING (public.is_workspace_admin("workspaceId"));
