"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc/client";
import { WorkspaceSettings } from "@/components/settings/WorkspaceSettings";
import { MembersList } from "@/components/settings/MembersList";
import { BillingCard } from "@/components/settings/BillingCard";

interface SettingsPageProps {
  params: { workspaceSlug: string };
}

export default function SettingsPage({ params }: SettingsPageProps) {
  const { workspaceSlug } = params;

  const { data: workspace, isLoading } = trpc.workspace.getBySlug.useQuery({
    slug: workspaceSlug,
  });

  const isAdmin = workspace?.role === "ADMIN";

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Configurações</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gerencie seu workspace, membros e plano.
        </p>
      </div>

      {/* Workspace section */}
      {isLoading ? (
        <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-8 w-20" />
        </div>
      ) : (
        <WorkspaceSettings
          workspaceSlug={workspaceSlug}
          initialName={workspace?.name ?? ""}
          isAdmin={isAdmin}
        />
      )}

      {/* Members section */}
      {isLoading ? (
        <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <MembersList
          workspaceSlug={workspaceSlug}
          currentUserId={workspace?.currentUserId ?? ""}
          isAdmin={isAdmin}
          plan={workspace?.plan ?? "FREE"}
        />
      )}

      {/* Billing */}
      {isLoading ? (
        <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-36" />
        </div>
      ) : (
        <BillingCard
          workspaceSlug={workspaceSlug}
          plan={workspace?.plan ?? "FREE"}
          planExpiresAt={workspace?.planExpiresAt ?? null}
          hasActiveSubscription={workspace?.hasActiveSubscription ?? false}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
