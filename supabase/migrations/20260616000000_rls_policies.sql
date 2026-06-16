-- RLS policies for PipeFlow CRM
-- All data access is scoped to workspace membership, verified server-side via Prisma+tRPC.
-- RLS here is a defense-in-depth layer — prevents direct DB queries from bypassing app logic.

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces         ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites            ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads              ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals              ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities         ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- users
-- ============================================================
CREATE POLICY "users: own row only"
  ON users FOR ALL
  USING (auth.uid()::text = id);

-- ============================================================
-- workspace_members  (pivot — needed first, other policies depend on it)
-- ============================================================
CREATE POLICY "workspace_members: members of same workspace"
  ON workspace_members FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()::text
    )
  );

-- ============================================================
-- workspaces
-- ============================================================
CREATE POLICY "workspaces: members only"
  ON workspaces FOR ALL
  USING (
    id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()::text
    )
  );

-- ============================================================
-- invites
-- ============================================================
CREATE POLICY "invites: workspace members only"
  ON invites FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()::text
    )
  );

-- ============================================================
-- leads
-- ============================================================
CREATE POLICY "leads: workspace members only"
  ON leads FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()::text
    )
  );

-- ============================================================
-- deals
-- ============================================================
CREATE POLICY "deals: workspace members only"
  ON deals FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()::text
    )
  );

-- ============================================================
-- activities
-- ============================================================
CREATE POLICY "activities: lead workspace members only"
  ON activities FOR ALL
  USING (
    lead_id IN (
      SELECT id FROM leads
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()::text
      )
    )
  );
