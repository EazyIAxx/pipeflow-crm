"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db";
import { getOrCreateCustomer, createCheckoutSession, createPortalSession } from "@/lib/stripe";

async function resolveAdminWorkspace(workspaceSlug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const member = await db.workspaceMember.findFirst({
    where: { userId: user.id, workspace: { slug: workspaceSlug }, role: "ADMIN" },
    include: {
      workspace: true,
      user: { select: { email: true, name: true } },
    },
  });
  if (!member) redirect(`/${workspaceSlug}/settings`);
  return member;
}

export async function startCheckoutAction(workspaceSlug: string) {
  const member = await resolveAdminWorkspace(workspaceSlug);
  const { workspace } = member;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const customerId = await getOrCreateCustomer({
    existingCustomerId: workspace.stripeCustomerId,
    email: member.user.email,
    name: workspace.name,
    workspaceId: workspace.id,
  });

  if (!workspace.stripeCustomerId) {
    await db.workspace.update({
      where: { id: workspace.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const session = await createCheckoutSession({
    workspaceId: workspace.id,
    customerId,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    successUrl: `${appUrl}/${workspaceSlug}/settings?upgrade=success`,
    cancelUrl: `${appUrl}/${workspaceSlug}/settings`,
  });

  redirect(session.url!);
}

export async function openPortalAction(workspaceSlug: string) {
  const member = await resolveAdminWorkspace(workspaceSlug);
  const { workspace } = member;

  if (!workspace.stripeCustomerId) {
    redirect(`/${workspaceSlug}/settings`);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const session = await createPortalSession({
    customerId: workspace.stripeCustomerId,
    returnUrl: `${appUrl}/${workspaceSlug}/settings`,
  });

  redirect(session.url);
}
