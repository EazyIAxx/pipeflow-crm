-- =============================================================================
-- Sincronização auth.users -> public.users
--
-- O Supabase Auth é o provedor de identidade; toda conta criada lá precisa de
-- uma linha correspondente em public.users (FK de deals.ownerId e
-- activities.authorId). Este trigger garante o upsert no momento do signup,
-- complementando o upsert feito em src/app/(app)/onboarding/actions.ts.
--
-- SECURITY DEFINER: a função roda com os privilégios de quem a criou (postgres,
-- dono da tabela), ignorando RLS — necessário porque o usuário recém-criado
-- ainda não tem permissão própria para inserir em public.users.
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

-- ---------------------------------------------------------------------------
-- Mantém o e-mail sincronizado caso o usuário troque no Supabase Auth
-- (ex.: fluxo de "alterar e-mail" com confirmação).
-- ---------------------------------------------------------------------------

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
