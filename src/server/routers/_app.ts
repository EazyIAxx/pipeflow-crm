import { createTRPCRouter } from "@/server/trpc";

export const appRouter = createTRPCRouter({});

export type AppRouter = typeof appRouter;
