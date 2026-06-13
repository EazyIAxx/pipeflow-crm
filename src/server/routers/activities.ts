import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";

async function resolveLeadInWorkspace(
  ctx: { db: typeof import("@/server/db").db; user: { id: string } },
  workspaceSlug: string,
  leadId: string,
) {
  const member = await ctx.db.workspaceMember.findFirst({
    where: { userId: ctx.user.id, workspace: { slug: workspaceSlug } },
    include: { workspace: true },
  });
  if (!member) throw new TRPCError({ code: "NOT_FOUND" });

  const lead = await ctx.db.lead.findFirst({
    where: { id: leadId, workspaceId: member.workspaceId },
  });
  if (!lead) throw new TRPCError({ code: "NOT_FOUND" });

  return { member, lead };
}

function serializeActivity(activity: {
  id: string;
  leadId: string;
  type: "CALL" | "EMAIL" | "MEETING" | "NOTE";
  description: string;
  date: Date;
  author: { name: string | null; email: string };
}) {
  return {
    id: activity.id,
    leadId: activity.leadId,
    type: activity.type,
    description: activity.description,
    date: activity.date,
    authorName: activity.author.name ?? activity.author.email,
  };
}

export const activitiesRouter = createTRPCRouter({
  listByLead: protectedProcedure
    .input(z.object({ workspaceSlug: z.string(), leadId: z.string() }))
    .query(async ({ ctx, input }) => {
      await resolveLeadInWorkspace(ctx, input.workspaceSlug, input.leadId);
      const activities = await ctx.db.activity.findMany({
        where: { leadId: input.leadId },
        include: { author: { select: { name: true, email: true } } },
        orderBy: { date: "desc" },
      });
      return activities.map(serializeActivity);
    }),

  create: protectedProcedure
    .input(
      z.object({
        workspaceSlug: z.string(),
        leadId: z.string(),
        type: z.enum(["CALL", "EMAIL", "MEETING", "NOTE"]),
        description: z.string().min(1),
        date: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await resolveLeadInWorkspace(ctx, input.workspaceSlug, input.leadId);
      const activity = await ctx.db.activity.create({
        data: {
          leadId: input.leadId,
          authorId: ctx.user.id,
          type: input.type,
          description: input.description,
          date: new Date(input.date),
        },
        include: { author: { select: { name: true, email: true } } },
      });
      return serializeActivity(activity);
    }),
});
