"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db";

// token is pre-bound via acceptInvite.bind(null, token) in the page
export async function acceptInvite(token: string, _formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/invite/${token}`);
  }

  const invite = await db.invite.findUnique({
    where: { token },
    include: { workspace: true },
  });

  if (!invite || invite.expiresAt < new Date() || invite.acceptedAt) {
    redirect(`/invite/${token}?error=invalid`);
  }

  // Upsert user record (may have just signed up)
  await db.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email!,
      name:
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        null,
    },
    update: {},
  });

  // Idempotent: already a member → just redirect
  const existing = await db.workspaceMember.findFirst({
    where: { workspaceId: invite.workspaceId, userId: user.id },
  });

  if (!existing) {
    await db.workspaceMember.create({
      data: {
        workspaceId: invite.workspaceId,
        userId: user.id,
        role: invite.role,
      },
    });
  }

  await db.invite.update({
    where: { id: invite.id },
    data: { acceptedAt: new Date() },
  });

  redirect(`/${invite.workspace.slug}/dashboard`);
}
