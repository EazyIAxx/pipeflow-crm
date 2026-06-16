-- RLS policies for PipeFlow CRM
-- Columns use camelCase (Prisma default — no @map on fields)

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
-- workspace_members
-- ============================================================
CREATE POLICY "workspace_members: members of same workspace"
  ON workspace_members FOR ALL
  USING (
    "workspaceId" IN (
      SELECT "workspaceId" FROM workspace_members
      WHERE "userId" = auth.uid()::text
    )
  );

-- ============================================================
-- workspaces
-- ============================================================
CREATE POLICY "workspaces: members only"
  ON workspaces FOR ALL
  USING (
    id IN (
      SELECT "workspaceId" FROM workspace_members
      WHERE "userId" = auth.uid()::text
    )
  );

-- ============================================================
-- invites
-- ============================================================
CREATE POLICY "invites: workspace members only"
  ON invites FOR ALL
  USING (
    "workspaceId" IN (
      SELECT "workspaceId" FROM workspace_members
      WHERE "userId" = auth.uid()::text
    )
  );

-- ============================================================
-- leads
-- ============================================================
CREATE POLICY "leads: workspace members only"
  ON leads FOR ALL
  USING (
    "workspaceId" IN (
      SELECT "workspaceId" FROM workspace_members
      WHERE "userId" = auth.uid()::text
    )
  );

-- ============================================================
-- deals
-- ============================================================
CREATE POLICY "deals: workspace members only"
  ON deals FOR ALL
  USING (
    "workspaceId" IN (
      SELECT "workspaceId" FROM workspace_members
      WHERE "userId" = auth.uid()::text
    )
  );

-- ============================================================
-- activities
-- ============================================================
CREATE POLICY "activities: lead workspace members only"
  ON activities FOR ALL
  USING (
    "leadId" IN (
      SELECT id FROM leads
      WHERE "workspaceId" IN (
        SELECT "workspaceId" FROM workspace_members
        WHERE "userId" = auth.uid()::text
      )
    )
  );
