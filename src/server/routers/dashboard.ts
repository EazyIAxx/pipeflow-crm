import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";

export const dashboardRouter = createTRPCRouter({
  getMetrics: protectedProcedure
    .input(z.object({ workspaceSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const member = await ctx.db.workspaceMember.findFirst({
        where: { userId: ctx.user.id, workspace: { slug: input.workspaceSlug } },
      });
      if (!member) throw new TRPCError({ code: "NOT_FOUND" });
      const { workspaceId } = member;

      const now = new Date();
      const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const [totalLeads, openDeals, allDeals, dealsByStage, upcomingDeals] =
        await Promise.all([
          ctx.db.lead.count({ where: { workspaceId } }),

          ctx.db.deal.count({
            where: { workspaceId, stage: { notIn: ["WON", "LOST"] } },
          }),

          ctx.db.deal.findMany({
            where: { workspaceId },
            select: { value: true, stage: true },
          }),

          ctx.db.deal.groupBy({
            by: ["stage"],
            where: { workspaceId },
            _count: { id: true },
            _sum: { value: true },
          }),

          ctx.db.deal.findMany({
            where: {
              workspaceId,
              stage: { notIn: ["WON", "LOST"] },
              dueDate: { gte: now, lte: sevenDaysLater },
            },
            include: { lead: { select: { name: true, company: true } } },
            orderBy: { dueDate: "asc" },
            take: 5,
          }),
        ]);

      const pipelineValue = allDeals
        .filter((d) => d.stage !== "WON" && d.stage !== "LOST")
        .reduce((sum, d) => sum + (d.value ? d.value.toNumber() : 0), 0);

      const wonCount = allDeals.filter((d) => d.stage === "WON").length;
      const closedCount = allDeals.filter(
        (d) => d.stage === "WON" || d.stage === "LOST",
      ).length;
      const conversionRate =
        closedCount > 0 ? Math.round((wonCount / closedCount) * 100) : 0;

      return {
        totalLeads,
        openDeals,
        pipelineValue,
        conversionRate,
        dealsByStage: dealsByStage.map((g) => ({
          stage: g.stage,
          count: g._count.id,
          value: g._sum.value ? g._sum.value.toNumber() : 0,
        })),
        upcomingDeals: upcomingDeals.map((d) => ({
          id: d.id,
          title: d.title,
          leadName: d.lead.name,
          company: d.lead.company ?? "",
          dueDate: d.dueDate!.toISOString().slice(0, 10),
          value: d.value ? d.value.toNumber() : 0,
        })),
      };
    }),
});
