"use client";

import Link from "next/link";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc/client";

interface WorkspaceSwitcherProps {
  workspaceSlug: string;
}

function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function WorkspaceSwitcher({ workspaceSlug }: WorkspaceSwitcherProps) {
  const { data: workspaces, isLoading } = trpc.workspace.list.useQuery();

  const current = workspaces?.find((ws) => ws.slug === workspaceSlug);
  const others = workspaces?.filter((ws) => ws.slug !== workspaceSlug) ?? [];

  if (isLoading || !current) {
    return (
      <div className="flex items-center gap-2 px-2 h-10">
        <Skeleton className="h-6 w-6 rounded-md" />
        <Skeleton className="h-4 w-28" />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between gap-2 px-2 h-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-pf-accent text-pf-bg text-xs font-bold">
              {initialOf(current.name)}
            </div>
            <span className="truncate text-sm font-medium text-pf-accent">{current.name}</span>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-40" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={4} className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Workspaces
        </DropdownMenuLabel>

        <DropdownMenuItem className="gap-2 cursor-default" disabled>
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary text-xs font-bold">
            {initialOf(current.name)}
          </div>
          <span className="flex-1 truncate text-sm">{current.name}</span>
          <Check className="h-3.5 w-3.5 text-primary" />
        </DropdownMenuItem>

        {others.map((ws) => (
          <DropdownMenuItem key={ws.id} asChild className="gap-2 cursor-pointer">
            <Link href={`/${ws.slug}/dashboard`}>
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground text-xs font-bold">
                {initialOf(ws.name)}
              </div>
              <span className="flex-1 truncate text-sm">{ws.name}</span>
            </Link>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="gap-2 cursor-pointer">
          <Link href="/onboarding">
            <Plus className="h-4 w-4" />
            <span className="text-sm">Novo workspace</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
