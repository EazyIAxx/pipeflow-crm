"use client";

import { useRouter } from "next/navigation";
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

const MOCK_WORKSPACES = [
  { id: "1", name: "Acme Corp", slug: "acme-corp" },
  { id: "2", name: "Startup XYZ", slug: "startup-xyz" },
];

interface WorkspaceSwitcherProps {
  workspaceSlug: string;
}

export function WorkspaceSwitcher({ workspaceSlug }: WorkspaceSwitcherProps) {
  const router = useRouter();
  const current =
    MOCK_WORKSPACES.find((w) => w.slug === workspaceSlug) ??
    MOCK_WORKSPACES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between gap-2 px-2 h-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
              {current.name[0]}
            </div>
            <span className="truncate text-sm font-medium">{current.name}</span>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-40" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={4} className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Workspaces
        </DropdownMenuLabel>
        {MOCK_WORKSPACES.map((ws) => (
          <DropdownMenuItem
            key={ws.id}
            className="gap-2 cursor-pointer"
            onSelect={() => {
              if (ws.slug !== current.slug) {
                router.push(`/${ws.slug}/dashboard`);
              }
            }}
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary text-xs font-bold">
              {ws.name[0]}
            </div>
            <span className="flex-1 truncate text-sm">{ws.name}</span>
            {ws.slug === current.slug && (
              <Check className="h-3.5 w-3.5 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 cursor-pointer text-muted-foreground">
          <Plus className="h-4 w-4" />
          <span className="text-sm">Novo workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
