import { createTRPCRouter } from "@/server/trpc";
import { workspaceRouter } from "@/server/routers/workspace";
import { leadsRouter } from "@/server/routers/leads";
import { activitiesRouter } from "@/server/routers/activities";
import { dealsRouter } from "@/server/routers/deals";
import { dashboardRouter } from "@/server/routers/dashboard";

export const appRouter = createTRPCRouter({
  workspace: workspaceRouter,
  leads: leadsRouter,
  activities: activitiesRouter,
  deals: dealsRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
