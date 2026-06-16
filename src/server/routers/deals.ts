import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Stage } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";

async function resolveMembership(
  ctx: { db: typeof import("@/server/db").db; user: { id: string } },
  workspaceSlug: string,
) {
  const member = await ctx.db.workspaceMember.findFirst({
    where: { userId: ctx.user.id, workspace: { slug: workspaceSlug } },
    include: { workspace: true },
  });
  if (!member) throw new TRPCError({ code: "NOT_FOUND" });
  return member;
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function serializeDeal(deal: {
  id: string;
  title: string;
  value: { toNumber: () => number } | null;
  stage: Stage;
  ownerId: string;
  dueDate: Date | null;
  leadId: string;
  lead: { name: string; company: string | null };
  owner: { id: string; name: string | null; email: string };
}) {
  return {
    id: deal.id,
    title: deal.title,
    value: deal.value ? deal.value.toNumber() : 0,
    stage: deal.stage,
    ownerId: deal.ownerId,
    ownerName: deal.owner.name ?? deal.owner.email,
    ownerInitials: getInitials(deal.owner.name),
    dueDate: deal.dueDate ? deal.dueDate.toISOString().slice(0, 10) : null,
    leadId: deal.leadId,
    leadName: deal.lead.name,
    company: deal.lead.company ?? "",
  };
}

const dealInclude = {
  lead: { select: { name: true, company: true } },
  owner: { select: { id: true, name: true, email: true } },
} as const;

export const dealsRouter = createTRPCRouter({
  listByWorkspace: protectedProcedure
    .input(z.object({ workspaceSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const member = await resolveMembership(ctx, input.workspaceSlug);
      const deals = await ctx.db.deal.findMany({
        where: { workspaceId: member.workspaceId },
        include: dealInclude,
        orderBy: { createdAt: "asc" },
      });
      return deals.map(serializeDeal);
    }),

  create: protectedProcedure
    .input(
      z.object({
        workspaceSlug: z.string(),
        title: z.string().min(2),
        value: z.number().nonnegative().optional(),
        leadId: z.string().min(1),
        ownerId: z.string().min(1),
        stage: z.nativeEnum(Stage),
        dueDate: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const member = await resolveMembership(ctx, input.workspaceSlug);

      const lead = await ctx.db.lead.findFirst({
        where: { id: input.leadId, workspaceId: member.workspaceId },
      });
      if (!lead) throw new TRPCError({ code: "NOT_FOUND", message: "Lead não encontrado" });

      const ownerMember = await ctx.db.workspaceMember.findFirst({
        where: { workspaceId: member.workspaceId, userId: input.ownerId },
      });
      if (!ownerMember) throw new TRPCError({ code: "BAD_REQUEST", message: "Responsável não é membro deste workspace." });

      const deal = await ctx.db.deal.create({
        data: {
          workspaceId: member.workspaceId,
          leadId: input.leadId,
          ownerId: input.ownerId,
          title: input.title,
          value: input.value,
          stage: input.stage,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
        },
        include: dealInclude,
      });
      return serializeDeal(deal);
    }),

  update: protectedProcedure
    .input(
      z.object({
        workspaceSlug: z.string(),
        dealId: z.string(),
        title: z.string().min(2),
        value: z.number().nonnegative().optional(),
        leadId: z.string().min(1),
        ownerId: z.string().min(1),
        stage: z.nativeEnum(Stage),
        dueDate: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const member = await resolveMembership(ctx, input.workspaceSlug);
      const deal = await ctx.db.deal.findFirst({
        where: { id: input.dealId, workspaceId: member.workspaceId },
      });
      if (!deal) throw new TRPCError({ code: "NOT_FOUND" });

      const ownerMember = await ctx.db.workspaceMember.findFirst({
        where: { workspaceId: member.workspaceId, userId: input.ownerId },
      });
      if (!ownerMember) throw new TRPCError({ code: "BAD_REQUEST", message: "Responsável não é membro deste workspace." });

      const updated = await ctx.db.deal.update({
        where: { id: input.dealId },
        data: {
          title: input.title,
          value: input.value,
          leadId: input.leadId,
          ownerId: input.ownerId,
          stage: input.stage,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
        },
        include: dealInclude,
      });
      return serializeDeal(updated);
    }),

  updateStage: protectedProcedure
    .input(
      z.object({
        workspaceSlug: z.string(),
        dealId: z.string(),
        stage: z.nativeEnum(Stage),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const member = await resolveMembership(ctx, input.workspaceSlug);
      const deal = await ctx.db.deal.findFirst({
        where: { id: input.dealId, workspaceId: member.workspaceId },
      });
      if (!deal) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.db.deal.update({
        where: { id: input.dealId },
        data: { stage: input.stage },
      });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ workspaceSlug: z.string(), dealId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const member = await resolveMembership(ctx, input.workspaceSlug);
      const deal = await ctx.db.deal.findFirst({
        where: { id: input.dealId, workspaceId: member.workspaceId },
      });
      if (!deal) throw new TRPCError({ code: "NOT_FOUND" });
      await ctx.db.deal.delete({ where: { id: input.dealId } });
      return { success: true };
    }),
});
