import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { canAddLead, FREE_LIMITS } from "@/lib/limits";

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

export const leadsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        workspaceSlug: z.string(),
        search: z.string().optional(),
        status: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const member = await resolveMembership(ctx, input.workspaceSlug);
      return ctx.db.lead.findMany({
        where: {
          workspaceId: member.workspaceId,
          ...(input.status ? { status: input.status } : {}),
          ...(input.search
            ? {
                OR: [
                  { name: { contains: input.search, mode: "insensitive" } },
                  { company: { contains: input.search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ workspaceSlug: z.string(), leadId: z.string() }))
    .query(async ({ ctx, input }) => {
      const member = await resolveMembership(ctx, input.workspaceSlug);
      const lead = await ctx.db.lead.findFirst({
        where: { id: input.leadId, workspaceId: member.workspaceId },
      });
      if (!lead) throw new TRPCError({ code: "NOT_FOUND" });
      return lead;
    }),

  create: protectedProcedure
    .input(
      z.object({
        workspaceSlug: z.string(),
        name: z.string().min(2),
        email: z.string().email().or(z.literal("")).optional(),
        phone: z.string().optional(),
        company: z.string().min(1),
        jobTitle: z.string().optional(),
        status: z.enum(["active", "inactive", "converted"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const member = await resolveMembership(ctx, input.workspaceSlug);

      const allowed = await canAddLead(ctx.db, member.workspaceId, member.workspace.plan);
      if (!allowed) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Plano Free permite no máximo ${FREE_LIMITS.leads} leads. Faça upgrade para o plano Pro.`,
        });
      }

      return ctx.db.lead.create({
        data: {
          workspaceId: member.workspaceId,
          name: input.name,
          email: input.email || null,
          phone: input.phone || null,
          company: input.company,
          jobTitle: input.jobTitle || null,
          status: input.status,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        workspaceSlug: z.string(),
        leadId: z.string(),
        name: z.string().min(2),
        email: z.string().email().or(z.literal("")).optional(),
        phone: z.string().optional(),
        company: z.string().min(1),
        jobTitle: z.string().optional(),
        status: z.enum(["active", "inactive", "converted"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const member = await resolveMembership(ctx, input.workspaceSlug);
      const lead = await ctx.db.lead.findFirst({
        where: { id: input.leadId, workspaceId: member.workspaceId },
      });
      if (!lead) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.db.lead.update({
        where: { id: input.leadId },
        data: {
          name: input.name,
          email: input.email || null,
          phone: input.phone || null,
          company: input.company,
          jobTitle: input.jobTitle || null,
          status: input.status,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ workspaceSlug: z.string(), leadId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const member = await resolveMembership(ctx, input.workspaceSlug);
      const lead = await ctx.db.lead.findFirst({
        where: { id: input.leadId, workspaceId: member.workspaceId },
      });
      if (!lead) throw new TRPCError({ code: "NOT_FOUND" });
      await ctx.db.lead.delete({ where: { id: input.leadId } });
      return { success: true };
    }),
});
