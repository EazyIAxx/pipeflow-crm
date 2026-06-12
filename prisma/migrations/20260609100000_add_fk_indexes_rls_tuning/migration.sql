-- =============================================================================
-- FK Indexes + RLS auth.uid() optimization
--
-- Postgres does NOT create indexes on foreign key columns automatically.
-- Missing FK indexes cause:
--   - Seq scans on workspace_members WHERE "userId" = $1 (workspace.list)
--   - Seq scans on leads/deals/activities WHERE "workspaceId" = $1
--   - Slow CASCADE deletes (full table scan to find referencing rows)
--
-- RLS optimization: auth.uid() called as a subquery is evaluated once per
-- statement (cached), vs. once per row when called as a bare function.
-- Ref: https://supabase.com/docs/guides/database/postgres/row-level-security
-- =============================================================================

-- ---------------------------------------------------------------------------
-- workspace_members
-- The composite PK ("workspaceId","userId") covers lookups by workspaceId
-- but NOT by userId alone — workspace.list filters by userId.
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "workspace_members_userId_idx"
  ON public.workspace_members ("userId");

-- ---------------------------------------------------------------------------
-- invites — FK workspaceId
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "invites_workspaceId_idx"
  ON public.invites ("workspaceId");

-- ---------------------------------------------------------------------------
-- leads — composite (workspaceId, status) covers both workspace scans and
-- status-filtered list views in one index.
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "leads_workspaceId_status_idx"
  ON public.leads ("workspaceId", "status");

-- ---------------------------------------------------------------------------
-- deals — workspaceId + stage composite (pipeline board query pattern),
-- plus individual indexes for leadId (JOIN) and ownerId (filter/assign).
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "deals_workspaceId_stage_idx"
  ON public.deals ("workspaceId", "stage");

CREATE INDEX IF NOT EXISTS "deals_leadId_idx"
  ON public.deals ("leadId");

CREATE INDEX IF NOT EXISTS "deals_ownerId_idx"
  ON public.deals ("ownerId");

-- ---------------------------------------------------------------------------
-- activities — (leadId, date DESC) for timeline queries; authorId for
-- filtering by author.
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "activities_leadId_date_idx"
  ON public.activities ("leadId", "date" DESC);

CREATE INDEX IF NOT EXISTS "activities_authorId_idx"
  ON public.activities ("authorId");

-- =============================================================================
-- RLS: optimize auth.uid() calls to (select auth.uid()) pattern.
--
-- Only the users_select_self_or_workspace_peers policy uses auth.uid()
-- inline — the helper functions (is_workspace_member / is_workspace_admin)
-- are STABLE SECURITY DEFINER, so Postgres already caches them per query.
-- =============================================================================

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
