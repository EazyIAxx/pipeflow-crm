"use client";

import { CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc/client";
import { WorkspaceSettings } from "@/components/settings/WorkspaceSettings";
import { MembersList } from "@/components/settings/MembersList";

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

      {/* Billing — placeholder M8 */}
      <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Plano</span>
          <Badge className="ml-auto text-xs">
            {workspace?.plan ?? "Free"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {workspace?.plan === "PRO"
            ? "Plano Pro ativo — colaboradores e leads ilimitados."
            : "Plano Free — até 2 colaboradores e 50 leads."}
        </p>
        {workspace?.plan !== "PRO" && (
          <Button size="sm" className="w-fit" disabled>
            Fazer upgrade — em breve
          </Button>
        )}
      </div>
    </div>
  );
}
