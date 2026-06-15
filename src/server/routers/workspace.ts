import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Role } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { sendInviteEmail } from "@/lib/email";

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

async function resolveAdminMembership(
  ctx: { db: typeof import("@/server/db").db; user: { id: string } },
  workspaceSlug: string,
) {
  const member = await resolveMembership(ctx, workspaceSlug);
  if (member.role !== "ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Apenas administradores podem realizar esta ação.",
    });
  }
  return member;
}

export const workspaceRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const memberships = await ctx.db.workspaceMember.findMany({
      where: { userId: ctx.user.id },
      include: { workspace: true },
      orderBy: { joinedAt: "asc" },
    });
    return memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      slug: m.workspace.slug,
      role: m.role,
    }));
  }),

  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const membership = await ctx.db.workspaceMember.findFirst({
        where: { userId: ctx.user.id, workspace: { slug: input.slug } },
        include: { workspace: true },
      });
      if (!membership) throw new TRPCError({ code: "NOT_FOUND" });
      return {
        id: membership.workspace.id,
        name: membership.workspace.name,
        slug: membership.workspace.slug,
        plan: membership.workspace.plan,
        role: membership.role,
        currentUserId: ctx.user.id,
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

  update: protectedProcedure
    .input(z.object({ workspaceSlug: z.string(), name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres") }))
    .mutation(async ({ ctx, input }) => {
      const member = await resolveAdminMembership(ctx, input.workspaceSlug);
      const updated = await ctx.db.workspace.update({
        where: { id: member.workspaceId },
        data: { name: input.name },
      });
      return { name: updated.name, slug: updated.slug };
    }),

  invite: protectedProcedure
    .input(
      z.object({
        workspaceSlug: z.string(),
        email: z.string().email("E-mail inválido"),
        role: z.nativeEnum(Role).default("MEMBER"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const member = await resolveAdminMembership(ctx, input.workspaceSlug);

      // Free plan: max 2 members total (existing + pending accepted)
      if (member.workspace.plan === "FREE") {
        const memberCount = await ctx.db.workspaceMember.count({
          where: { workspaceId: member.workspaceId },
        });
        if (memberCount >= 2) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              "O plano Free permite no máximo 2 colaboradores. Faça upgrade para convidar mais pessoas.",
          });
        }
      }

      const emailLower = input.email.toLowerCase();

      // Already a member?
      const existingUser = await ctx.db.user.findUnique({ where: { email: emailLower } });
      if (existingUser) {
        const alreadyMember = await ctx.db.workspaceMember.findFirst({
          where: { workspaceId: member.workspaceId, userId: existingUser.id },
        });
        if (alreadyMember) {
          throw new TRPCError({ code: "CONFLICT", message: "Este usuário já é membro do workspace." });
        }
      }

      // Already has pending invite?
      const pendingInvite = await ctx.db.invite.findFirst({
        where: {
          workspaceId: member.workspaceId,
          email: emailLower,
          acceptedAt: null,
          expiresAt: { gt: new Date() },
        },
      });
      if (pendingInvite) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Já existe um convite pendente para este e-mail.",
        });
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const invite = await ctx.db.invite.create({
        data: {
          workspaceId: member.workspaceId,
          email: emailLower,
          role: input.role,
          expiresAt,
        },
      });

      const inviter = await ctx.db.user.findUnique({ where: { id: ctx.user.id } });
      const inviterName = inviter?.name ?? ctx.user.email ?? "Alguém";
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

      try {
        const result = await sendInviteEmail({
          to: input.email,
          workspaceName: member.workspace.name,
          inviterName,
          inviteUrl: `${appUrl}/invite/${invite.token}`,
        });
        if (result.error) {
          console.error("[invite] Resend rejected email:", JSON.stringify(result.error));
        } else {
          console.log("[invite] email sent:", result.data?.id);
        }
      } catch (err) {
        console.error("[invite] failed to send email:", err);
      }

      return { id: invite.id };
    }),

  getPendingInvites: protectedProcedure
    .input(z.object({ workspaceSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const member = await resolveAdminMembership(ctx, input.workspaceSlug);
      const invites = await ctx.db.invite.findMany({
        where: {
          workspaceId: member.workspaceId,
          acceptedAt: null,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
      });
      return invites.map((inv) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        expiresAt: inv.expiresAt.toISOString(),
      }));
    }),

  cancelInvite: protectedProcedure
    .input(z.object({ workspaceSlug: z.string(), inviteId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const member = await resolveAdminMembership(ctx, input.workspaceSlug);
      const invite = await ctx.db.invite.findFirst({
        where: { id: input.inviteId, workspaceId: member.workspaceId },
      });
      if (!invite) throw new TRPCError({ code: "NOT_FOUND" });
      await ctx.db.invite.delete({ where: { id: input.inviteId } });
      return { success: true };
    }),

  removeMember: protectedProcedure
    .input(z.object({ workspaceSlug: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const member = await resolveAdminMembership(ctx, input.workspaceSlug);
      if (input.userId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Você não pode remover a si mesmo." });
      }
      const target = await ctx.db.workspaceMember.findFirst({
        where: { workspaceId: member.workspaceId, userId: input.userId },
      });
      if (!target) throw new TRPCError({ code: "NOT_FOUND" });
      await ctx.db.workspaceMember.delete({
        where: {
          workspaceId_userId: { workspaceId: member.workspaceId, userId: input.userId },
        },
      });
      return { success: true };
    }),

  updateMemberRole: protectedProcedure
    .input(
      z.object({
        workspaceSlug: z.string(),
        userId: z.string(),
        role: z.nativeEnum(Role),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const member = await resolveAdminMembership(ctx, input.workspaceSlug);
      if (input.userId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Você não pode alterar seu próprio papel." });
      }
      const target = await ctx.db.workspaceMember.findFirst({
        where: { workspaceId: member.workspaceId, userId: input.userId },
      });
      if (!target) throw new TRPCError({ code: "NOT_FOUND" });
      await ctx.db.workspaceMember.update({
        where: {
          workspaceId_userId: { workspaceId: member.workspaceId, userId: input.userId },
        },
        data: { role: input.role },
      });
      return { success: true };
    }),
});
