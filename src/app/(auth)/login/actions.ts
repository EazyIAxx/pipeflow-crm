"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db";

export async function resolvePostLoginRedirect(): Promise<string> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return "/login";
    }

    const membership = await db.workspaceMember.findFirst({
      where: { userId: user.id },
      include: { workspace: true },
      orderBy: { joinedAt: "asc" },
    });

    return membership ? `/${membership.workspace.slug}/dashboard` : "/onboarding";
  } catch {
    return "/onboarding";
  }
}
