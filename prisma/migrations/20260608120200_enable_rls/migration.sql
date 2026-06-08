-- =============================================================================
-- Row Level Security — PipeFlow CRM
--
-- Regra geral: cada workspace só acessa seus próprios dados. Toda leitura e
-- escrita em tabelas de domínio é condicionada a "o usuário autenticado é
-- membro (ou admin) do workspace dono da linha".
--
-- Isto é uma camada de defesa adicional: a barreira primária continua sendo o
-- filtro por workspaceId resolvido da sessão no tRPC (nunca confiar no client).
-- A app conecta ao Postgres via Prisma com a connection string "postgres" do
-- pooler (dono das tabelas, ignora RLS); estas policies protegem qualquer
-- acesso que passe pelas roles do PostgREST/Supabase Auth (anon/authenticated),
-- hoje ou no futuro.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER)
--
-- Evitam o problema clássico de policy recursiva: uma policy em
-- workspace_members que precisasse consultar workspace_members para se avaliar.
-- Rodando como dono da função elas leem a tabela ignorando RLS, e devolvem só
-- um boolean/texto — nunca expõem linhas inteiras ao chamador.
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- Privilégios de tabela
--
-- As tabelas foram criadas pela role "postgres" (dona), então não herdam
-- automaticamente os GRANTs default que o Supabase configura para anon/
-- authenticated em tabelas criadas via Studio. Concedemos explicitamente para
-- "authenticated" — RLS é quem de fato restringe linha a linha. "anon" não
-- recebe nada: todo o CRM exige sessão.
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- Enable Row Level Security
-- ---------------------------------------------------------------------------

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

-- ===========================================================================
-- users
-- Cada usuário lê/edita o próprio perfil e enxerga colegas dos workspaces de
-- que participa (necessário para "responsável", listas de membros, avatares).
-- INSERT/DELETE ficam só com o trigger handle_new_auth_user (SECURITY DEFINER,
-- ignora RLS) — nenhuma policy de escrita é exposta ao usuário final aqui.
-- ===========================================================================

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

-- ===========================================================================
-- workspaces
-- Membros leem; só admins atualizam/excluem; qualquer autenticado pode criar
-- (o fluxo de onboarding insere o criador como ADMIN logo em seguida).
-- ===========================================================================

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

-- ===========================================================================
-- workspace_members
-- Membros leem a lista; um usuário pode inserir a própria membership (criação
-- de workspace / aceite de convite); só admins alteram papéis e removem
-- membros — e nunca a si mesmos por aqui (regra de negócio do PLAN.md M7).
-- ===========================================================================

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

-- ===========================================================================
-- invites
-- Gestão de convites é exclusiva de admins. O aceite (criar membership +
-- marcar acceptedAt) roda server-side com a service role key — por isso não
-- existe policy permitindo ao convidado ler/editar o próprio convite aqui.
-- ===========================================================================

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

-- ===========================================================================
-- leads — escopo direto por workspaceId
-- ===========================================================================

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

-- ===========================================================================
-- deals — escopo direto por workspaceId
-- ===========================================================================

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

-- ===========================================================================
-- activities — sem workspaceId direto; escopo via lead_workspace_id(leadId)
-- ===========================================================================

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
