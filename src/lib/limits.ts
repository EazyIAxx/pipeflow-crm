import type { PrismaClient } from "@prisma/client";

export const FREE_LIMITS = {
  leads: 50,
  members: 2,
} as const;

export async function canAddLead(
  db: PrismaClient,
  workspaceId: string,
  plan: string,
): Promise<boolean> {
  if (plan !== "FREE") return true;
  const count = await db.lead.count({ where: { workspaceId } });
  return count < FREE_LIMITS.leads;
}

export async function canAddMember(
  db: PrismaClient,
  workspaceId: string,
  plan: string,
): Promise<boolean> {
  if (plan !== "FREE") return true;
  const count = await db.workspaceMember.count({ where: { workspaceId } });
  return count < FREE_LIMITS.members;
}
