"use client";

import { useState } from "react";
import { Loader2, MoreHorizontal, Shield, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Role } from "@prisma/client";
import { trpc } from "@/lib/trpc/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InviteMemberDialog } from "./InviteMemberDialog";

function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function RoleBadge({ role }: { role: Role }) {
  if (role === "ADMIN") {
    return (
      <Badge className="gap-1 bg-pf-accent/20 text-[#5C7500] dark:text-pf-accent border-pf-accent/30 hover:bg-pf-accent/20">
        <Shield className="h-3 w-3" />
        Admin
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      Membro
    </Badge>
  );
}

interface MembersListProps {
  workspaceSlug: string;
  currentUserId: string;
  isAdmin: boolean;
  plan: "FREE" | "PRO" | "PAYMENT_FAILED";
}

export function MembersList({ workspaceSlug, currentUserId, isAdmin, plan }: MembersListProps) {
  const utils = trpc.useUtils();
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const { data: members = [], isLoading: membersLoading } = trpc.workspace.getMembers.useQuery(
    { slug: workspaceSlug },
    { staleTime: 0 },
  );

  const { data: pendingInvites = [], isLoading: invitesLoading } =
    trpc.workspace.getPendingInvites.useQuery(
      { workspaceSlug },
      { enabled: isAdmin, retry: false, staleTime: 0 },
    );

  const removeMutation = trpc.workspace.removeMember.useMutation({
    onMutate: ({ userId }) => setPendingAction(userId),
    onSuccess: () => toast.success("Membro removido com sucesso."),
    onError: (err) => toast.error(err.message ?? "Erro ao remover membro."),
    onSettled: () => {
      setPendingAction(null);
      utils.workspace.getMembers.invalidate({ slug: workspaceSlug });
    },
  });

  const roleMutation = trpc.workspace.updateMemberRole.useMutation({
    onMutate: ({ userId }) => setPendingAction(userId),
    onSuccess: () => toast.success("Papel atualizado com sucesso."),
    onError: (err) => toast.error(err.message ?? "Erro ao atualizar papel."),
    onSettled: () => {
      setPendingAction(null);
      utils.workspace.getMembers.invalidate({ slug: workspaceSlug });
    },
  });

  const cancelInviteMutation = trpc.workspace.cancelInvite.useMutation({
    onMutate: ({ inviteId }) => setPendingAction(inviteId),
    onSuccess: () => toast.success("Convite cancelado."),
    onError: (err) => toast.error(err.message ?? "Erro ao cancelar convite."),
    onSettled: () => {
      setPendingAction(null);
      utils.workspace.getPendingInvites.invalidate({ workspaceSlug });
    },
  });

  const freeLimitReached = plan === "FREE" && members.length >= 2;
  const memberLimit = plan === "FREE" ? "2" : "∞";

  return (
    <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold">Membros</span>
        <Badge variant="secondary" className="ml-auto text-xs">
          {membersLoading ? "…" : members.length} / {memberLimit}
          {plan === "FREE" && " (Free)"}
        </Badge>
      </div>

      {/* Members table */}
      {membersLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-44" />
              </div>
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {members.map((member) => {
            const isSelf = member.id === currentUserId;
            const isPending = pendingAction === member.id;
            return (
              <div key={member.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                  {getInitials(member.name, member.email)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {member.name ?? member.email}
                    {isSelf && <span className="ml-1.5 text-xs text-muted-foreground">(você)</span>}
                  </p>
                  {member.name && (
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  )}
                </div>
                <RoleBadge role={member.role} />
                {isAdmin && !isSelf && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" disabled={isPending}>
                        {isPending
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <MoreHorizontal className="h-3.5 w-3.5" />}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {member.role === "MEMBER" ? (
                        <DropdownMenuItem
                          onClick={() => roleMutation.mutate({ workspaceSlug, userId: member.id, role: "ADMIN" })}
                        >
                          <Shield className="h-3.5 w-3.5 mr-2" />
                          Tornar Admin
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => roleMutation.mutate({ workspaceSlug, userId: member.id, role: "MEMBER" })}
                        >
                          Tornar Membro
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => removeMutation.mutate({ workspaceSlug, userId: member.id })}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Remover membro
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Invite button */}
      {isAdmin && (
        <div className="flex flex-col gap-2 pt-1 border-t border-border">
          <InviteMemberDialog
            workspaceSlug={workspaceSlug}
            onSuccess={() => utils.workspace.getPendingInvites.invalidate({ workspaceSlug })}
            disabled={freeLimitReached}
          />
          {freeLimitReached && (
            <p className="text-xs text-muted-foreground">
              Limite de 2 colaboradores atingido no plano Free.{" "}
              <span className="font-medium">Faça upgrade para adicionar mais.</span>
            </p>
          )}
        </div>
      )}

      {/* Pending invites */}
      {isAdmin && !invitesLoading && pendingInvites.length > 0 && (
        <div className="flex flex-col gap-2 pt-1 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Convites pendentes
          </p>
          {pendingInvites.map((invite) => (
            <div key={invite.id} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
                {invite.email.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{invite.email}</p>
                <p className="text-xs text-muted-foreground">
                  {invite.role === "ADMIN" ? "Admin" : "Membro"} · expira{" "}
                  {new Date(invite.expiresAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <Badge variant="outline" className="text-xs shrink-0">Pendente</Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                disabled={pendingAction === invite.id}
                onClick={() => cancelInviteMutation.mutate({ workspaceSlug, inviteId: invite.id })}
              >
                {pendingAction === invite.id
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Trash2 className="h-3.5 w-3.5" />}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
