import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";

const FREE_LEAD_LIMIT = 50;

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

      if (member.workspace.plan === "FREE") {
        const count = await ctx.db.lead.count({
          where: { workspaceId: member.workspaceId },
        });
        if (count >= FREE_LEAD_LIMIT) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `Plano Free permite no máximo ${FREE_LEAD_LIMIT} leads. Faça upgrade para o plano Pro.`,
          });
        }
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
