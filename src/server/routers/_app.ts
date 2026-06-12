import { createTRPCRouter } from "@/server/trpc";
import { workspaceRouter } from "@/server/routers/workspace";

export const appRouter = createTRPCRouter({
  workspace: workspaceRouter,
});

export type AppRouter = typeof appRouter;
