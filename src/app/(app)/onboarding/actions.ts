"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db";

export async function createWorkspace(name: string, slug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const existing = await db.workspace.findUnique({ where: { slug } });
  if (existing) {
    return { error: "Este endereço já está em uso. Escolha outro." };
  }

  await db.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.full_name ?? null,
    },
    update: {},
  });

  const workspace = await db.workspace.create({
    data: {
      name,
      slug,
      members: {
        create: { userId: user.id, role: "ADMIN" },
      },
    },
  });

  redirect(`/${workspace.slug}/dashboard`);
}
