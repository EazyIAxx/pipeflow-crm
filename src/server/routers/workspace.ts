import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";

export const workspaceRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const memberships = await ctx.db.workspaceMember.findMany({
      where: { userId: ctx.user.id },
      include: { workspace: true },
      orderBy: { joinedAt: "asc" },
    });

    return memberships.map((member) => ({
      id: member.workspace.id,
      name: member.workspace.name,
      slug: member.workspace.slug,
      role: member.role,
    }));
  }),

  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const membership = await ctx.db.workspaceMember.findFirst({
        where: { userId: ctx.user.id, workspace: { slug: input.slug } },
        include: { workspace: true },
      });

      if (!membership) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return {
        id: membership.workspace.id,
        name: membership.workspace.name,
        slug: membership.workspace.slug,
        plan: membership.workspace.plan,
        role: membership.role,
      };
    }),

  getMembers: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const membership = await ctx.db.workspaceMember.findFirst({
        where: { userId: ctx.user.id, workspace: { slug: input.slug } },
        include: { workspace: true },
      });
      if (!membership) throw new TRPCError({ code: "NOT_FOUND" });

      const members = await ctx.db.workspaceMember.findMany({
        where: { workspaceId: membership.workspaceId },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { joinedAt: "asc" },
      });

      return members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
      }));
    }),
});
