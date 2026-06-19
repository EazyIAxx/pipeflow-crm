import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { createClient } from "@/lib/supabase/server";
import { acceptInvite } from "./actions";
import { AutoAcceptForm } from "./AutoAcceptForm";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;

  const invite = await db.invite.findUnique({
    where: { token },
    include: { workspace: true },
  });

  // Invalid / expired / already used
  if (!invite) {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-4">
        <XCircle className="h-12 w-12 text-destructive opacity-80" />
        <h2 className="text-lg font-bold text-pf-text font-pf-display">Convite inválido</h2>
        <p className="text-sm text-pf-text-secondary">
          Este link de convite não existe ou já foi utilizado.
        </p>
        <Link
          href="/login"
          className="text-sm font-medium text-pf-accent hover:underline"
        >
          Ir para o login
        </Link>
      </div>
    );
  }

  if (invite.expiresAt < new Date()) {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-4">
        <XCircle className="h-12 w-12 text-destructive opacity-80" />
        <h2 className="text-lg font-bold text-pf-text font-pf-display">Convite expirado</h2>
        <p className="text-sm text-pf-text-secondary">
          Este convite expirou em{" "}
          {invite.expiresAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}.
          <br />
          Peça ao administrador do workspace para enviar um novo convite.
        </p>
        <Link href="/login" className="text-sm font-medium text-pf-accent hover:underline">
          Ir para o login
        </Link>
      </div>
    );
  }

  if (invite.acceptedAt) {
    // Se o usuário está logado e ainda é membro, redireciona direto ao workspace
    const supabaseCheck = await createClient();
    const { data: { user: currentUser } } = await supabaseCheck.auth.getUser();
    if (currentUser) {
      const membership = await db.workspaceMember.findFirst({
        where: { workspaceId: invite.workspaceId, userId: currentUser.id },
      });
      if (membership) {
        redirect(`/${invite.workspace.slug}/dashboard`);
      }
    }

    return (
      <div className="flex flex-col items-center gap-4 text-center py-4">
        <CheckCircle2 className="h-12 w-12 text-green-500 opacity-80" />
        <h2 className="text-lg font-bold text-pf-text font-pf-display">Convite já utilizado</h2>
        <p className="text-sm text-pf-text-secondary">
          Este link de convite já foi usado anteriormente.
          <br />
          Se você foi removido do workspace, peça ao administrador um novo convite.
        </p>
        <Link href="/login" className="text-sm font-medium text-pf-accent hover:underline">
          Fazer login
        </Link>
      </div>
    );
  }

  // Check if user is logged in
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const roleLabel = invite.role === "ADMIN" ? "Administrador" : "Membro";

  return (
    <div className="flex flex-col gap-6">
      {/* Workspace card */}
      <div className="rounded-xl border border-pf-border bg-pf-surface p-6 flex flex-col items-center gap-3 text-center">
        <div className="h-14 w-14 rounded-2xl bg-pf-accent flex items-center justify-center text-pf-bg font-bold text-xl">
          {getInitials(invite.workspace.name)}
        </div>
        <div>
          <p className="text-xs text-pf-text-muted uppercase tracking-widest font-pf-mono mb-1">
            Você foi convidado para
          </p>
          <h2 className="text-xl font-bold text-pf-text font-pf-display">
            {invite.workspace.name}
          </h2>
          <p className="text-sm text-pf-text-secondary mt-1">
            Papel:{" "}
            <span className="font-medium text-pf-text">{roleLabel}</span>
          </p>
        </div>
      </div>

      {/* Action */}
      {user && user.email?.toLowerCase() === invite.email.toLowerCase() ? (
        // Correct account → auto-accept on mount
        <AutoAcceptForm action={acceptInvite.bind(null, token)} userEmail={user.email!} />
      ) : (
        // Not logged in OR wrong account → prompt login/signup
        <div className="flex flex-col gap-3">
          {user && (
            <div className="rounded-xl border border-pf-accent/30 bg-pf-accent/10 px-4 py-3 text-sm text-center">
              <p className="text-pf-text-secondary">
                Este convite é para{" "}
                <span className="font-semibold text-pf-text">{invite.email}</span>
                , mas você está logado como{" "}
                <span className="font-semibold text-pf-text">{user.email}</span>.
              </p>
            </div>
          )}
          {!user && (
            <p className="text-sm text-pf-text-secondary text-center">
              Para aceitar o convite, faça login ou crie uma conta com{" "}
              <span className="font-semibold text-pf-text">{invite.email}</span>.
            </p>
          )}
          <Link
            href={
              user
                ? `/api/auth/switch?next=/invite/${token}&email=${encodeURIComponent(invite.email)}`
                : `/login?next=/invite/${token}&email=${encodeURIComponent(invite.email)}`
            }
            className="w-full rounded-xl bg-pf-accent py-3 font-pf-body font-semibold text-pf-bg text-sm text-center transition-opacity hover:opacity-90 block"
          >
            {user ? `Entrar como ${invite.email}` : "Fazer login para aceitar"}
          </Link>
          <Link
            href={`/signup?next=/invite/${token}&email=${encodeURIComponent(invite.email)}`}
            className="w-full rounded-xl border border-pf-border bg-pf-surface py-3 font-pf-body font-semibold text-pf-text text-sm text-center transition-colors hover:bg-pf-surface-2 block"
          >
            Criar conta
          </Link>
        </div>
      )}

      {/* Expiry notice */}
      <p className="text-xs text-pf-text-muted text-center">
        Convite válido até{" "}
        {invite.expiresAt.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </p>
    </div>
  );
}
